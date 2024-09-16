import { Router } from "express"
import apiController from "../controllers/apiController.js"
const apiRouter = Router()

apiRouter.get('/groups', apiController.getGroups)

export default apiRouter