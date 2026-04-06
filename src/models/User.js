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
            match: [/^\S+@\S+\.\S+$/, "Por favor, usa un email válido"]
        },
        password: {
            type: String,
            required: [true, "La contraseña es requerida"],
            select: false // No se incluye en las consultas por defecto
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
            uppercase: true // Los NIF suelen ir en mayúsculas
        },
        role: {
            type: String,
            enum: {
                values: ["admin", "guest"],
                message: "{VALUE} no es un rol válido"
            },
            default: "admin"
        },
        status: {
            type: String,
            enum: ["pending", "verified"],
            default: "pending",
            select: false
        },
        verificationCode: {
            type: String,
            select: false,
            required: true
        },
        verificationAttempts: {
            type: Number,
            default: 3,
            select: false
        },
        company: {
            type: Schema.Types.ObjectId, // Corregido para que funcione
            ref: 'Company',
            required: [true, "La empresa es obligatoria"]
        },
        address: {
            street: { type: String},
            number: { type: String},
            postal: { type: String},
            city: { type: String},
            province: { type: String}
        }
    },
    {
        timestamps: true, // Crea createdAt y updatedAt automáticamente
        versionKey: false // Quita el molesto campo __v
    }
);

// Índices para optimizar búsquedas frecuentes
userSchema.index({status: 1, role: 1, company: 1})
userSchema.virtual('fullName').get(() => this.name + ' ' + this.lastName)
userSchema.index({ email: 1 });

const User = mongoose.model('User', userSchema);

export default User;