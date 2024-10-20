import Group from "../models/group.js"

export default async (req, res, next) => {
    try {
        if (req.user) {
            const group = await Group.findById(req.user.groupId)
            await group.updateOne({ edits: group.edits + 1 })
        }
        next()
    } catch {
        res.status(500).send({message: "Ошибка на сервере"})
    }
}