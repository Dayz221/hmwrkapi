import { Router } from "express"
import { checkPermissions } from "../middleware/checkPermissions.js"
import fileController from "../controllers/fileController.js"
import { uploadFile } from "../multerStorage.js"
const fileRouter = Router()

fileRouter.get('/get_file/:file_id', checkPermissions(1), fileController.getFile)
fileRouter.post('/upload_file/:task_id', checkPermissions(1), uploadFile.single("file"), fileController.uploadFile)
fileRouter.delete('/delete_file/:file_id', checkPermissions(1), fileController.deleteFile)

export default fileRouter