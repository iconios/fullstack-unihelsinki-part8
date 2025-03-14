const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        minlength: 5
    },
    favoriteGenre: {
        type: String,
        required: true
    }
})

const User = mongoose.model('User', userSchema)

module.exports = User