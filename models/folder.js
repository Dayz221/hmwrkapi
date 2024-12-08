import mongoose from "mongoose"
const { Schema, model } = mongoose;

const folderSchema = new Schema({
    groupId: { type: mongoose.Types.ObjectId, ref: "Group" },
    name: { type: String, required: true },
    files: [{ type: mongoose.Types.ObjectId, ref: "File" }],
    folders: [{ type: mongoose.Types.ObjectId, ref: "Folder" }],
    parent: { type: mongoose.Types.ObjectId, ref: "Folder", default: null }
})

export default model("Folder", folderSchema)