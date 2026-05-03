import mongoose from "mongoose";

const { Schema } = mongoose;

const deliveryNoteSchema = new Schema(
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
        client: {
            type: Schema.Types.ObjectId,
            ref: 'Client',
            required: [true, "El cliente es requerido"]
        },
        project: {
            type: Schema.Types.ObjectId,
            ref: 'Project',
            required: [true, "El proyecto es requerido"]
        },
        format: {
            type: String,
            enum: ["material", "hours"],
            required: [true, "El formato es requerido"]
        },
        description: {
            type: String,
            default: ""
        },
        workDate: {
            type: Date,
            required: [true, "La fecha de trabajo es requerida"]
        },
        material: {
            type: String,
            default: ""
        },
        quantity: {
            type: Number,
            default: 0
        },
        unit: {
            type: String,
            default: ""
        },
        hours: {
            type: Number,
            default: 0
        },
        workers: [
            {
                name: { type: String, required: true },
                hours: { type: Number, required: true }
            }
        ],
        signed: {
            type: Boolean,
            default: false
        },
        signedAt: {
            type: Date,
            default: null
        },
        signatureUrl: {
            type: String,
            default: ""
        },
        pdfUrl: {
            type: String,
            default: ""
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

deliveryNoteSchema.index({ company: 1, project: 1, deleted: 1 });
deliveryNoteSchema.index({ company: 1, client: 1, workDate: -1 });

const DeliveryNote = mongoose.model('DeliveryNote', deliveryNoteSchema);

export default DeliveryNote;
