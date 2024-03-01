// import { Router } from "express";
// import { verifyJWT } from "../middlewares/auth.middleware.js";
// import { createTask } from "../controllers/task.controller.js";

// const taskRouter = Router()


// // router.route("/register").post(
// //     upload.fields([
// //         {
// //             name: "avatar",
// //             maxCount: 1
// //         },
// //         {
// //             name: "coverImage",
// //             maxCount: 1
// //         }
// //     ]),
// //     registerUser
// // )
// taskRouter.route("/create-task").post(createTask)
// // router.route("/login").post(loginUser)


// // secured routes 
// // router.route("/logout").post( verifyJWT, logoutUser)
// // router.route("/refresh-token").post(refreshAccessToken)
// // router.route("/change-password").post(verifyJWT, changeCurrentPassword)
// // router.route("/current-user").get(verifyJWT, getCurrentUser)

// export default taskRouter


import { Router } from "express";
// Remove import for multer middleware

import { createTask } from "../controllers/task.controller.js";

const taskRouter = Router();

taskRouter.route("/create-task").post(createTask);

export default taskRouter;
