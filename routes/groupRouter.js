import { Router } from "express"
import groupController from "../controllers/groupController.js"
import { checkPermissions } from "../middleware/checkPermissions.js"
import { check } from "express-validator"
const groupRouter = Router()

groupRouter.get('/get_groups', checkPermissions(2), groupController.getGroups)

groupRouter.post('/create_group', 
    [
        check('name', "Поле name не может быть пустым").notEmpty(),
        check('password', "Поле password не может быть меньше 4 символов").isLength({min: 4})
    ], 
checkPermissions(2), groupController.createGroup)

groupRouter.patch('/change_password/:group_id',
    [
        check('password', "Поле password не может быть меньше 4 символов").isLength({min: 4})
    ],
checkPermissions(2), groupController.changePassword)

groupRouter.get('/get_group_folder', checkPermissions(1), groupController.getGroupFolder)

export default groupRouter