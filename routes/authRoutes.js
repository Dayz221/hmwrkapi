import { Router } from "express"
import { check, validationResult } from "express-validator"
import User from "../models/user.js"
import Group from "../models/group.js"
import jwt from "jsonwebtoken"
import { checkPermissions } from "../middleware/checkPermissions.js"
import crypto from "crypto"
import bcrypt from "bcrypt"
import UserTask from "../models/userTask.js"
const authRouter = Router()


authRouter.post("/register",
    async (req, res) => {
        try {
            const { id, groupName, groupPassword, ...user } = req.body
            const candidate = await User.findOne({ telegramId: id })
            if (candidate) return res.status(400).send({ message: "Пользователь с таким id уже существует" })
    
            const group = await Group.findOne({ name: groupName })
            if (!group) return res.status(400).send({ message: "Такой группы не существует" })

            if (!bcrypt.compareSync(groupPassword, group.password)) return res.status(400).send({ message: "Неправильный пароль" })
            // if (groupPassword != group.password) return res.status(400).send({ message: "Неправильный пароль" })

            const newUser = new User({ 
                telegramId: id,
                first_name: user.first_name,
                last_name: user.last_name,
                username: user.username,
                groupId: group._id,
                photoUrl: user.photo_url
            })

            group.tasks.forEach(async task => {
                const userTask = new UserTask({ task, user: newUser._id })
                newUser.tasks.push(userTask._id)

                await userTask.save()
            })

            await newUser.save()

            group.users.push(newUser._id)
            await group.save()

            const token = jwt.sign({ id: newUser._id }, process.env.SECRET_KEY)

            res.status(200).send({ token: token, message: "Пользователь зарегистрирован" })
        } catch (e) {
            console.log(e)
            res.status(400).send({ message: "Ошибка при регистрации пользователя, проверьте данные" })
        }
    }
)

authRouter.post("/login",
    async (req, res) => {
        try {
            const { id, type, data } = req.body
            const user = await User.findOne({ telegramId: id })
            if (!user) return res.status(400).send({ message: "Пользователь с таким логином не найден" })

            if (type === "webApp") {
                const secretKey = crypto.createHash('sha256')
                    .update(process.env.TOKEN)
                    .digest()
                const { hash, ...userData } = data
                const dataCheckString = Object.keys(userData)
                    .sort()
                    .map(key => (`${key}=${userData[key]}`))
                    .join('\n')
                const hmac = crypto.createHmac('sha256', secretKey)
                    .update(dataCheckString)
                    .digest('hex')
                if (hmac !== hash) return res.status(400).send({ message: "Ошибка при авторизации пользователя, проверьте данные" })
            } else if (type == "miniApp") {
                const encoded = decodeURIComponent(data)
                const secret = crypto
                    .createHmac('sha256', 'WebAppData')
                    .update(process.env.TOKEN)
                    .digest()

                const arr = encoded.split('&')
                const hashIndex = arr.findIndex(str => str.startsWith('hash='))
                const _hash = arr.splice(hashIndex)[0].split('=')[1]
                arr.sort((a, b) => a.localeCompare(b))

                const dataCheckString = arr.join('\n')
                const hmac = crypto
                    .createHmac('sha256', secret)
                    .update(dataCheckString)
                    .digest('hex')

                if (hmac !== _hash) return res.status(400).send({ message: "Ошибка при авторизации пользователя, проверьте данные" })
            }

            const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY)

            res.status(200).send({ token: token, message: "Пользователь авторизован" })
        } catch (e) {
            console.log(e)
            res.status(400).send({ message: "Ошибка при авторизации пользователя, проверьте данные" })
        }
    }
)

// authRouter.get("/get_user_by_id/:id", checkPermissions(2), async (req, res) => {
//     try {
//         const user_tg_id = req.params.id
//         const user = await User.findOne({ telegramId: user_tg_id })
//         const token = jwt.sign({ id: user._id }, SECRET_KEY)

//         res.status(200).send({ token, message: "Пользователь найден" })
//     } catch (e) {
//         console.log(e)
//         res.status(400).send({ message: "Пользователь не найден, проверьте корректность данных" })
//     }
// })

authRouter.get("/me", checkPermissions(1), async (req, res) => {
    try {
        res.status(200).send({
            user: {
                id: req.user.telegramId,
                first_name: req.user.first_name,
                last_name: req.user.last_name,
                username: req.user.username,
                groupId: req.user.groupId,
                photo_url: req.user.photoUrl,
                permissions: req.user.permissions
            }
        })
    } catch (e) {
        console.log(e)
        res.status(400).send({ message: "Пользователь не найден, проверьте корректность данных" })
    }
})

export default authRouter