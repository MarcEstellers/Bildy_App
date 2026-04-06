import mongoose from "mongoose";

const { Schema } = mongoose;

const refreshTokenSchema = new Schema(
    {
        token: {
            type: String,
            required: [true, "El token es obligatorio"],
            unique: true,
            index: true // Índice para búsquedas rápidas al refrescar sesión
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, "El usuario asociado es obligatorio"]
        },
        expiresAt: {
            type: Date,
            required: [true, "La fecha de expiración es obligatoria"],
            expires: 0 // TTL Index: MongoDB borrará el documento automáticamente cuando llegue esta fecha
        },
        createdByIp: {
            type: String,
            default: ""
        },
        revokedAt: {
            type: Date
        },
        revokedByIp: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

/**
 * Comprueba si el token sigue siendo válido.
 * Un token es activo si no ha sido revocado y no ha expirado.
 */
refreshTokenSchema.methods.isActive = function () {
    const now = new Date();
    return !this.revokedAt && this.expiresAt > now;
};

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);

export default RefreshToken;