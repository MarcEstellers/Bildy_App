import mongoose from "mongoose";

const { Schema } = mongoose;

const clientSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, "El usuario es requerido"]
        },
        company: {
            type: Schema.Types.ObjectId,
            ref: 'Company',
            required: [true, "La compañía es requerida"]
        },
        name: {
            type: String,
            required: [true, "El nombre es requerido"],
            trim: true
        },
        cif: {
            type: String,
            required: [true, "El CIF es requerido"],
            trim: true,
            uppercase: true
        },
        email: {
            type: String,
            trim: true,
            lowercase: true
        },
        phone: {
            type: String,
            trim: true
        },
        address: {
            street:   { type: String, default: "" },
            number:   { type: String, default: "" },
            postal:   { type: String, default: "" },
            city:     { type: String, default: "" },
            province: { type: String, default: "" }
        },
        deleted: {
            type: Boolean,
            default: false
        },
        deletedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

clientSchema.index({ company: 1, cif: 1 }, { unique: true });
clientSchema.index({ company: 1, deleted: 1 });

const Client = mongoose.model('Client', clientSchema);

export default Client;
