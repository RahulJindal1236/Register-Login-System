//jshint esversion:6
const express = require('express')
const ejs = require('ejs')
const mongoose = require('mongoose')
const session = require('express-session')
const passport = require('passport')
const passportLocalMongoose = require('passport-local-mongoose')
require('dotenv').config()

// Creating express app
const app = express()

//Some Important configures
app.use(express.static('public'))
app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: true }))

// Creating session
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
  })
)

// initializing passport session
app.use(passport.initialize())
app.use(passport.session())

// mongodDB connection
mongoose.connect(process.env.URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

// User schema
const userSchema = mongoose.Schema({
  username: String,
  password: String,
})

// plugin
userSchema.plugin(passportLocalMongoose)

// Creating model of use schema
const User = mongoose.model('User', userSchema)

// Serialize and Deserialize
passport.use(User.createStrategy())
// passport.serializeUser(User.serializeUser())
// passport.deserializeUser(User.deserializeUser())
passport.serializeUser(function (User, done) {
  done(null, User)
})

passport.deserializeUser(function (User, done) {
  done(null, User)
})

// Routes
app.get('/', (req, res) => {
  res.render('home')
})
app.get('/register', (req, res) => {
  res.render('register')
})
app.get('/login', (req, res) => {
  res.render('login')
})
app.get('/secrets', (req, res) => {
  if (req.isAuthenticated()) res.render('secrets')
  else res.redirect('/login')
})
app.get('/logout', (req, res) => {
  req.logout()
  res.redirect('/')
})

app.post('/register', (req, res) => {
  User.register(
    { username: req.body.username },
    req.body.password,
    (err, result) => {
      if (err) {
        console.log(err)
        res.redirect('/register')
      } else {
        passport.authenticate('local')(req, res, () => {
          res.redirect('secrets')
        })
      }
    }
  )
})

app.post('/login', (req, res) => {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  })
  req.login(user, (err) => {
    if (err) console.log(err)
    else {
      passport.authenticate('local')(req, res, () => {
        res.redirect('/secrets')
      })
    }
  })
})

app.listen(3000, () => {
  console.log('Server is up and running')
})
