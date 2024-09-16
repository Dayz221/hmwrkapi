import Group from "../models/group.js"

class ApiController {
    async getGroups(req, res) {
        try {
            const groups = await Group.find()
            const answ = groups.map(el => {return { name: el.name, _id: el._id }})
            res.status(200).send({ groups: answ, message: "OK" })
        } catch (e) {
            console.log(e)
            res.status(400).send({ message: "Ошибка, проверьте данные" })
        }
    }
}

export default new ApiController()