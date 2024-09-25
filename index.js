import express from "express"
import color from "colors"
import { logger } from "./middleware/logger.js"
import authRouter from "./routes/authRoutes.js"
import taskRouter from "./routes/taskRoutes.js"
import fileRouter from "./routes/fileRoutes.js"
import mongoose from "mongoose"
import Group from "./models/group.js"
import apiRouter from "./routes/apiRouter.js"
import cors from "cors"
import https from "https"
import fs from "fs"
import dotenv from "dotenv"
// import teleBot from "./teleBot.js"

dotenv.config()

mongoose
        .connect(process.env.MONGO_DB)
        .then(async () => { 
            console.log(color.green(`MongoDB attached!`))
            try {
                const groupId = await Group.findOne({ name: "ИУ7-16Б" })
                if (!groupId) {
                    const group = new Group({ name: "ИУ7-16Б" })
                    await group.save()
                    groupId = group._id
                }
            } catch (e) {
                console.log(e)
            } 
        })
        .catch((err) => { console.log(color.red(err)) })

const app = express()

app.use(express.json())
app.use(logger)
app.use(cors())
app.use(express.static('static'))
app.use("/api/auth", authRouter)
app.use("/api/tasks", taskRouter)
app.use("/api/files", fileRouter)
app.use("/api", apiRouter)

app.get('/', (req, res) => res.status(200).send({ message: "homework site and telegram-bot api" }))

app.listen(process.env.PORT_HTTP, (err) => {
    if (err) return console.log(color.red(err))
})    

https.createServer(
    {
        cert: fs.readFileSync('./cert/fullchain.pem'),
        key: fs.readFileSync('./cert/privkey.pem')
    },
    app
).listen(process.env.PORT_HTTPS, (err) => {
    if (err) return console.log(color.red(err))
})

export default app
