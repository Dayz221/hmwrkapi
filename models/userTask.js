import mongoose from "mongoose"
const { Schema, model } = mongoose;

const userTaskSchema = new Schema({
    task: { type: mongoose.Types.ObjectId, required: true, ref: "Task" },
    user: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
    isCompleted: { type: Boolean, default: false },
})

export default model("UserTask", userTaskSchema)