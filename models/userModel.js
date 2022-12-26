const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
    email: String,
    password: String,
    role: String
});
userSchema.plugin(passportLocalMongoose);

module.exports = { User: mongoose.model("user", userSchema) };
