function doPost(e) {
 // Make sure to only reply to json requests
  if(e.postData.type == "application/json") {
 
    // Parse the update sent from Telegram
    var update = JSON.parse(e.postData.contents);// Instantiate the bot passing the update 
    
    //creates the bot
    var bot = new Bot(token, update);
    
    //Creates the command bus
    var bus = new CommandBus();
    
    var spread = new SpreadData();
  
    //Mnages "/start" command
    bus.on(/\/start/, function () {
      if (bot.update.message.from.id == bot.update.message.chat.id) {
        this.replyToSender("Ciao " + bot.update.message.from.first_name);
        spread.writeSubscriber(bot.update.message.from.id, bot.update.message.from.first_name, bot.update.message.from.last_name);
        bot.pushMessage("Nuovo START: " + (bot.update.message.from.id).toString() + ">" + bot.update.message.from.first_name + " " +  bot.update.message.from.last_name, 689085244);
      } else {
        bot.pushMessage("Ciao a tutti e grazie di avermi aggiunto alla chat " + bot.update.message.chat.title, bot.update.message.chat.id);
        spread.writeSubscriber(bot.update.message.chat.id, bot.update.message.chat.title, "*GROUP*");
      }
    });
    
    //Mnages "/start" command
    bus.on(/\/stop/, function () {
      this.replyToSender("Mi spiace che tu te ne vada, addio " + bot.update.message.from.first_name);
      spread.deleteSubscriber(bot.update.message.from.id, bot.update.message.from.first_name, bot.update.message.from.last_name);
      bot.pushMessage("STOP: " + (bot.update.message.from.id).toString() + ">" + bot.update.message.from.first_name + " " +  bot.update.message.from.last_name, 689085244);
    });
    
    //Mnages "/fortune" command
    bus.on(/\/fortune/, function () {
      if (spread.getSubscriber(bot.update.message.chat.id) == -1) {this.replyToSender("Ciao "+ bot.update.message.from.first_name + " devi prima dare il comando /start ");}
      else {
        var fortuneObj = new FortuneOnGoogle();
        var rangeSelected = fortuneObj.selectRange(bot.update.message.chat.id)
        var fortuneSentence= fortuneObj.dataRetrieval(rangeSelected);
        this.replyToSender(fortuneSentence);
      }
    });
    
    
    //Mnages "/change" command
    bus.on(/\/change/, function () {
      if (spread.getSubscriber(bot.update.message.chat.id) == -1) {this.replyToSender("Ciao "+ bot.update.message.from.first_name + " devi prima dare il comando /start ");}
      else {
        var newDBName = spread.newDB(bot.update.message.chat.id)
        this.replyToSender("Nuovo vassoio dei dolcetti: " + newDBName);
      }
    });    
    
    //Mnages "/suspend" draw cookies command
    bus.on(/\/suspend/, function () {
      var line_id = spread.getSubscriber(bot.update.message.chat.id);
      bot.pushMessage(bot.update.message.chat.id + " ha sospeso", 689085244);
      if (line_id > -1) { 
        spread.setDrawStatus(line_id, "N");
        bot.pushMessage("Ora sei a dieta!", parseInt(bot.update.message.chat.id));
      }
      
    });
    
    //Mnages "/resume" draw cookies command
    bus.on(/\/resume/, function () {
      var line_id = spread.getSubscriber(bot.update.message.chat.id);
      bot.pushMessage(bot.update.message.chat.id + " ha ripreso", 689085244);
      if (line_id > -1) { 
        spread.setDrawStatus(line_id, "Y"); 
        bot.pushMessage("Buon divertimento! A presto!", parseInt(bot.update.message.chat.id));
      }
    });   
    
    
    //Mnages "/testY" command
    bus.on(/\/testY/, function () {
      bot.createKeyboard(["Test1", "Test2"]);
    });
    
    //Mnages "/test" command
    bus.on(/\/testN/, function () {
      bot.destroyKeyboard();
    });

    // registers the bus 
    bot.register(bus);
   
    // If the update is valid, process it
    if (update) {
      bot.process();
    }
  } 
}

function doRunFortuneForSubscribers() {
  var d = new Date();
  var h = d.getUTCHours();
  const seedH = parseInt(Math.random()*10);
  if (h > 6 && h<18 && seedH >= 8) {
    var fortuneObj = new FortuneOnGoogle();
    var range = fortuneObj.selectRangeFromTab(fortuneObj.selectDraw());
    var text = fortuneObj.dataRetrieval(range);
    var spread = new SpreadData();
    
    //creates the bot and the fortuneObj
    var bot = new Bot(token, {});
    var fortuneObj = new FortuneOnGoogle();
    
    //sends to subscribers who accepts draws
    for (var id of spread.listSubscribers()) {
      if (!isNaN(parseInt(id))) {
        //gets the range    
        var rangeSelected = fortuneObj.selectRange(id)
        var fortuneSentence= fortuneObj.dataRetrieval(rangeSelected);
        //pushes the message
        try {
          bot.pushMessage(fortuneSentence, parseInt(id));
        } catch (err) {
          bot.pushMessage("Eccezione sul messaggio: " + id.toString(), 689085244);
          bot.pushMessage(err.toString(), 689085244);
        }
      }
    }
  }
 // var bot = new Bot(token, {});
  //bot.pushMessage("seed:"+seedH+"- h:"+h, 689085244);
}

function doGet(e) {
  var template = HtmlService
  .createTemplateFromFile('200');
  try {
    //creates the bot
    var bot = new Bot(token, {});
    // queries the subscribers
    var spread = new SpreadData();
    
    var countMessages = 0;
    for (id of spread.listAllSubscribers()) {
      if (!isNaN(parseInt(id))) {
        countMessages++;
      }
    }
    //sends message to Roberto
    bot.pushMessage("Messaggi: " + countMessages.toString(), 689085244);
    //prepare the page
    template.num = countMessages;
    template.text = e.parameter["text"];
    
    for (id of spread.listAllSubscribers()) {
      if (!isNaN(parseInt(id))) {
        //pushes the message
        try {
          bot.pushMessage(template.text, parseInt(id));
        } catch (err) {
          bot.pushMessage("Eccezione sul messaggio: " + id.toString(), 689085244);
          bot.pushMessage(err.toString(), 689085244);
        }
      }
    }
  }
  catch (err) {
    var templateErr = HtmlService
    .createTemplateFromFile('500');
    templateErr.err = err;
    console.log(err, err.message);
    return templateErr.evaluate();
  }
  
  return template.evaluate();
}


//Testing function. Use locally
function test()
{
    //creates the bot
  var bot = new Bot(token, {});
    
    //Creates the command bus
    var bus = new CommandBus();
    
    var spread = new SpreadData();
    //Mnages "/change" command

//  var fortuneObj = new FortuneOnGoogle();
//  var rangeSelected = fortuneObj.selectRange(689085244)
//  var fortuneSentence= fortuneObj.dataRetrieval(rangeSelected);
  bot.pushMessage("Messaggio", 689085244);

    // registers the bus 
    bot.register(bus);
   
    // If the update is valid, process it
    if (update) {
      bot.process();
    }
}
