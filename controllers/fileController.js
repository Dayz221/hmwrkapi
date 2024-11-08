import Task from "../models/task.js"
import File from "../models/file.js"
import Folder from "../models/folder.js"
import fs from "fs"
import path from "path"

class FileController {
    async getFile(req, res) {
        try {
            const file_id = req.params.file_id
            const file = await File.findOne({ _id: file_id })
            res.sendFile(path.join(process.cwd(), file.path))

        } catch (e) {
            console.log(e)
            res.status(400).send({ message: "Ошибка, проверьте данные" })
        }
    }

    async uploadFile(req, res) {
        try {
            const folder_id = req.params.folder_id
            const folder = await Folder.findById(folder_id)

            const file = new File({ name: req.file.originalname, path: req.file.path, folderId: req.params.folder_id })
            folder.files.push(file._id)

            await file.save()
            await folder.save()

            res.status(200).send({ file: file, message: "Файл успещно сохранен" })
        } catch (e) {
            console.log(e)
            res.status(400).send({ message: "Ошибка, проверьте данные" })
        }
    }

    async uploadFileTask(req, res) {
        try {
            const task_id = req.params.task_id
            const task = await Task.findById(task_id)

            const file = new File({ name: req.file.originalname, path: req.file.path})
            task.files.push(file._id)

            await file.save()
            await task.save()
            
            res.status(200).send({ file: file, message: "Файл успещно сохранен" })
        } catch (e) {
            console.log(e)
            res.status(400).send({ message: "Ошибка, проверьте данные" })
        }
    }

    async deleteFile(req, res) {
        try {
            const file_id = req.params.file_id
            const file = await File.findOne({ _id: file_id })
            const folder = await Folder.findById(file.folderId)

            fs.unlink(path.join(process.cwd(), file.path), (err) => {
                if (err) res.status(400).send({ message: "Ошибка, проверьте данные" })
                return
            })

            await Task.updateMany(
                {},
                {
                    $pull: { files: file._id }
                }
            )

            await file.deleteOne()
            await folder.updateOne({
                $pull: {
                    files: file_id
                }
            })

            res.status(200).send({ message: "Файл удален успешно" })

        } catch (e) {
            console.log(e)
            res.status(400).send({ message: "Ошибка, проверьте данные" })
        }
    }

    async attachFile(req, res) {
        try {
            const task_id = req.params.task_id
            const file_id = req.params.file_id

            const task = await Task.findById(task_id)
            const file = await File.findById(file_id)

            if (!file || !task) {
                res.status(400).send({ message: "Ошибка, проверьте данные" })
                return
            }

            if (task.files.includes(file_id)) {
                res.status(200).send({ message: "OK" })
                return
            }

            if (task.isGroupTask && req.user.permissions < 2) {
                res.status(403).send({ message: "Недостаточно прав доступа" })
                return
            }

            task.files.push(file_id)
            await task.save()
            res.status(200).send({ message: "OK" })
        } catch (e) {
            console.log(e)
            res.status(400).send({ message: "Ошибка, проверьте данные" })
        }
    }

    async unpinFile(req, res) {
        try {
            const task_id = req.params.task_id
            const file_id = req.params.file_id

            const task = await Task.findById(task_id)
            const file = await File.findById(file_id)

            if (!file || !task) {
                res.status(400).send({ message: "Ошибка, проверьте данные" })
                return
            }

            if (task.isGroupTask && req.user.permissions < 2) {
                res.status(403).send({ message: "Недостаточно прав доступа" })
                return
            }

            if (!task.folderId) {
                fs.unlink(path.join(process.cwd(), file.path), (err) => {
                    if (err) res.status(400).send({ message: "Ошибка, проверьте данные" })
                    return
                })
                await file.deleteOne()
            }

            await task.updateOne({
                $pull: {
                    files: file_id
                }
            })
            res.status(200).send({ message: "OK" })
        } catch (e) {
            console.log(e)
            res.status(400).send({ message: "Ошибка, проверьте данные" })
        }
    }

    async getFolder(req, res) {
        try {
            const folder_id = req.params.folder_id
            const folder = await Folder.findById(folder_id)

            if (!folder) return res.status(400).send({ message: "Ошибка, проверьте данные" })

            const files = await Promise.all(folder.files.map(async id => {
                const file = await File.findOne({ _id: id })
                return { name: file.name, _id: file._id }
            }))

            const folders = await Promise.all(folder.folders.map(async id => {
                const folder = await Folder.findOne({ _id: id })
                return { name: folder.name, files_count: folder.files.length, _id: folder._id }
            }))

            res.status(200).send({ folder: { ...(folder._doc), files: files, folders: folders }, message: "OK" })

        } catch (e) {
            console.log(e)
            res.status(400).send({ message: "Ошибка, проверьте данные" })
        }
    }

    async createFolder(req, res) {
        try {
            const { parent, name } = req.body
            const parent_folder = await Folder.findById(parent)

            if (!parent_folder || !name || name.trim() == '') return res.status(400).send({ message: "Ошибка, проверьте данные" })

            const newFolder = Folder({ name, parent, groupId: req.user.groupId })
            parent_folder.folders.push(newFolder)

            await newFolder.save()
            await parent_folder.save()

            res.status(200).send({ folder: newFolder, message: "OK" })

        } catch (e) {
            console.log(e)
            res.status(400).send({ message: "Ошибка, проверьте данные" })
        }
    }

    async renameFolder(req, res) {
        try {
            const folder_id = req.params.folder_id
            const newName = req.body.name

            const folder = await Folder.findById(folder_id)
            if (!newName || newName.trim() == '') return res.status(400).send({ message: "Ошибка, проверьте данные" })

            folder.name = newName
            await folder.save()
            res.status(200).send({message: "OK"})

        } catch (e) {
            console.log(e)
            res.status(400).send({ message: "Ошибка, проверьте данные" })
        }
    }

    async deleteFolder(req, res) {
        const deleteFolderFunc = async (folder_id) => {
            const folder = await Folder.findById(folder_id)
            const parent = await Folder.findById(folder.parent)

            if (!!parent) {
                await parent.updateOne({
                    $pull: {
                        folders: req.params.folder_id
                    }
                })
            }

            folder.files.forEach(async file_id => {
                const file = await File.findOne({ _id: file_id })

                fs.unlink(path.join(process.cwd(), file.path), (err) => {
                    if (err) res.status(400).send({ message: "Ошибка, проверьте данные" })
                    return
                })

                await Task.updateMany(
                    {},
                    {
                        $pull: { files: file._id }
                    }
                )

                await file.deleteOne()
            })

            folder.folders.forEach(async folder => {
                await deleteFolderFunc(folder)
            })

            await folder.deleteOne()
        }

        try {
            await deleteFolderFunc(req.params.folder_id)
            res.status(200).send({ message: "OK" })

        } catch (e) {
            console.log(e)
            res.status(400).send({ message: "Ошибка, проверьте данные" })
        }
    }
}

export default new FileController()