import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloludinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Task } from "../models/tasks.model.js"
import createError from "../utils/createError.js"
import { ErrResponse } from "../utils/ErrResponse.js"
import moment from 'moment';

const generateAccessAndRefershTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        console.log("user", user);
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "something went worng while generating refresh and access tokens")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    // console.log("req",req.body);
    const { fullName, email, password, confirmPassword } = req.body
    // console.log("email", email);
    // console.log("fullName", fullName);
    // console.log("password", password);
    // console.log("confirmPassword", confirmPassword);
    if (
        [fullName, email, password, confirmPassword].some((field) =>
            field?.trim() === ""
        )
    ) {
        res.status(400).json({ message: "All fields are required!" });
        return;
    }
    if (password !== confirmPassword) {
        res.status(400).json({ message: "Password and confirm password are not same!" });
        return;
    }

    const existedUser = await User.findOne({ email })
    // console.log("existedUser",existedUser);
    if (existedUser) {
        res.status(409).json({ message: "User with email already exists!" });
        return;
    }
    const user = await User.create({
        fullName,
        email,
        password,
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )
})

const loginUser = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ message: "Email and password are required" });
        return;
    }
    const user = await User.findOne({ email });
    if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
    }
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        res.status(404).json({ message: "Invalid email or password" });
    }
    const { accessToken, refreshToken } = await generateAccessAndRefershTokens(user._id);
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
    const options = {
        httpOnly: true,
        secure: true
    };
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                },
                "User logged in successfully"
            )
        );
});


const logoutUser = asyncHandler(async (req, res) => {
    // console.log("rew from logout",logoutUser);
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )
    // console.log("user from logout",user);
    const options = {
        httpOnly: true,
        secure: true
    }
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }
    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
        }
        const options = {
            httpOnly: true,
            secure: true
        }
        const { accessToken, newRefreshToken } = await generateAccessAndRefershTokens(user._id)
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword, fullName } = req.body
    if (!fullName || !oldPassword || !newPassword) {
        res.status(400).json({ message: "All fields are required" });
        return;
    }
    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    if (!isPasswordCorrect) {
        res.status(400).json({ message: "Invalid old password" });
        return;
    }
    user.fullName = fullName
    user.password = newPassword
    await user.save({ validateBeforeSave: false })
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"))
})

const getCurrentUser = asyncHandler(async (req, res) => {
    // console.log("req from getCurrentuser bfdh", req.user);
    return res
        .status(200)
        .json(new ApiResponse(
            200,
            req.user,
            "User fetched successfully"
        ))
})




// tasks 

const createTask = asyncHandler(async (req, res) => {
    console.log("req body", req.body); // form data
    const { title, priority, dueDate, subTodos, complete } = req.body;
    const userId = req.body.user._id
    if (!userId) {
        throw new ApiError(500, "User not found in request");
    }
    const task = await Task.create({
        title,
        priority,
        dueDate: dueDate ? dueDate : "",
        subTodos,
        complete: complete ? complete : "",
        createdBy: userId
    });
    const createdTask = await Task.findById(task._id);
    if (!createdTask) {
        throw new ApiError(500, "Something went wrong while adding task");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, createdTask, "Task saved successfully"))
});


const getSharedTaskData = asyncHandler(async (req, res) => {
    console.log("elllo")
    console.log(req.params)
    const taskID = req.params.sharedTaskId
    const sharedTask = await Task.findById(taskID);
    console.log("sharedTask", sharedTask);
    if (!sharedTask) {
        res.status(404).json({ message: "Not found" });
        return;
    }
    return res
        .status(200)
        .json(new ApiResponse(200, sharedTask, "Shared Task find successfully"))
}

)


//   const getCurrentUserTasksInToDo = asyncHandler(async(req, res) => {
//     console.log("-----------",req.user,"user from task");
//     // const tasks = await Task.find({ createdBy: req.user._id });
//     const tasks = await Task.find({ createdBy: req.user._id, complete: 'TO-DO' });
//     return res
//         .status(200)
//         .json(new ApiResponse(
//             200,
//             tasks,
//             "tasks fetched successfully"
//         ))

// })
const getCurrentUserTasksInToDo = asyncHandler(async (req, res) => {
    console.log("hii");
    console.log("-----------",req.user,"user from task");
    // const tasks = await Task.find({ createdBy: req.user._id });
    let filteredTasks = [];

    const tasks = await Task.find({ createdBy: req.user._id });
    const startOfWeek = moment().startOf('week');
    const endOfWeek = moment().endOf('week');
    filteredTasks = tasks.filter(task => {
        const createdAt = moment(task.createdAt);
        return createdAt.isBetween(startOfWeek, endOfWeek);
    });
    console.log("filteredTasks",filteredTasks);
    return res
        .status(200)
        .json(new ApiResponse(
            200,
           filteredTasks,
            "tasks fetched successfully"
        ))

})

