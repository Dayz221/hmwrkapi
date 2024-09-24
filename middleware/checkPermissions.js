import jwt from "jsonwebtoken"
import User from "../models/user.js"

export const checkPermissions = (neededPermissions) => {
    return async (req, res, next) => {
        try {
            if (!req.headers.authorization) return res.status(403).send({message: "Недостаточно прав доступа"})
                const token = req.headers.authorization.split(" ")[1]
        
                const decoded = jwt.verify(token, process.env.SECRET_KEY)
                const candidate = await User.findOne({ _id: decoded.id })
        
                if (candidate.permissions >= neededPermissions) {
                    const user = await User.findOne({ _id: candidate._id })
                    if (user) {
                        req.user = user
                        next()
                    } else {
                        res.status(403).send({message: "Недостаточно прав доступа"})
                    }
                } else {
                    res.status(403).send({message: "Недостаточно прав доступа"})
                }

        } catch (e) {
            console.log(e)
            res.status(403).send({message: "Недостаточно прав доступа"})
        }
    }
}