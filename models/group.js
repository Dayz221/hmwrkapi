import mongoose from "mongoose"
const { Schema, model } = mongoose;

const groupSchema = new Schema({
    name: { type: String, required: true },
    tasks: [{type: mongoose.Types.ObjectId, ref: "Task"}],
    users: [{type: mongoose.Types.ObjectId, ref: "User"}],
    password: { type: String, required: true, default: "1234" }
})

export default model("Group", groupSchema)