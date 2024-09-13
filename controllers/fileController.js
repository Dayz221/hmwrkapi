import Task from "../models/task.js"
import File from "../models/file.js"
import fs from "fs"
import path from "path"

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
            if (req.fileExists) return res.status(400).send({ message: "Файл с таким названием уже загружен" })
            // const task = await Task.findOne({ _id: req.params.task_id })

            // const file = new File({ name: req.file.originalname, path: req.file.path, taskId: req.params.task_id })
            // await file.save()

            // task.files.push(file._id)
            // await task.save()

            res.status(200).send({ file, message: "Файл успещно сохранен" })
        } catch (e) {
            console.log(e)
            res.status(500).send({ message: "Ошибка, проверьте данные" })
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