import { validationResult } from "express-validator"
import Group from "../models/group.js"
import Folder from '../models/folder.js'
import File from '../models/file.js'
import bcrypt from "bcrypt"

class GroupController {
    async getGroups(req, res) {
        try {
            const groups = await Group.find()
            const answ = groups.map(el => { return { name: el.name, users: el.users, tasks: el.tasks, _id: el._id } })
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

    async getGroupFolder(req, res) {
        try {
            const user = req.user
            const group = await Group.findById(user.groupId)
            let folder = await Folder.findOne({ _id: group.folder })
            if (!folder) {
                console.log("Create new group folder")
                folder = Folder({ groupId: user.groupId, name: group.name })
                group.folder = folder._id
                await folder.save()
                await group.save()
            }

            const files = await Promise.all(folder.files.map(async id => {
                const file = await File.findOne({ _id: id })
                return { name: file.name, _id: file._id }
            }))

            const folders = await Promise.all(folder.folders.map(async id => {
                const folder = await Folder.findOne({ _id: id })
                return { name: folder.name, files_count: folder.files.length, _id: folder._id }
            }))

            res.status(200).send({ folder: { ...folder._doc, files, folders }, message: "OK" })
        } catch (e) {
            console.log(e)
            res.status(400).send({ message: "Ошибка, проверьте данные" })
        }
    }
}

export default new GroupController()