const getSortedByData = asyncHandler(async (req, res) => {
    // console.log("from sort");
    // console.log(req.user, "req");
    // console.log(req.params, "paramas");

    let filteredTasks = [];
    const tasks = await Task.find({ createdBy: req.user._id });
    if (req.params.sortedBy === 'Today') {
        // console.log("iside today");
        const todayStart = moment().startOf('day');
        const todayEnd = moment().endOf('day');
        filteredTasks = tasks.filter(task => {
            const createdAt = moment(task.createdAt);
            return createdAt.isBetween(todayStart, todayEnd);
        });
        // console.log(filteredTasks, "filteredTasks");

    } else if (req.params.sortedBy === 'This Week') {
        // console.log("iside week");
        const startOfWeek = moment().startOf('week');
        const endOfWeek = moment().endOf('week');
        filteredTasks = tasks.filter(task => {
            const createdAt = moment(task.createdAt);
            return createdAt.isBetween(startOfWeek, endOfWeek);
        });
        // console.log(filteredTasks, "filteredTasks week");
    } else if (req.params.sortedBy === 'This Month') {
        // console.log("iside Month");
        const startOfMonth = moment().startOf('month');
        const endOfMonth = moment().endOf('month');
        filteredTasks = tasks.filter(task => {
            const createdAt = moment(task.createdAt);
            return createdAt.isBetween(startOfMonth, endOfMonth);
        });
        // console.log(filteredTasks, "filteredTasks");
    } else {
        // Invalid sortBy value
        return res.status(400).json({ message: 'Invalid sortBy value' });
    }
    return res
        .status(200)
        .json(new ApiResponse(
            200,
            filteredTasks,
            "task sorted successfully"
        ))



});

const deleteTask = asyncHandler(async (req, res) => {
    // console.log("from delete");
    // console.log(req.params,"paramas");
    // const tasks = await Task.find({ createdBy: req.user._id });
    const task = await Task.findById(req.params.taskId);
    // console.log("task",task);
    if (task.createdBy === req.user._id) {
        throw new ApiError(500, "User not found in request");
    }
    await Task.findByIdAndDelete(req.params.taskId);
    return res
        .status(200)
        .json(new ApiResponse(
            200,
            {},
            "task deleted successfully"
        ))

})


const updateTask = asyncHandler(async (req, res) => {
    // console.log("from update");
    // console.log(req.params,"paramas");
    // console.log("body",req.body);
    const tasks = await Task.findById(req.params.updateTaskId);
    // console.log("updated",tasks);
    if (!tasks) {
        throw new ApiError(404, "Task not found");
    }
    const updatedTask = await Task.findByIdAndUpdate(req.params.updateTaskId, {
        complete: req.body.status,
    }, { new: true });
    //   console.log("updatedTask",updatedTask);
    return res
        .status(200)
        .json(new ApiResponse(
            200,
            updatedTask,
            "task updated successfully"
        ))
})

const updateSubtods = asyncHandler(async (req, res) => {
    // console.log("from subtodo");
    // console.log(req.params,"paramas");
    // console.log("body",req.body);
    const updatedSubtodo = req.body.subTodos
    const tasks = await Task.findByIdAndUpdate(req.params.id, {
        subTodos: updatedSubtodo
    }, { new: true });
    // console.log(tasks,"updated sub");
    if (!tasks) {
        res.status(400).json({ message: "Fail to update subtodo" });
        return;
    }
    return res
        .status(200)
        .json(new ApiResponse(
            200,
            tasks,
            "subtodos updated successfully"
        ))
})


const EditTask = asyncHandler(async (req, res) => {
    // console.log("from edit");
    // console.log(req.params, "paramas");
    // console.log("body", req.body);
    const { title, priority, subTodos, dueDate } = req.body;
    const updatedFields = {};
    if (title) updatedFields.title = title;
    if (priority) updatedFields.priority = priority;
    if (subTodos) updatedFields.subTodos = subTodos;
    if (dueDate) updatedFields.dueDate = dueDate;

    if (Object.keys(updatedFields).length === 0) {
        return res.status(400).json({ message: "No fields to update" });
    }

    const updatedTask = await Task.findByIdAndUpdate(req.params.EditTaskId, updatedFields, { new: true });

    // console.log("updated", updatedTask);

    return res.status(200).json(new ApiResponse(
        200,
        updatedTask,
        "Task updated successfully"
    ));
});







const shareLink = async (req, res) => {
    console.log(req.params, "paramas");
    console.log("body", req.body);
    const taskId = req.params.share

};


const generateShareLink = () => asyncHandler(async (req, res) => {
    console.log("hii");
    console.log("from share");
    // console.log(req.params, "paramas");
    // console.log("body", req.body);
    // try {
    //     const { taskId } = req.body;
    //     const sharedTaskUrl = generateUniqueUrl(taskId); // Function to generate unique URL
    //     await saveSharedTask(taskId, sharedTaskUrl); // Function to save shared task in database
    //     res.status(200).json({ url: sharedTaskUrl });
    //   } catch (error) {
    //     console.error(error);
    //     res.status(500).json({ message: 'Internal Server Error' });
    //   }
});




export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    createTask,
    getCurrentUserTasksInToDo,
    deleteTask,
    updateTask,
    EditTask,
    getSortedByData,
    generateShareLink,
    shareLink,
    getSharedTaskData,
    updateSubtods
}