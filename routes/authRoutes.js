import { Router } from "express"
import color from "colors"
import bcrypt from "bcrypt"
import { check, validationResult } from "express-validator"
import User from "../models/user.js"
import Group from "../models/group.js"
import jwt from "jsonwebtoken"
import { SECRET_KEY } from "../config.js"
import { checkPermissions } from "../middleware/checkPermissions.js"
const authRouter = Router()

authRouter.post("/register",
    [
        check("login", "Длина логина не может быть меньше 3 и больше 20 символов").isLength({ min: 3, max: 20 }),
        check("password", "Длина пароля не может быть меньше 4 и больше 20 символов").isLength({ min: 4, max: 20 })
    ],
    async (req, res) => {
        try {
            const err = validationResult(req)
            if (!err.isEmpty()) return res.status(400).send({ message: err.errors[0].msg })

            const { login, password, groupName, telegramId } = req.body
            const candidate = await User.findOne({ login })
            if (candidate) return res.status(400).send({ message: "Пользователь с таким логином уже существует" })

            const group = await Group.findOne({ name: groupName })
            const hashedPassword = await bcrypt.hash(password, 8)
            const newUser = new User({ login, password: hashedPassword, groupId: group._id, telegramId: telegramId })

            await newUser.save()

            group.users.push(newUser._id)
            await group.save()

            const token = jwt.sign({ id: newUser._id }, SECRET_KEY)

            res.status(200).send({ token: token, message: "Пользователь зарегистрирован" })
            console.log(color.blue(`Register user with login: ${login} password: ${hashedPassword}`))
        } catch (e) {
            console.log(e)
            res.status(400).send({ message: "Ошибка при регистрации пользователя, проверьте данные" })
        }
    }
)

authRouter.post("/login",
    async (req, res) => {
        try {
            const { login, password } = req.body
            const user = await User.findOne({ login })
            if (!user) return res.status(400).send({ message: "Пользователь с таким логином не найден" })

            const passCompare = await bcrypt.compare(password, user.password)
            if (!passCompare) return res.status(400).send({ message: "Неправильный пароль" })

            if (req.body.telegramId) {
                user.telegramId = req.body.telegramId
                await user.save()
            }

            const token = jwt.sign({ id: user._id }, SECRET_KEY)

            res.status(200).send({ token: token, message: "Пользователь авторизован" })
        } catch (e) {
            console.log(e)
            res.status(400).send({ message: "Ошибка при авторизации пользователя, проверьте данные" })
        }
    }
)

authRouter.get("/get_user_by_id/:id", checkPermissions(2), async (req, res) => {
    try {
        const user_tg_id = req.params.id
        const user = await User.findOne({telegramId: user_tg_id})
        const token = jwt.sign({ id: user._id }, SECRET_KEY)

        res.status(200).send({ token, message: "Пользователь найден" })
    } catch (e) {
        console.log(e)
        res.status(400).send({ message: "Пользователь не найден, проверьте корректность данных" })
    }
})

export default authRouter