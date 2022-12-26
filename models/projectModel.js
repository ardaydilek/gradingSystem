const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const projectSchmema = new Schema({
    title: String,
    desc: String,
    file: String,
    gradesFromStudents: [{
        grade: Number,
        ratedUser: {
            type: Schema.Types.ObjectId,
            ref: 'user'
        }
    }],
    gradeFromTeacher: Number,
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    creationDate: {
        type: Date,
        default: Date.now()
    }
})

module.exports = { Project: mongoose.model("project", projectSchmema) };
