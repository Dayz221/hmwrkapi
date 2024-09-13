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
            const task = await Task.findOne({ _id: req.params.task_id })
            const group = await Group.findOne({ _id: req.user.groupId })

            const time = new Date(task.deadline)
            const uploadPath = path.join("files", group.name, task.subject, `${String(time.getUTCDate()).padStart(2, '0')}.${String(time.getUTCMonth()+1).padStart(2, '0')}.${time.getUTCFullYear()}`)
            
            file.originalname = Buffer.from(file.originalname, 'latin1').toString()
            console.log(path.join(uploadPath, file.originalname))
            req.fileExists = await fileExists(path.join(uploadPath, file.originalname))

            fs.mkdirSync(uploadPath, { recursive: true })

            cb(null, uploadPath)
        } catch (e) {
            console.log(e)
        }
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
})

export const uploadFile = multer({
    storage: storage
})