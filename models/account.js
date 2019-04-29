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
  async login(email_input, password_input, returnObject, callback) {
    var params = {
      TableName: "Account",
      Key: {
        email: email_input
      }
    };

    await documentClient.get(params, function(err, data) {
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
  signup(new_email, new_password) {
      
  }

};
