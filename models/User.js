const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10

const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        trim: true,
        unique: 1
    },
    password: {
        type: String,
        minlength: 5
    },
    lastname: {
        type: String,
        maxlength: 50
    },
    role: {
        type: Number,
        default: 0
    },
    image: String,
    token: {
        type: String
    },
    tokenExp: {
        type: Number
    }
})

userSchema.pre('save', function (next) {

    var user = this;
    if (user.isModified('password')) {
        //비밀번호 암호화
        bcrypt.genSalt(saltRounds, function (err, salt) {
            if (err) return next(err)
            bcrypt.hash(user.password, salt, function (err, hash) {
                if (err) return next(err)
                user.password = hash
                next()//index.js로 넘어가서 'save' 부분 다시 수행
            })
        })
    }
})

const User = mongoose.model('User', userSchema)

module.exports = { User } //다른 곳에서 이것을 쓸 수 있도록 export