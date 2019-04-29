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
    returnObject.successful = false
    account.login(req.params.email, req.params.password, returnObject, function() {
        console.log(returnObject)
        res.send(returnObject)
    })

})

app.get('/signup/:email/:password/:name', function(req, res) {

    var returnObject = new Object()
    account.signup(req.params.email, req.params.password, req.params.name, returnObject, function() {
        res.send(returnObject)
    })
})

var server = app.listen(3000, function() {

})
