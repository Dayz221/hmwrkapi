import mongoose from "mongoose"
const { Schema, model } = mongoose;

const taskSchema = new Schema({
    subject: { type: String, required: true },
    type: {type: String, default: ""},
    description: { type: String, default: "" },
    deadline: { type: Number, default: () => Date.now() + 1000*60*60*24*7 },
    isGroupTask: { type: Boolean, default: false },
    files: [{ type: mongoose.Types.ObjectId, ref: "File" }]
})

export default model("Task", taskSchema)