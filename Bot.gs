//construct a function that way you can add features to your bot.
function Bot (token, update) {
 this.token = token;
 this.update = update;
 this.handlers = [];
}


// Defines a way to register handlers that are triggered by a given condition.
Bot.prototype.register = function (handler) {
  this.handlers.push(handler);
}


//The process method invokes only handlers that satisfy the given condition.
Bot.prototype.process = function () {  
  for (var i in this.handlers) {
    var event = this.handlers[i];
    var result = event.condition(this);
    if (result) {
      return event.handle(this);
    }
  }
}

//The request method handles the call to the Telegram Bot Platform. It sends each request as a serialized JSON object.
Bot.prototype.request = function (method, data) {
 var options = {
  'method' : 'post',
  'contentType': 'application/json',
  // Convert the JavaScript object to a JSON string.
  'payload' : JSON.stringify(data)
 };
  
 var response = UrlFetchApp.fetch('https://api.telegram.org/bot' + this.token + '/' + method, options);
  
 if (response.getResponseCode() == 200) {
  return JSON.parse(response.getContentText());
 }
return false;
}

//The replyToSender method is a utility function for your convenience.
Bot.prototype.replyToSender = function (text) {
 return this.request('sendMessage', {
  'chat_id': this.update.message.from.id,
  'text': text
 });
}

//Sends a direct message
Bot.prototype.pushMessage = function (text, id) {
  this.request('sendMessage', {
    'chat_id' : id,
    'text' : text,
  });
}

//still under test to create a custom keyboard
Bot.prototype.createKeyboard = function(arrayOfButtons) {
  return this.request('sendMessage', {
    'chat_id': this.update.message.from.id,
    'text': "Quale?" , 
    'reply_markup' : { 
      'keyboard' : [ ["Test1"] ,  ["Test2"] ],
      'resize_keyboard' : true
    }
  });
}
//still under test to delete a custom keyboard
Bot.prototype.destroyKeyboard = function() {
  return this.request('sendMessage', {
    'chat_id': this.update.message.from.id,
    'text': "OK!" , 
    'reply_markup' : { 
      'remove_keyboard' : true
    }
  });
}
