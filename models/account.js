var AWS = require("aws-sdk");
AWS.config.loadFromPath("./credentials.json");

const errorMessage = "Error: ";
const emailNotFoundMessage = "Email not found";
const wrongPasswordMessage = "Wrong password";
const loginSuccessMessage = "Login success";

var documentClient = new AWS.DynamoDB.DocumentClient();

function isEmpty(obj) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) return false;
  }
  return true;
}

module.exports = {
  login(email_input, password_input, returnObject, callback) {
    var params = {
      TableName: "Account",
      Key: {
        email: email_input
      }
    };

    documentClient.get(params, function(err, data) {
      if (err) {
        console.log(
          `Error occurred during login() with email ${email_input}. `,
          err
        );
        returnObject.message = errorMessage + err;
      } else {
        if (isEmpty(data)) {
          console.log(`couldn't find user with email ${email_input}`);
          returnObject.message = emailNotFoundMessage;
        } else {
          var password = data["Item"].password;

          if (password === password_input) {
            console.log("login successful");
            returnObject.message = loginSuccessMessage;
            returnObject.data = data;
            returnObject.successful = true;
          } else {
            console.log("wrong password");
            returnObject.message = wrongPasswordMessage;
          }
        }
      }

      callback()

    });

  },
  signup(new_email, new_password, new_name, returnObject, callback) {
      
    var params = {
      TableName: 'Account',
      Item: {
        email: new_email,
        password: new_password,
        name: new_name
      }
    }

    var params_for_duplicate = {
      TableName: "Account",
      Key: {
        email: new_email
      }
    };

    documentClient.get(params_for_duplicate, function(err, data) {
      if (err) {
        returnObject.successful = false
        returnObject.duplicate = false
        returnObject.message = 'Error: ' + err
        callback()

      } else {
        if (isEmpty(data)) {
          documentClient.put(params, function(err, data) {
            if (err) {
              returnObject.successful = false
              returnObject.duplicate = false
              returnObject.message = 'Error: ' + err
              callback()

            } else {
              returnObject.duplicate = false
              returnObject.successful = true
              returnObject.message = 'Successfully created a new account'
              callback()
            }
          })
        } else {
          returnObject.duplicate = true
          returnObject.successful = false
          returnObject.message = 'This email already exists'  
          callback()
        }
      }
      
    })

  },
  updatePassword(username, password, newPassword, returnObject, callback) {

    var returnObjectTemp = new Object()

    this.login(username, password, returnObjectTemp, function() {
      
      if (returnObjectTemp.message === wrongPasswordMessage) {
        returnObject.successful = false
        callback()
      } else if (returnObjectTemp.message === loginSuccessMessage) {

        var params = {
          TableName: 'Account',
          Key: {
            'email' : username
          },
          UpdateExpression: 'set password = :p',
          ExpressionAttributeValues: {
            ':p' : newPassword
          }
        }

        documentClient.update(params, function(err, data) {
          if (err) {
            returnObject.successful = false
            console.log("Error in updatePassword() ", err)
            callback()
          } else {
            returnObject.successful = true
            callback()
          }
        })

      }


    })
  }

};
