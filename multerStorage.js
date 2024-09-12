import multer from "multer"
import path from "path"

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'temp/')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname))
    }
})

export const uploadFile = multer({ 
    storage: storage,
    limits: { fileSize: 25 * 1024 * 1024 }
})