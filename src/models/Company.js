import mongoose from "mongoose";

const { Schema } = mongoose;

const companySchema = new Schema(
    {
        owner: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, "El propietario (owner) es requerido"]
        },
        name: {
            type: String,
            required: [true, "El nombre de la empresa es requerido"],
            trim: true
        },
        cif: {
            type: String,
            required: [true, "El CIF es requerido"],
            unique: true,
            trim: true,
            uppercase: true
        },
        address: {
            street: { type: String, default: "" },
            number: { type: String, default: "" },
            postal: { type: String, default: "" },
            city: { type: String, default: "" },
            province: { type: String, default: "" }
        },
        logo: {
            type: String,
            
            trim: true
        },
        isFreelance: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

// Índice para búsquedas rápidas por CIF
companySchema.index({ cif: 1 });

const Company = mongoose.model('Company', companySchema);

export default Company;