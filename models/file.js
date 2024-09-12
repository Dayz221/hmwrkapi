import mongoose from "mongoose"
const { Schema, model } = mongoose;

const fileSchema = new Schema({
    name: { type: String, required: true },
    path: { type: String, required: true },
    taskId: {type: mongoose.Types.ObjectId, required: true, ref: "Task"}
})

export default model("File", fileSchema)