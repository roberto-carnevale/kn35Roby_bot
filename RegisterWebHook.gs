function setWebhook() {
  var bot = new Bot(token, {});
  Logger.log(ScriptApp.getService().getUrl())
  var result = bot.request('setWebhook', {
    url: currentWebApp
  });
  
  Logger.log(result);
}


function deleteWebhook() {
  var bot = new Bot(token, {});
  var result = bot.request('deleteWebhook', {});
  
  Logger.log(result);
}


function getWebhookInfo() {
  var bot = new Bot(token, {});
  var result = bot.request('getWebhookInfo', {});
  
  Logger.log(result);
}
