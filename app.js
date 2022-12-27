require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
mongoose.set('strictQuery', false);
const ejs = require('ejs');
const bodyParser = require('body-parser');
const session = require('express-session')
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const Port = 3000;
const Schema = mongoose.Schema;
const app = express();
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs')
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session());
// mongoose.connect(`mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:27017/${process.env.DB_NAME}`)
mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/${process.env.DB_NAME}`)
const User = require("./models/userModel").User;
const Project = require("./models/projectModel").Project;
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// Routes
const studentRoutes = require("./routes/studentRoutes.js");
const teacherRoutes = require("./routes/teacherRoutes");

app.use("/student", studentRoutes);
app.use("/teacher", teacherRoutes);

app.route('/')
    .get((req, res) => {
        if (!req.user) {
            res.render("index", { req: req });
        } else {
            if (req.user.role == 'Student') {
                res.redirect('/student')
            } else {
                res.redirect('/teacher')
            }
        }
    });
app.route("/register")
    .get((req, res) => {
        if (req.isAuthenticated() && req.user.role == "Student") {
            res.redirect('/student')
        } else if (req.isAuthenticated() && req.user.role == "Teacher") {
            res.redirect('/teacher')
        } else {
            res.render("register", { req: req });
        }
    })
    .post((req, res) => {
        let role;
        let count;
        if (req.body.role2 === '2') {
            role = "Student"
        } else {
            role = "Teacher"
        };

        User.register(new User({ username: req.body.username, role: role }), req.body.password, (err, user) => {
            if (err) {
                res.send(err)
            } else {
                passport.authenticate('local')(req, res, () => {
                    res.redirect("/")
                })
            }
        })
    });

app.route("/login")
    .get((req, res) => {
        if (req.isAuthenticated() && req.user.role == "Student") {
            res.redirect('/student')
        } else if (req.isAuthenticated() && req.user.role == "Teacher") {
            res.redirect('/teacher')
        } else {
            res.render("login", { req: req });
        }
    })
    .post(passport.authenticate('local', { failureRedirect: '/login' }),
        function (req, res) {
            async function getUser() {
                const foundUser = await User.findOne({ username: req.body.username });
                return foundUser;
            };
            async function doStuffWithUser() {
                const user = await getUser();
                if (user.role == "Student") {
                    res.redirect('/student');
                } else {
                    res.redirect('/teacher');
                }
            }
            doStuffWithUser();
        });

app.route('/logout')
    .get((req, res) => {
        req.logout(function (err) {
            if (err) { res.send(err); }
            res.redirect('/');
        });
    });


app.listen(process.env.PORT || Port, () => {
    console.log(`Server started on http://localhost:${Port}`)
});




