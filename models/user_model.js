
const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique:[true, "email address is already axist"]
    } ,
    password:{
        type: String,
        required: true,

    },

})

const userModel = mongoose.model("userModel", userSchema)
module.exports = userModel
