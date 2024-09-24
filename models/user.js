import mongoose from "mongoose"
const { Schema, model } = mongoose;

const userSchema = new Schema({
    // login: { type: String, required: true, unique: true },
    // password: { type: String, required: true },
    groupId: { type: mongoose.Types.ObjectId, ref: "Group", required: true },
    telegramId: { type: Number, required: true },
    first_name: {type: String, required: true, default: ""},
    last_name: {type: String, default: ""},
    username: {type: String, default: ""},
    photoUrl: {type: String},
    permissions: { type: Number, default: 1 },
})

export default model("User", userSchema)