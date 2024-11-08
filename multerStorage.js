import multer from "multer"
import path from "path"
import fs from "fs"
import Task from "./models/task.js"
import Group from "./models/group.js"

const fileExists = (filePath) => {
    return new Promise((resolve) => {
        fs.access(filePath, fs.constants.F_OK, (err) => {
            resolve(!err);
        })
    })
}

const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        try {
            const group = await Group.findOne({ _id: req.user.groupId })

            const uploadPath = path.join("files", group.name.toString())
            console.log(uploadPath)
            
            file.originalname = Buffer.from(file.originalname, 'latin1').toString()
            fs.mkdirSync(uploadPath, { recursive: true })

            cb(null, uploadPath)
        } catch (e) {
            console.log(e)
            cb(Error("Ошибка..."), null)
        }
    },
    filename: (req, file, cb) => {
        cb(null, `${new Date().getTime()}.${file.originalname.split('.').at(-1)}`)
    }
})

export const uploadFile = multer({
    storage: storage
})