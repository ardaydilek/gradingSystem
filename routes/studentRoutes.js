const express = require("express");
const router = express.Router();
const Project = require("../models/projectModel").Project;
// Router
router.all("/*", (req, res, next) => {
    req.app.locals.layout = "student";
    next();
});

router.route("/").get((req, res) => {
    if (req.isAuthenticated() && req.user.role == "Student") {
        Project.find({}, (err, founded) => {
            if (!err) {
                res.render("student/index", { req: req, project: founded })
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
                res.redirect('/student')
            } else {
                res.send(err)
            }
        })
    });

router.route("/projects/:projectId")
    .get((req, res) => {
        if (req.isAuthenticated() && req.user.role == "Student") {
            Project.findById(req.params.projectId, (err, found) => {
                if (!err) {
                    res.render("student/project", { req: req, project: found })
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
                    res.redirect(`${req.body.id}`)
                }
            }
        );
    })

module.exports = router;