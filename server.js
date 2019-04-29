const http = require('http')
const port = 3000
const account = require('./models/account.js')
const express = require('express')

var app = express()

app.get('/', function(req, res) {
    res.send('server is running')
})

app.get('/login/:email/:password', function(req, res){
    var returnObject = new Object()

    account.login(req.params.email, req.params.password, returnObject, function() {
        console.log(returnObject)
        res.send(returnObject)
    })

})

app.get('/signup', function(req, res) {
    account.signup(1, 1)
    console.log(2)
})

var server = app.listen(3000, function() {

})
