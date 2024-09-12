import { Router } from "express"
import { checkPermissions } from "../middleware/checkPermissions.js"
import taskController from "../controllers/taskController.js"
const taskRouter = Router()

taskRouter.get('/get_tasks', checkPermissions(1), taskController.getTasks)
taskRouter.post('/create_task', checkPermissions(1), taskController.createTask)
taskRouter.patch('/patch_task/:id', checkPermissions(1), taskController.patchTask)
taskRouter.delete('/delete_task/:id', checkPermissions(1), taskController.deleteTask)

export default taskRouter