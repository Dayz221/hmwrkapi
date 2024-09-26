import File from "../models/file.js"
import Group from "../models/group.js"
import Task from "../models/task.js"
import fs from "fs"
import path from "path"

class TaskController {
    async getTasks(req, res) {
        try {
            const user = req.user
            const group = await Group.findOne({ _id: user.groupId })

            const tasks = await Promise.all(group.tasks.map(
                async (task_id) => { 
                    const task = await Task.findOne({ _id: task_id }) 
                    const files = await Promise.all(task.files.map(async id => {
                        const file = await File.findOne({ _id: id })
                        return { name: file.name, _id: file._id }
                    }))
                    return { ...(task._doc), files: files }
                }
            ))

            res.status(200).send({ tasks, message: "OK" })
        } catch (e) {
            console.log(e)
            res.status(500).send({ message: "Ошибка, проверьте данные" })
        }
    }

    async createTask(req, res) {
        try {
            const user = req.user
            const group = await Group.findOne({ _id: user.groupId })

            const task = new Task(req.body)
            await task.save()

            group.tasks.push(task._id)
            await group.save()

            res.status(200).send({ task, message: "OK" })
        } catch (e) {
            console.log(e)
            res.status(500).send({ message: "Ошибка, проверьте данные" })
        }
    }

    async patchTask(req, res) {
        try {
            const task_id = req.params.id
            const task = await Task.findOne({ _id: task_id })
            await task.updateOne(req.body)
            const response = await task.save()
            return res.status(200).json({ task: { ...response._doc, ...req.body }, message: "OK" })
        } catch (e) {
            console.log(e)
            res.status(500).send({ message: "Ошибка, проверьте данные" })
        }
    }

    async deleteTask(req, res) {
        try {
            const user = req.user
            const task_id = req.params.id
            const group = await Group.findOne({ _id: user.groupId })
            const task = await Task.findOne({ _id: task_id })

            task.files.forEach(async el => {
                const file = await File.findOne({ _id: el })
                fs.unlink(path.join(process.cwd(), file.path), (err) => { })
                await file.deleteOne()
            })

            await group.updateOne({ $pull: { tasks: task_id } })
            await task.deleteOne()
            return res.status(200).json({ message: "Задание успешно удалено" })
        } catch (e) {
            console.log(e)
            res.status(500).send({ message: "Ошибка, проверьте данные" })
        }
    }
}

export default new TaskController()