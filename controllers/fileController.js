import Group from "../models/group.js"
import Task from "../models/task.js"
import File from "../models/file.js"
import fs from "fs"
import path from "path"
import { FILE_PATH } from "../config.js"
import { rimraf } from "rimraf"

class FileController {
    async getFile(req, res) {
        try {
            const file_id = req.params.file_id
            const file = await File.findOne({ _id: file_id })
            res.sendFile(path.join(process.cwd(), file.path))

        } catch (e) {
            console.log(e)
            res.status(500).send({ message: "Ошибка, проверьте данные" })
        }
    }

    async uploadFile(req, res) {
        try {
            const filePath = req.file.path
            const fileName = req.file.originalname
            const task_id = req.params.task_id
            console.log(0)
            const task = await Task.findOne({ _id: task_id })
            const group = await Group.findOne({ _id: req.user.groupId })

            console.log(1)

            const dir = path.join(FILE_PATH, group.name, task.subject)
            const newFilePath = path.join(dir, fileName)
            console.log(2)
            if (fs.existsSync(newFilePath)) return res.status(400).send({ message: "Такой файл уже существует" })
                console.log(3)
            fs.mkdir(dir, { recursive: true }, (err) => {
                console.log(4)
                if (err) return res.status(500).send({ message: "Ошибка, проверьте данные" })
                console.log(5)
                fs.rename(filePath, newFilePath, (err) => {
                    if (err) return res.status(500).send({ message: "Ошибка, проверьте данные" })
                    console.log(6)
                })
                console.log(7)
            })

            console.log(8)

            const file = new File({ name: fileName, path: newFilePath, taskId: task_id })
            await file.save()

            console.log(9)

            task.files.push(file._id)
            await task.save()

            res.status(200).send({ file, message: "Файл успещно сохранен" })

        } catch (e) {
            console.log(e)
            res.status(500).send({ message: "Ошибка, проверьте данные" })
        } finally {
            await rimraf(path.join(process.cwd(), 'temp'))
            fs.mkdirSync(path.join(process.cwd(), 'temp'))
        }
    }

    async deleteFile(req, res) {
        try {
            const file_id = req.params.file_id
            const file = await File.findOne({ _id: file_id })
            fs.unlink(path.join(process.cwd(), file.path), (err) => {
                if (err) res.status(500).send({ message: "Ошибка, проверьте данные" })
            })

            const task = await Task.findOne({ _id: file.taskId })
            await task.updateOne({ $pull: { files: file_id } })

            await file.deleteOne()

            res.status(200).send({ message: "Файл удален успешно" })

        } catch (e) {
            console.log(e)
            res.status(500).send({ message: "Ошибка, проверьте данные" })
        }
    }
}

export default new FileController()