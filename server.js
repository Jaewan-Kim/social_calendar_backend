const http = require('http')
const port = 3000
const account = require('./models/account.js')
const express = require('express')
const event = require('./models/event.js')
var sha1 = require('sha1')

var app = express()

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

app.get('/', function(req, res) {
    res.send('server is running')
})

app.get('/login/:email/:password', function(req, res){
    
    var returnObject = new Object()
    returnObject.successful = false
    account.login(req.params.email, sha1(req.params.password), returnObject, function() {
        console.log(returnObject)
        res.send(returnObject)
    })

})

app.get('/signup/:email/:password/:name', function(req, res) {

    var returnObject = new Object()
    account.signup(req.params.email, sha1(req.params.password), req.params.name, returnObject, function() {
        res.send(returnObject)
    })
})

app.get('/settings/:email/:password/:newPassword', function(req, res) {

    var returnObject = new Object()
    account.updatePassword(req.params.email, sha1(req.params.password), sha1(req.params.newPassword), returnObject, function() {
        res.send(returnObject)
    })
})

app.get('/createevent/:eventname/:username/:dates/:location/:description/:users', function(req, res) {
    var returnObject = new Object()
    try {
        event.createEvent(req.params.eventname, req.params.username, req.params.dates, req.params.location, req.params.description, req.params.users, returnObject, function() {
            res.send(returnObject)
        })
    } catch (err) {
        res.send(returnObject)
    }
    
})

app.get('/loadevents/:username', function(req, res) {
    var returnObject = new Object()
    event.loadEvents(req.params.username, returnObject, function() {
        console.log(returnObject)
        res.send(returnObject)
    })
})

app.get('/updateschedule/:username/:schedule', function(req, res) {
    var returnObject = new Object()
    account.updateSchedule(req.params.username, req.params.schedule, returnObject, function() {
        res.send(returnObject)
    })
})
var server = app.listen(3000, function() {

})
