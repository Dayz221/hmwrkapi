import express from "express"
import color from "colors"
import { logger } from "./middleware/logger.js"
import authRouter from "./routes/authRoutes.js"
import taskRouter from "./routes/taskRoutes.js"
import fileRouter from "./routes/fileRoutes.js"
import mongoose from "mongoose"
import User from "./models/user.js"
import bcrypt from "bcrypt"
import { TELEGRAM_BOT_PASSWORD } from "./config.js"
import Group from "./models/group.js"
import serverless from "serverless-http"

const PORT = process.env.PORT || 8000

const app = express()

app.use(express.json())
app.use("/api/auth", authRouter)
app.use("/api/tasks", taskRouter)
app.use("/api/files", fileRouter)

app.get('/', (req, res) => res.status(200).send({ message: "homework site and telegram-bot api" }))

app.listen(PORT, async (err) => {
    if (err) return console.log(color.red(err))

    await mongoose
        .connect("mongodb+srv://admin:qwedcvhu123@cluster0.aiz62xa.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
        .then(async () => { 
            console.log(color.green(`MongoDB attached!`))
            try {
                const botAdmin = await User.findOne({ login: "TelegramBot" })
                const groupId = await Group.findOne({ name: "ИУ7-16Б" })
                if (!groupId) {
                    const group = new Group({ name: "ИУ7-16Б" })
                    await group.save()
                    groupId = group._id
                }
                if (!botAdmin) {
                    const bot = new User({ login: "TelegramBot", password: bcrypt.hashSync(TELEGRAM_BOT_PASSWORD, 8), groupId: groupId._id, telegramId: 0, permissions: 3 })
                    await bot.save()
                }
            } catch (e) {
                console.log(e)
            } 
        })
        .catch((err) => { console.log(color.red(err)) })

    console.log(color.green(`Server started on http://localhost:${PORT}`))
})    

export default app
