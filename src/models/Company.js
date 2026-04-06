import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

const companySchema = new mongoose.Schema({
    owner: {
        type: ObjectId,
        ref: 'User'
    },
    name: String,
    cif: String,
    address: {
        street: String,
        number: String,
        postal: String,
        city: String,
        province: String
    },
    logo: String,
    isFreelance: Boolean,
    deleted: Boolean
}, {
    timestamps: true
});

const Company = mongoose.model('Company', companySchema);

export default Company;