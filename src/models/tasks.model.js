import mongoose, { Schema } from "mongoose";

const taskSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },

        priority: {
            type: String,
            required: true,
            trim: true,
          
        },
       complete:{
        type: String,
       },
        dueDate: {
            type: String,
           

        },
      subTodos:[
        // {
        //    type:mongoose.Schema.Types.ObjectId,
        //    ref:"SubTodo"
        // }
        {
            text: {
                type: String,
                required: true
            },
            isCheck: {
                type: Boolean
            },
            isDeleted:{
                type:Boolean
            }
        }
       ],
       createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },

    },
    { timestamps: true }
)

export const Task = mongoose.model("Task", taskSchema)