import { Router } from "express"
import { checkPermissions } from "../middleware/checkPermissions.js"
import taskController from "../controllers/taskController.js"
import changeEdits from "../middleware/changeEdits.js"
const taskRouter = Router()


taskRouter.get('/get_tasks', checkPermissions(1), taskController.getTasks)
taskRouter.post('/create_task', checkPermissions(1), changeEdits, taskController.createTask)
taskRouter.patch('/patch_task/:id', checkPermissions(1), changeEdits, taskController.patchTask)
taskRouter.delete('/delete_task/:id', checkPermissions(1), changeEdits, taskController.deleteTask)

taskRouter.get('/get_edits', checkPermissions(1), taskController.getEdits)
taskRouter.patch('/set_task_status/:id', checkPermissions(1), taskController.setTaskStatus)


export default taskRouter