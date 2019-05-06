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
    input_users,
    returnObject,
    callback
  ) {
    var eventid = sha1(input_admin_username + input_event_name + input_dates);
    var users = input_users.split(",");
    
    var dates = input_dates.substring(1, input_dates.length).split(",")
    users.push(input_admin_username);
    console.log(users);
    var params = {
      TableName: "Event",
      Item: {
        event_id: eventid,
        event_name: input_event_name,
        event_location: input_location,
        event_dates: dates,
        event_admin: input_admin_username,
        event_description: input_description,
        event_users: users
      }
    };
    returnObject.successful = true;

    documentClient.put(params, function(err, data) {
      if (err) {
        returnObject.successful = false;
        returnObject.message = "Error: " + err;
        callback();
        return;
      }

      var completed = 0;
      for (var i = 0; i < users.length; i++) {
        var update_params = {
          TableName: "Account",
          Key: {
            email: users[i]
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
          completed += 1
          if (err) {
            if (completed == users.length) {
              returnObject.successful = false;

              callback();
              return;
            }
          } else {
            if (completed == users.length) {
              callback();
              return;
            }
          }
        });
      }
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
        return;
      }

      if (typeof data.Item.events === "undefined") {
        returnObject.message = "no events found";
        callback();
        return;
      } else {
        returnObject.events = [];
        var promises = [];
        for (let i = 0; i < data.Item.events.length; i++) {
          var event_params = {
            TableName: "Event",
            Key: {
              event_id: data.Item.events[i]
            }
          };
          documentClient.get(event_params, function(err, event_data) {
            if (typeof event_data.Item.event_time === "undefined") {
              event_data.Item.event_time = "Time not chosen";
            }
            returnObject.events.push(event_data.Item);
            if (returnObject.events.length === data.Item.events.length) {
              callback();
              return;
            }
          });
        }
      }
    });
  },
  chooseTime(input_event_id, returnObject, callback) {

    var params = {
      TableName: 'Event',
      Key: {
        event_id: input_event_id
      }
    }
    var schedules = [];

    documentClient.get(params, function(err, event_data) {
      if (err) {
        returnObject.successful = false
        callback()
        return;
      }
      
      var completed = 0;
      for (var i = 0; i < event_data.Item.event_users.length; i ++) {
        var schedule_params = {
          TableName: 'Account',
          Key: {
            email: event_data.Item.event_users[i]
          }
        }

        documentClient.get(schedule_params, function(err, data) {
          completed += 1
          if (typeof data.Item.schedule === "undefined") {
            if (completed == event_data.Item.event_users.length) {
              returnObject.schedules = schedules
              callback()
              return;
            }
          } else {
            schedules.push(data.Item.schedule.split('').map( Number ))
            if (completed == event_data.Item.event_users.length) {
              returnObject.schedules = schedules
              callback()
              return;
            }

          }
        })
        
      } 

    })

  }, 
  addSchedules(schedules, returnObject, callback) {
    var addedSchedules = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    var completed = 0
    for (var i = 0; i < schedules.length; i++) {
      for (var x = 0; x < 91; x++) {
        completed += 1
        addedSchedules[x] += schedules[i][x]

        if (completed == (schedules.length * 91)) {
          returnObject.addedSchedules = addedSchedules
          callback()
        }
      }
    }
  },
  bestTimeslot(addedSchedules, returnObject, callback) {
    var max = 0
    var maxIndex = 0
    var completed = 0
    for (var i = 0; addedSchedules.length; i ++) {
      completed += 1

      if (addedSchedules[i] > max) {
        max = addedSchedules[i]
        maxIndex = i
        if (completed == addedSchedules.length) {
          returnObject.maxIndex = maxIndex
          callback()
        }

      } else {
        if (completed == addedSchedules.length) {
          returnObject.maxIndex = maxIndex
          callback()
        }
      }
    }
  }
};
