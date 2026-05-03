import multer from "multer";
import { AppError } from "../utils/AppError.js";

const imageFilter = (req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/png", "image/webp"];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(AppError.badRequest("Formato no soportado. Solo se permiten JPG, PNG o WEBP"), false);
    }
};

const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: imageFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 1
    }
});

export default upload;
