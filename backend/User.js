const mongoose = require('mongoose');
const userSchema =  new mongoose.Schema({
    firstName: {
        type:String,
        required: true,
        minlength: 4,
        maxlength: 50

    },
    lastName:{
        type:String,
        required: true,
        minlength: 4,
        maxlength: 50

    },
    phoneNumber:{
        type:String,
        required: true,
        minlength: 4,
        maxlength: 50

    },
    email:{
        type:String,
        required: true,
        minlength: 4,
        maxlength: 50

    },
    password: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 1024
    },
    address: {
        type:String,
        required: true,
        minlength: 4,
        maxlength: 50
    }
});

module.exports = mongoose.model('User',userSchema);