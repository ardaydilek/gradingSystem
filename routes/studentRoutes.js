const express = require("express");
const router = express.Router();
const Project = require("../models/projectModel").Project;
const User = require("../models/userModel").User;
const flash = require("connect-flash");
// Router
router.all("/*", (req, res, next) => {
    req.app.locals.layout = "student";
    next();
});
router.use(flash());
router.route("/").get((req, res) => {
    if (req.isAuthenticated() && req.user.role == "Student") {
        Project.find({}, (err, founded) => {
            if (!err) {
                res.render("student/index", { req: req, project: founded, message: req.flash('message') })
            } else {
                res.send(err)
            }
        })
    } else {
        if (req.isAuthenticated()) {
            res.redirect("/teacher")
        } else {
            res.redirect('/login')
        }
    }
});

router.route("/submitProject")
    .get((req, res) => {
        if (req.isAuthenticated() && req.user.role == "Student") {
            res.render("student/submit", { req: req })
        } else {
            res.redirect('/login')
        }
    })
    .post((req, res) => {
        const post = new Project({
            title: req.body.title,
            desc: req.body.desc,
            user: req.user
        })
        post.save((err) => {
            if (!err) {
                req.flash('message', 'Submitted Succesfully')
                res.redirect('/student')
            } else {
                res.send(err)
            }
        })
    });

router.route("/projects/:projectId")
    .get((req, res) => {
        const message = req.flash('message')
        if (req.isAuthenticated() && req.user.role == "Student") {
            Project.findById(req.params.projectId, (err, found) => {
                if (!err) {
                    res.render("student/project", { req: req, project: found, message: message })
                } else {
                    res.send(err);
                }
            })
        } else {
            res.redirect('/login')
        }
    })

router.route("/projects/submitGrade")
    .post((req, res) => {
        const gradeAndUser = {
            grade: req.body.grade,
            ratedUser: req.user
        }
        Project.findByIdAndUpdate(
            req.body.id,
            { $push: { gradesFromStudents: gradeAndUser } }, (err) => {
                if (err) {
                    res.send(err)
                } else {
                    req.flash('message', 'Graded Succesfully')
                    res.redirect(`${req.body.id}`)
                }
            }
        );
    });

router.route("/projects/submitComment")
    .post((req, res) => {
        // console.log(req.body.commentId, req.body.comment)
        const comment = {
            comment: req.body.comment,
            commentedUser: req.user
        }
        Project.findByIdAndUpdate(
            req.body.commentId,
            { $push: { comments: comment } }, (err) => {
                if (err) {
                    res.send(err)
                } else {
                    req.flash('message', 'Commented Succesfully')
                    res.redirect(`${req.body.commentId}`)
                }
            }
        );
    })

router.route("/projects/deleteComment")
    .post((req, res) => {
        const id = req.body.checkbox;
        Project.findByIdAndUpdate(req.body.projectId, { $pull: { comments: { _id: id } } }, (err) => {
            if (!err) {
                req.flash('message', 'Deleted Succesfully')
                res.redirect(`${req.body.projectId}`)
            } else {
                res.send(err)
            }
        })
    })

module.exports = router;