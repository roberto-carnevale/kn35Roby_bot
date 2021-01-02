//object to process commands
function CommandBus() {
 this.commands = [];
}

//you register commands that are only triggered when a specific regex matches the command.
CommandBus.prototype.on = function (regexp, callback) {
 this.commands.push({'regexp': regexp, 'callback': callback});
}
//#######TASTIERA###
//you register commands that are only triggered when a specific regex matches the command.
CommandBus.prototype.trays_request = function (regexp, callback) {
 this.commands.push({'regexp': regexp, 'callback': callback});
}

//this is the condition that you should put in place. Since commands usually start with ‘/’.
CommandBus.prototype.condition = function (bot) {
 if (bot.update.message.text.charAt(0) === '/') return true;
 if (bot.update.message.text.charAt(0) === '#') return true;
 return false;
}
//######TASTIERA#####
//this handles commands that are validated
CommandBus.prototype.handle = function (bot) {  
  for (var i in this.commands) {
    var cmd = this.commands[i];
    var tokens = cmd.regexp.exec(bot.update.message.text);
    if (tokens != null) {
      return cmd.callback.apply(bot, tokens.splice(1));
    }
  }
  return bot.replyToSender("Comando non trovato");
}

