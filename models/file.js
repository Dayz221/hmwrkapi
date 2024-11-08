import mongoose from "mongoose"
const { Schema, model } = mongoose;

const fileSchema = new Schema({
    name: { type: String, required: true },
    path: { type: String, required: true },
    folderId: {type: mongoose.Types.ObjectId, default: null, ref: "Folder"}
})

export default model("File", fileSchema)