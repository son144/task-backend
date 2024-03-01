import { Router } from "express";
import {
    EditTask,
    changeCurrentPassword,
    createTask,
    deleteTask,
    generateShareLink,
    getCurrentUser,
    getCurrentUserTasksInToDo,
    getSharedTaskData,
    getSortedByData,
    loginUser,
    logoutUser,
    refreshAccessToken,
    registerUser,
    shareLink,
    updateSubtods,
    updateTask,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// post requests 
router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1,
        },
        {
            name: "coverImage",
            maxCount: 1,
        },
    ]),
    registerUser
);

router.route("/login").post(loginUser);

// secured routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/current-user-share/:shareId").post(verifyJWT, EditTask);
router.route("/current-user-share-task/:share").post(verifyJWT,shareLink)
router.route("/create-task").post(createTask);

// get requests 
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/current-user-task-todo").get(verifyJWT, getCurrentUserTasksInToDo);
router.route("/current-user-week/:sortedBy").get(verifyJWT, getSortedByData);
router.route("/current-user-shared-task/:sharedTaskId").get(getSharedTaskData);

// delete requests 
router.route("/:taskId").delete(verifyJWT, deleteTask);

// put requests
router.route("/:updateTaskId").put(verifyJWT, updateTask);
router.route("/update-subTodo/:id").put(verifyJWT, updateSubtods);
router.route("/current-user/:EditTaskId").put(verifyJWT, EditTask);


// router .route("/current-user-task-backlog") .get(verifyJWT, getCurrentUserTasksInBacklog);
// router.route("/current-user-task-progress").get(verifyJWT, getCurrentUserTasksInProgress);
// router.route("/current-user-task-done").get(verifyJWT, getCurrentUserTasksInDone);
// router.route("/current-user-high").get(verifyJWT, getHighPriorityTasks);
// router.route("/current-user-low").get(verifyJWT, getLowPriorityTasks);
// router.route("/current-user-moderate").get(verifyJWT, getModeratePriorityTasks);


export default router;
