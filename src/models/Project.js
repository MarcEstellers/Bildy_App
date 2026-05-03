import mongoose from "mongoose";

const { Schema } = mongoose;

const projectSchema = new Schema(
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
        name: {
            type: String,
            required: [true, "El nombre es requerido"],
            trim: true
        },
        projectCode: {
            type: String,
            required: [true, "El código de proyecto es requerido"],
            trim: true
        },
        address: {
            street:   { type: String, default: "" },
            number:   { type: String, default: "" },
            postal:   { type: String, default: "" },
            city:     { type: String, default: "" },
            province: { type: String, default: "" }
        },
        email: {
            type: String,
            trim: true,
            lowercase: true
        },
        notes: {
            type: String,
            default: ""
        },
        active: {
            type: Boolean,
            default: true
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

projectSchema.index({ company: 1, projectCode: 1 }, { unique: true });
projectSchema.index({ company: 1, client: 1, deleted: 1 });

const Project = mongoose.model('Project', projectSchema);

export default Project;
