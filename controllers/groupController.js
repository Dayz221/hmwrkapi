import { validationResult } from "express-validator"
import Group from "../models/group.js"
import bcrypt from "bcrypt"

class GroupController {
    async getGroups(req, res) {
        try {
            const groups = await Group.find()
            const answ = groups.map(el => {return { name: el.name, users: el.users, tasks: el.tasks, _id: el._id }})
            res.status(200).send({ groups: answ, message: "OK" })
        } catch (e) {
            console.log(e)
            res.status(400).send({ message: "Ошибка, проверьте данные" })
        }
    }

    async createGroup(req, res) {
        try {
            const err = validationResult(req)
            if (!err.isEmpty()) return res.status(400).send({ message: err.errors[0].msg })

            const { name, password } = req.body
            const candidate = await Group.findOne({ name })
            if (candidate) return res.status(400).send({ message: "Группа с таким названием уже существует" })

            const hashedPassword = await bcrypt.hash(password, 8)
            const newGroup = new Group({ name, password: hashedPassword })

            await newGroup.save()

            res.status(200).send({ message: "OK" })
        } catch (e) {
            console.log(e)
            res.status(400).send({ message: "Ошибка, проверьте данные" })
        }
    }

    async changePassword(req, res) {
        try {
            const err = validationResult(req)
            if (!err.isEmpty()) return res.status(400).send({ message: err.errors[0].msg })

            const { password } = req.body
            const group_id = req.params.group_id

            const group = await Group.findOne({ _id: group_id })
            if (!group) return res.status(400).send({ message: "Группы с таким id не существует" })

            const hashedPassword = await bcrypt.hash(password, 8)
            await group.updateOne({ password: hashedPassword })

            res.status(200).send({ message: "OK" })
        } catch (e) {
            console.log(e)
            res.status(400).send({ message: "Ошибка, проверьте данные" })
        }
    }
}

export default new GroupController()