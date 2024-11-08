import { Router } from "express"
import { checkPermissions } from "../middleware/checkPermissions.js"
import fileController from "../controllers/fileController.js"
import { uploadFile } from "../multerStorage.js"
const fileRouter = Router()

fileRouter.get('/get_file/:file_id', checkPermissions(1), fileController.getFile)
fileRouter.post('/upload_file/:folder_id', checkPermissions(2), uploadFile.single("file"), fileController.uploadFile)
fileRouter.post('/upload_file_for_task/:task_id', checkPermissions(1), uploadFile.single("file"), fileController.uploadFileTask)
fileRouter.delete('/delete_file/:file_id', checkPermissions(1), fileController.deleteFile)

fileRouter.post('/attach_file/:task_id/:file_id', checkPermissions(1), fileController.attachFile)
fileRouter.delete('/unpin_file/:task_id/:file_id', checkPermissions(1), fileController.unpinFile)

fileRouter.get('/get_folder/:folder_id', checkPermissions(1), fileController.getFolder)
fileRouter.post('/create_folder', checkPermissions(2), fileController.createFolder)
fileRouter.patch('/rename_folder/:folder_id', checkPermissions(2), fileController.renameFolder)
fileRouter.delete('/delete_folder/:folder_id', checkPermissions(2), fileController.deleteFolder)

export default fileRouter