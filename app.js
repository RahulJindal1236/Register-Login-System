//jshint esversion:6
const express = require('express')
const ejs = require('ejs')
const mongoose = require('mongoose')
const encrypt = require('mongoose-encryption')
require('dotenv').config()

const app = express()

app.use(express.static('public'))
app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: true }))

mongoose.connect(process.env.URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

const userSchema = mongoose.Schema({
  email: String,
  password: String,
})

userSchema.plugin(encrypt, {
  secret: process.env.SECRET,
  encryptedFields: ['password'],
})
const User = mongoose.model('User', userSchema)

app.get('/', (req, res) => {
  res.render('home')
})
app.get('/register', (req, res) => {
  res.render('register')
})
app.get('/login', (req, res) => {
  res.render('login')
})
app.post('/register', (req, res) => {
  const newUser = new User({
    email: req.body.username,
    password: req.body.password,
  })
  newUser.save((err) => {
    if (err) throw err
    else console.log('user saved')
    res.render('Secrets')
  })
})

app.post('/login', (req, res) => {
  const username = req.body.username
  const password = req.body.password
  console.log(typeof username)

  User.findOne({ email: username }, (err, result) => {
    if (err) console.log(err)
    else {
      if (result) {
        if (result.password === password) res.render('Secrets')
      } else res.render('login')
    }
  })
})

app.listen(3000, () => {
  console.log('Server is up and running')
})
