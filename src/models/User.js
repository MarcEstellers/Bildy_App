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
            required: [true, "La contraseña es requerida"], // IMPORTANTE: Siempre requerida
            select: false 
        },
        name: {
            type: String,
            trim: true
        },
        lastName: {
            type: String,
            trim: true
        },
        nif: {
            type: String,
            unique: false,
            sparse: true, // <--- CLAVE: Permite múltiples 'null/undefined' mientras el perfil no esté completo
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
        versionKey: false,
        toJSON: {
            virtuals: true,
            transform(doc, ret) {
                delete ret.password;
                delete ret.verificationCode;
                delete ret.verificationAttempts;
                // El id de mongo suele ser más útil que _id en el frontend
                ret.id = ret._id;
                return ret;
            }
        }
    }
);

userSchema.index({ status: 1, role: 1, company: 1 });

userSchema.virtual('fullName').get(function() {
    if (!this.name && !this.lastName) return "Usuario pendiente de completar";
    return `${this.name} ${this.lastName}`;
});

const User = mongoose.model('User', userSchema);

export default User;