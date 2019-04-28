var AWS = require('aws-sdk')
AWS.config.loadFromPath('./credentials.json')

var documentClient = new AWS.DynamoDB.DocumentClient();

function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

module.exports = {
    login(email_input, password_input) {

        var params = {
            TableName: 'Account',
            Key: {
                email : email_input
            }
        }

        documentClient.get(params, function(err, data) {
            if (err) {
                console.log(`Error occurred during login() with email ${email_input}. `, err)
            }

            console.log(data)

            if (isEmpty(data)) {
                return console.log(`couldn't find user with email ${email_input}`)
            } else {

                var password = data['Item'].password

                if (password === password_input) {
                    console.log('login successful')
                } else {
                    console.log('wrong password')
                }
            }

        })
    },
    signup(new_email, new_password) {

    }
}
