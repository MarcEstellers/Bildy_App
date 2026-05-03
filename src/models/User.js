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
            select: false 
        },
        name: {
            type: String,
            trim: true,
            default: ""
        },
        lastName: {
            type: String,
            trim: true,
            default: ""
        }, 
        nif: {
            type: String,
            unique: true,
            sparse: true,
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
            street:   { type: String, default: "x" },
            number:   { type: String, default: "x" },
            postal:   { type: String, default: "x" },
            city:     { type: String, default: "x" },
            province: { type: String, default: "x" }
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