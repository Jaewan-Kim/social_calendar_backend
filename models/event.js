var AWS = require("aws-sdk");
AWS.config.loadFromPath("./credentials.json");
var sha1 = require('sha1')

var documentClient = new AWS.DynamoDB.DocumentClient();

function isEmpty(obj) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) return false;
    }
    return true;
}

module.exports = {
    createEvent(input_event_name, input_admin_username, input_dates, input_location, returnObject, callback) {
        
        var eventid = sha1(input_admin_username + input_event_name + input_dates)
        var params = {
           TableName: "Event",
           Item: {
               event_id: eventid,
               event_name: input_event_name,
               event_location: input_location,
               event_dates: input_dates,
               event_admin: input_admin_username
           } 
        }

        documentClient.put(params, function(err, data) {
            if (err) {
                returnObject.successful = false
                returnObject.message = 'Error: ' + err
                callback()
            }

            var update_params = {
              TableName: "Account",
              Key: {
                email: input_admin_username
              },
              UpdateExpression:
                "set #admin_events = list_append(if_not_exists(#admin_events, :empty_list), :event)",
              ExpressionAttributeNames: {
                "#admin_events": "admin_events"
              },
              ExpressionAttributeValues: {
                ":event": [eventid],
                ":empty_list": []
              }
            };
            documentClient.update(update_params, function(err, data) {
                if (err) {
                    returnObject.successful = false
                    returnObject.message = 'Error ' + err
                    callback()
                } else {
                    returnObject.successful = true
                    returnObject.message = "Successfully created event"
                    callback()
                }
            })
        })
    }
}