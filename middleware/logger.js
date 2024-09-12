import color from "colors"

export const logger = (req, res, next) => {
    const time = new Date(Date.now())
    console.log(color.yellow(`[${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}] ${req.method} ${req.path}`))
    next()
}