const express = require("express");
const router = express.Router();
const Project = require("../models/projectModel").Project;

// Router
router.all("/*", (req, res, next) => {
    req.app.locals.layout = "teacher";
    next();
});

router.route("/").get((req, res) => {
    if (req.isAuthenticated() && req.user.role == "Teacher") {
        Project.find({}, (err, founded) => {
            if (!err) {
                res.render("teacher/index", { req: req, project: founded })
            } else {
                res.send(err)
            }
        })
    } else {
        if (req.isAuthenticated()) {
            res.redirect("/student")
        } else {
            res.redirect('/login')
        }
    }
});

router.route("/projects/:projectId")
    .get((req, res) => {
        if (req.isAuthenticated() && req.user.role == "Teacher") {
            Project.findById(req.params.projectId, (err, found) => {
                if (!err) {
                    res.render("teacher/project", { req: req, project: found })
                } else {
                    res.send(err);
                }
            })
        } else {
            res.redirect('/login')
        }
    });

router.route("/projects/finalGrade")
    .post((req, res) => {
        Project.findByIdAndUpdate(
            req.body.id,
            { $set: { gradeFromTeacher: req.body.finalGrade } }, (err) => {
                if (err) {
                    res.send(err)
                } else {
                    res.redirect(`${req.body.id}`)
                }
            }
        );
    })

module.exports = router;