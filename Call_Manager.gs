function doPost(e) {
  try {
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
        bot.pushMessage("Nuovo START: " + (bot.update.message.from.id).toString() + ">" + bot.update.message.from.first_name + " " +  bot.update.message.from.last_name, readDebugChat());
      } else {
        bot.pushMessage("Ciao a tutti e grazie di avermi aggiunto alla chat " + bot.update.message.chat.title, bot.update.message.chat.id);
        spread.writeSubscriber(bot.update.message.chat.id, bot.update.message.chat.title, "*GROUP*");
      }
    });
    
    //Manages "/start" command
    bus.on(/\/stop/, function () {
      this.replyToSender("Mi spiace che tu te ne vada, addio " + bot.update.message.from.first_name);
      spread.deleteSubscriber(bot.update.message.from.id, bot.update.message.from.first_name, bot.update.message.from.last_name);
      bot.pushMessage("STOP: " + (bot.update.message.from.id).toString() + ">" + bot.update.message.from.first_name + " " +  bot.update.message.from.last_name, readDebugChat());
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
    
    
    //Manages "/next" command
    bus.on(/\/next/, function () {
      if (spread.getSubscriber(bot.update.message.chat.id) == -1) {this.replyToSender("Ciao "+ bot.update.message.from.first_name + " devi prima dare il comando /start ");}
      else {
        var newDBName = spread.newDB(bot.update.message.chat.id)
        this.replyToSender("Nuovo vassoio dei dolcetti: " + newDBName);
      }
    });    
    
    //Manages "/suspend" draw cookies command
    bus.on(/\/suspend/, function () {
      var line_id = spread.getSubscriber(bot.update.message.chat.id);
      bot.pushMessage(bot.update.message.chat.id + " ha sospeso", readDebugChat());
      if (line_id > -1) { 
        spread.setDrawStatus(line_id, "N");
        bot.pushMessage("Ora sei a dieta!", parseInt(bot.update.message.chat.id));
      }
      
    });
    
    //Manages "/resume" draw cookies command
    bus.on(/\/resume/, function () {
      var line_id = spread.getSubscriber(bot.update.message.chat.id);
      bot.pushMessage(bot.update.message.chat.id + " ha ripreso", readDebugChat());
      if (line_id > -1) { 
        spread.setDrawStatus(line_id, "Y"); 
        bot.pushMessage("Buon divertimento! A presto!", parseInt(bot.update.message.chat.id));
      }
    });   
    
	//Manages "/list" draw cookies command
    bus.on(/\/list/, function () {
      //bot.update.message.chat.id
      fdb = new FortuneOnGoogle();
      let text = "Ecco i vassoi dei dolcetti della fortune\n";
      let final_array  = fdb.listTrays();
      for (let i=0; i < final_array.length; i++) {
        text += "*  " + final_array[i] + "\n";
      }
      text += "Usare il comando /change per sceglierne uno diverso"
      bot.pushMessage(text, bot.update.message.chat.id);
    });
    	//Manages "/help" draw cookies command
    bus.on(/\/help/, function () {
      bot.pushMessage("Ti serve aiuto? kn35roby@gmail.com ", bot.update.message.chat.id);
    }); 

  //########TASTIERA###### 
    //Manages "/change" command
    bus.on(/\/change/, function () {
      fdb = new FortuneOnGoogle();
      let listOfButtons = [];
      let listOfTrays = fdb.listTrays();
      let i=j=0;
      var row = [];
      while (i<=listOfTrays.length) {
        if (j==0) {
          var row = [];
          row.push("#"+listOfTrays[i]);
          j++;
          i++;
          continue;
        }
        if (j==1) {
          row.push("#"+listOfTrays[i]);
          listOfButtons.push(row);
          j=0;
          i++;
        }
      }
      bot.createKeyboard(listOfButtons);
    });
    
    //Manages "/abort_change" command
    bus.on(/\/abort_change/, function () {
      bot.destroyKeyboard();
    });

    //Manages tray direct change
    bus.trays_request(/#/, function () {
      let subscribers = new SpreadData();
      let selected_tray = bot.update.message.text.substring(1);
      if (subscribers.newTray(bot.update.message.chat.id, selected_tray)) {
        bot.replyToSender("Prendi un dolcetto dal vassoio " + selected_tray);
      } else {
        bot.replyToSender("Il vassoio che cerchi non c'è!");
      }
      bot.destroyKeyboard();

    });
    //######TASTIERA####

    // registers the bus 
    bot.register(bus);
   
    // If the update is valid, process it
    if (update) {
      bot.process();
    }
    //Counts the executions and tracks the dumps
        let err_tab = SpreadsheetApp.openById(SubscriberSpreadsheet).getSheetByName('LAST_ERROR');
        err_tab.getRange('A1').setValue("SUCCESS");
        let executions = err_tab.getRange('A2').getValue();
        executions = parseInt(executions) + 1;
        err_tab.getRange('A2').setValue(executions);
  } 
  } catch (err) {
    //Counts the errors and tracks the dumps
    let err_tab = SpreadsheetApp.openById(SubscriberSpreadsheet).getSheetByName('LAST_ERROR');
    err_tab.getRange('A1').setValue(err.toString());
    err_tab.getRange('D1').setValue(err.stack.toString());
    let executions = err_tab.getRange('A3').getValue();
    executions = parseInt(executions) + 1;
    err_tab.getRange('A3').setValue(executions);
  }
}

function doRunFortuneForSubscribers() {
  var d = new Date();
  var h = d.getUTCHours();
  const seedH = parseInt(Math.random()*100);
  let timeInterval = readTimeInterval()
  if (h > timeInterval[0] && h<timeInterval[1] && seedH >= readProbability()) {
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
          bot.pushMessage("Eccezione sul messaggio: " + id.toString(), readDebugChat());
          bot.pushMessage(err.toString(), readDebugChat());
        }
      }
    }
    //Counts the messages sent
    let err_tab = SpreadsheetApp.openById(SubscriberSpreadsheet).getSheetByName('LAST_ERROR');
  let executions = err_tab.getRange('A4').getValue();
  executions = parseInt(executions) + 1;
  err_tab.getRange('A4').setValue(executions);
  }
 // var bot = new Bot(token, {});
  //bot.pushMessage("seed:"+seedH+"- h:"+h, readDebugChat());
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
    bot.pushMessage("Messaggi: " + countMessages.toString(), readDebugChat());
    //prepare the page
    template.num = countMessages;
    template.text = e.parameter["text"];
    
    for (id of spread.listAllSubscribers()) {
      if (!isNaN(parseInt(id))) {
        //pushes the message
        try {
          bot.pushMessage(template.text, parseInt(id));
        } catch (err) {
          bot.pushMessage("Eccezione sul messaggio: " + id.toString(), readDebugChat());
          bot.pushMessage(err.toString(), readDebugChat());
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
      fdb = new FortuneOnGoogle();
      let listOfButtons = [];
      let listOfTrays = fdb.listTrays();
      let i=j=0;
      var row = [];
      while (i<=listOfTrays.length) {
        if (j==0) {
          var row = [];
          row.push("#"+listOfTrays[i]);
          j++;
          i++;
          Logger.log(row);
          continue;
        }
        if (j==1) {
          row.push("#"+listOfTrays[i]);
          listOfButtons.push(row);
          Logger.log(row);
          Logger.log(listOfButtons);
          j=0;
          i++;
        }
      }
      Logger.log(listOfButtons.toString());
}
