var AWS = require("aws-sdk");
AWS.config.loadFromPath("./credentials.json");
var sha1 = require("sha1");

var documentClient = new AWS.DynamoDB.DocumentClient();

function isEmpty(obj) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) return false;
  }
  return true;
}

module.exports = {
  createEvent(
    input_event_name,
    input_admin_username,
    input_dates,
    input_location,
    input_description,
    returnObject,
    callback
  ) {
    var eventid = sha1(input_admin_username + input_event_name + input_dates);
    var params = {
      TableName: "Event",
      Item: {
        event_id: eventid,
        event_name: input_event_name,
        event_location: input_location,
        event_dates: input_dates,
        event_admin: input_admin_username,
        event_description: input_description
      }
    };

    documentClient.put(params, function(err, data) {
      if (err) {
        returnObject.successful = false;
        returnObject.message = "Error: " + err;
        callback();
      }

      var update_params = {
        TableName: "Account",
        Key: {
          email: input_admin_username
        },
        UpdateExpression:
          "set #events = list_append(if_not_exists(#events, :empty_list), :event)",
        ExpressionAttributeNames: {
          "#events": "events"
        },
        ExpressionAttributeValues: {
          ":event": [eventid],
          ":empty_list": []
        }
      };
      documentClient.update(update_params, function(err, data) {
        if (err) {
          returnObject.successful = false;
          returnObject.message = "Error " + err;
          callback();
        } else {
          returnObject.successful = true;
          returnObject.message = "Successfully created event";
          callback();
        }
      });
    });
  },
  loadEvents(username, returnObject, callback) {
    var params = {
      TableName: "Account",
      Key: {
        email: username
      }
    };

    documentClient.get(params, function(err, data) {
      if (err) {
        returnObject.message = "Error: " + err;
        callback();
      }


      if (typeof data.Item.events === 'undefined') {
        returnObject.message = "no events found";
        callback();
      } else {
        returnObject.events = []
        var promises = []
        for (let i = 0; i < data.Item.events.length; i++) {
  
          var event_params = {
              TableName: "Event",
              Key: {
                  event_id: data.Item.events[i]
              }
          }
          documentClient.get(event_params, function(err, event_data) {
              if (typeof event_data.Item.event_time === 'undefined') {
                  event_data.Item.event_time = 'Time not chosen'
              }
              returnObject.events.push(event_data.Item)
              if (returnObject.events.length === data.Item.events.length) {
                  callback()
              }
              
          })
        }
      }

      
    });
  }
};
