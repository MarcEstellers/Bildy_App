import multer from "multer";
import fs from "node:fs";
import { join, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { AppError } from "../utils/AppError.js";

// Configuración de rutas compatible con ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const UPLOAD_DIR = join(__dirname, "../../uploads");

// Asegurar que la carpeta de destino exista
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/**
 * Configuración del almacenamiento en disco
 */
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        // Extraemos la extensión y limpiamos el nombre para evitar conflictos
        const ext = extname(file.originalname).toLowerCase();
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `logo-${uniqueSuffix}${ext}`);
    }
});

/**
 * Filtro de archivos para validar tipos MIME
 */
const fileFilter = (req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/png", "image/webp"];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        // Pasamos el error al callback de multer para que llegue al errorHandler
        cb(AppError.badRequest("Formato no soportado. Solo se permiten JPG, PNG o WEBP"), false);
    }
};

/**
 * Instancia de Multer configurada
 */
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // Límite de 5MB
        files: 1                    // Solo 1 archivo por petición
    }
});

export default upload;