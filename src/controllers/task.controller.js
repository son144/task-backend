import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloludinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Task } from "../models/tasks.model.js"

//  const createTask = async (req, res, next) => {
//     console.log("req from create",req);
//     console.log("req from create body",req.body);
    // const newTask = new Task({
    //   title: req.body.title,
    //   user: req.user.id,
    //   completed: req.body.completed,
    // });
    // try {
    //   const savedTask = await newTask.save();
    //   return res.status(200).json(savedTask);
    // } catch (err) {
    //   return next(err);
    // }
//   };


//   const createTask = asyncHandler(async (req, res) => {
//     console.log("req",req);
//     console.log("req body",req.body);

//     const { title, priority } = req.body
//     console.log("priority fffhd", priority);
//     console.log("title", title);
//     // console.log("password", password);

   
// })

// export { createTask}


// const createTask = asyncHandler(async (req, res) => {
//     console.log("req body", req.body); // form data
//     // console.log("id",req.user);
  
//     const { title, priority,dueDate,subTodos,} = req.body;
//     console.log("req",req.body);
//     console.log("title", title);
//     console.log("priority", priority);
//     const task = await Task.create({
//         title,
//         priority,
//         dueDate,
//         subTodos,
//         createdBy:req.user?._id
//     })
//     console.log("task",task);
//     const createdTask = await User.findById(task._id)
//     console.log("createdTask",createdTask);
//     if (!createdTask) {
//         throw new ApiError(500, "Something went wrong while adding task")

//     }
//     // Save the task to the database
//   });


const createTask = asyncHandler(async (req, res) => {
    console.log("req body", req.body); // form data
// console.log("user req",req.body.user);
    // Check if req.user is populated
    // if (!req.user.body._id) {
    //     throw new ApiError(500, "User not found in request");
    // }

    const { title, priority, dueDate, subTodos } = req.body;
    const userId=req.body.user._id
    console.log("user",userId);
    console.log("req", req.body);
    console.log("title", title);
    console.log("priority", priority);
 if (!userId) {
        throw new ApiError(500, "User not found in request");
    }
    const task = await Task.create({
        title,
        priority,
        dueDate,
        subTodos,
        createdBy: userId // Assuming req.user is already populated
    });

    console.log("task", task);

    const createdTask = await User.findById(task._id);
    console.log("createdTask", createdTask);

    if (!createdTask) {
        throw new ApiError(500, "Something went wrong while adding task");
    }

    // Save the task to the database
});

  
  export { createTask };
  

  
//   export const updateTask = async (req, res, next) => {
//     try {
//       const task = await Task.findById(req.params.taskId).exec();
//       if (!task) return next(createError({ status: 404, message: 'Task not found' }));
//       if (task.user.toString() !== req.user.id) return next(createError({ status: 401, message: "It's not your todo." }));
  
//       const updatedTask = await Task.findByIdAndUpdate(req.params.taskId, {
//         title: req.body.title,
//         completed: req.body.completed,
//       }, { new: true });
//       return res.status(200).json(updatedTask);
//     } catch (err) {
//       return next(err);
//     }
//   };
  
//   export const getAllTasks = async (req, res, next) => {
//     try {
//       const tasks = await Task.find({});
//       return res.status(200).json(tasks);
//     } catch (err) {
//       return next(err);
//     }
//   };
  
//   export const getCurrentUserTasks = async (req, res, next) => {
//     try {
//       const tasks = await Task.find({ user: req.user.id });
//       return res.status(200).json(tasks);
//     } catch (err) {
//       return next(err);
//     }
//   };
  
//   export const deleteTask = async (req, res, next) => {
//     try {
//       const task = await Task.findById(req.params.taskId);
//       if (task.user === req.user.id) {
//         return next(createError({ status: 401, message: "It's not your todo." }));
//       }
//       await Task.findByIdAndDelete(req.params.taskId);
//       return res.json('Task Deleted Successfully');
//     } catch (err) {
//       return next(err);
//     }
//   };
  
//   export const deleteAllTasks = async (req, res, next) => {
//     try {
//       await Task.deleteMany({ user: req.user.id });
//       return res.json('All Todo Deleted Successfully');
//     } catch (err) {
//       return next(err);
//     }
//   };