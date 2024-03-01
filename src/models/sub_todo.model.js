import mongoose from "mongoose";

const subTodoSchema = new mongoose.Schema({
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
    ,
)
export const SubTodo = mongoose.model("SubTodo", subTodoSchema)