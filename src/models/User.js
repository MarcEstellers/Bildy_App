import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema(
    {
        email: {
            type: String,
            required: [true, "El email es requerido"],
            trim: true,
            lowercase: true,
            unique: true,
            match: [/^\S+@\S+\.\S+$/, "Por favor, usa un formato de email válido"]
        },
        password: {
            type: String,
            required: [true, "La contraseña es requerida"],
            select: false // No se incluye en consultas por defecto
        },
        name: {
            type: String,
            required: [true, "El nombre es requerido"],
            trim: true
        },
        lastName: {
            type: String,
            required: [true, "El apellido es requerido"],
            trim: true
        },
        nif: {
            type: String,
            required: [true, "El NIF es requerido"],
            unique: true,
            trim: true,
            uppercase: true
        },
        role: {
            type: String,
            enum: ["admin", "guest"],
            default: "admin"
        },
        status: {
            type: String,
            enum: ["pending", "verified"],
            default: "pending"
        },
        verificationCode: {
            type: String,
            required: true,
            select: false
        },
        verificationAttempts: {
            type: Number,
            default: 3,
            select: false
        },
        company: {
            type: Schema.Types.ObjectId,
            ref: 'Company',
            required: [true, "La empresa asociada es requerida"]
        },
        address: {
            street:   { type: String, default: "" },
            number:   { type: String, default: "" },
            postal:   { type: String, default: "" },
            city:     { type: String, default: "" },
            province: { type: String, default: "" }
        }
    },
    {
        timestamps: true,
        versionKey: false, // Elimina el campo __v
        toJSON: {
            virtuals: true, // Para que el fullName aparezca en el JSON
            transform(doc, ret) {
                delete ret.password;
                delete ret.verificationCode;
                delete ret.verificationAttempts;
                return ret;
            }
        }
    }
);

// Índice compuesto para optimizar búsquedas frecuentes
userSchema.index({ status: 1, role: 1, company: 1 });

// Virtual para obtener el nombre completo
// IMPORTANTE: No usar arrow functions aquí para poder usar 'this'
userSchema.virtual('fullName').get(function() {
    return `${this.name} ${this.lastName}`;
});

const User = mongoose.model('User', userSchema);

export default User;