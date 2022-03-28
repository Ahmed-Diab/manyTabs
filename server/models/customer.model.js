const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique:[true, 'this email is Alredy taken']

        },
        phoneNumber: {
            type: String,
            required: true,
            maxlength:[11, "phone number max length 11"],
            unique:[true, 'this phone number is is exest']
        }
    },
    {
        versionKey: false,
    }
);

module.exports = mongoose.model('Customer', CustomerSchema);
