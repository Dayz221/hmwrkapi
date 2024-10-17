import File from "../models/file.js"
import Group from "../models/group.js"
import Task from "../models/task.js"
import User from "../models/user.js"
import fs from "fs"
import path from "path"
import UserTask from "../models/userTask.js"

class TaskController {
    async getTasks(req, res) {
        try {
            const user = req.user

            const tasks = await Promise.all(
                user.tasks.map(async el => {
                    const userTask = await UserTask.findById(el)
                    const task = await Task.findById(userTask.task)
                    const files = await Promise.all(task.files.map(async id => {
                        const file = await File.findOne({ _id: id })
                        return { name: file.name, _id: file._id }
                    }))
                    return { ...(task._doc), utask_id: userTask._id, isCompleted: userTask.isCompleted, files: files }
                })
            )

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

            const { subject, type, description, deadline, isGroupTask } = req.body

            if (isGroupTask && req.user.permissions < 2) return res.status(403).send({ message: "Недостаточно прав доступа" })
            if (subject == undefined) return res.status(400).send({ message: "Ошибка, проверьте данные" })

            const task = new Task({ subject, type, description, deadline, isGroupTask })
            await task.save()

            if (isGroupTask) {
                group.tasks.push(task)
                group.users.map(async user_id => {
                    const userTask = new UserTask({ task, user: user_id })
                    const group_user = await User.findOne({ _id: user_id })
                    group_user.tasks.push(userTask._id)
    
                    await userTask.save()
                    await group_user.save()
                })
                await group.save()
            } else {
                const userTask = new UserTask({ task, user: user._id })
                user.tasks.push(userTask._id)

                await userTask.save()
                await user.save()
            }

            const newUserTask = await UserTask.findById(user.tasks[user.tasks.length-1])
            const newTask = await Task.findById(newUserTask.task)

            res.status(200).send({ task: { ...(newTask._doc), utask_id: newUserTask._id, isCompleted: newUserTask.isCompleted }, message: "OK" })
        } catch (e) {
            console.log(e)
            res.status(400).send({ message: "Ошибка, проверьте данные" })
        }
    }

    async patchTask(req, res) {
        try {
            const task_id = req.params.id
            const task = await Task.findOne({ _id: task_id })
            if (task.isGroupTask && req.user.permissions < 2) return res.status(403).send({ message: "Недостаточно прав доступа" })
            
            await task.updateOne(req.body)
            const response = await task.save()

            const files = await Promise.all(task.files.map(async id => {
                const file = await File.findOne({ _id: id })
                return { name: file.name, _id: file._id }
            }))

            return res.status(200).json({ task: { ...response._doc, ...req.body, files: files }, message: "OK" })
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

            if (task.isGroupTask && user.permissions < 2) return res.status(403).send({ message: "Недостаточно прав доступа" })

            task.files.forEach(async el => {
                const file = await File.findOne({ _id: el })
                fs.unlink(path.join(process.cwd(), file.path), (err) => { })
                await file.deleteOne()
            })

            if (task.isGroupTask) await group.updateOne({ $pull: { tasks: task_id } })

            const user_tasks = await UserTask.find({ task: task._id })
            user_tasks.forEach(async user_task => {
                const u = await User.findById(user_task.user)
                await u.updateOne({ $pull: { tasks: user_task._id } })
                await user_task.deleteOne()
            })

            await task.deleteOne()
            return res.status(200).json({ message: "Задание успешно удалено" })
        } catch (e) {
            console.log(e)
            res.status(500).send({ message: "Ошибка, проверьте данные" })
        }
    }

    async setTaskStatus(req, res) {
        try {
            const { isCompleted } = req.body
            const userTask = UserTask.findById(req.params.id)
            await userTask.updateOne({ isCompleted })

            return res.status(200).json({ status: isCompleted, message: "Успешно" })
        } catch (e) {
            console.log(e)
            res.status(500).send({ message: "Ошибка, проверьте данные" })
        }
    }
}

export default new TaskController()