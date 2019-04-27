const http = require('http')
const port = 3000
const account = require('./models/account.js')

var test_email = 'testing'
var test_password = 'testing'

const requestHandler = (request, response) => {
  console.log(request.url)
  account.signup();
  account.login(test_email, test_password)
  response.end('Backend for Social Calendar application')
}

const server = http.createServer(requestHandler)

server.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }

  console.log(`server is listening on ${port}`)
})