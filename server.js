const http = require('http')
const port = 3000
const account = require('./models/account.js')
const express = require('express')

var app = express()
var test_email = 'tessdfting'
var test_password = 'testing'

app.get('/', function(req, res) {
    res.send('server is running')
})

app.get('/login/:email/:password', function(req, res){
    console.log(req.params)
    account.login(req.params.email, req.params.password)
    res.send(res)
})

var server = app.listen(3000, function() {

})
