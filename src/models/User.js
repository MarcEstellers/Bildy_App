import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true
    },
    password: String,
    name: String,
    lastName: String,
    nif: String,
    role: {
        type: String,
        enum: ['admin', 'guest'],
        default: 'admin'
    },
    status: {
        type: String,
        enum: ['pending', 'verified'],
        default: 'pending',
        index: true
    },
    verificationCode: String,
    verificationAttempts: Number,
    company: {
        type: ObjectId,
        ref: 'Company',
        index: true
    },
    address: {
        street: String,
        number: String,
        postal: String,
        city: String,
        province: String
    },
    deleted: Boolean
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

userSchema.virtual('fullName').get(function () {
    return this.name + ' ' + this.lastName;
});

const User = mongoose.model('User', userSchema);

export default User;