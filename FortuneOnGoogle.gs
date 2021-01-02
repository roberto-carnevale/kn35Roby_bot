function FortuneOnGoogle() {
  //set up tab
  this.tabSetup = SpreadsheetApp.openById(FortuneDBSpreadsheet).getSheetByName(FortuneDBSetUpTab);
  //set up tab as set up by "A1"
  this.setup = this.tabSetup.getRange(this.tabSetup.getRange("A1").getValue()).getValues();
  //default one
  this.tab = SpreadsheetApp.openById(FortuneDBSpreadsheet).getSheetByName(FourtuneComputerSheetIT);
}

//Draws a tray
FortuneOnGoogle.prototype.selectDraw = function() {
  // gets the last fortune draw
  var max = parseInt(this.tabSetup.getRange("A1").getValue().substring(4,5))-1;
  // randomize
  const seedT = parseInt(Math.random()*max);
  // returns tab name
  return this.setup[seedT];
}


FortuneOnGoogle.prototype.selectRangeFromTab = function(tabData) {
  this.tab = SpreadsheetApp.openById(FortuneDBSpreadsheet).getSheetByName(tabData[0]);

  //select a random sentence
  const seed = parseInt(Math.random()*tabData[1]);
  
  //creates the ranges to find a sentence
  const dataRangeStr = "A" + seed.toString() + ":C" + (seed+30).toString();
  var findRangeStr = "A" + seed.toString() + ":A" + (seed+50).toString();
  var tempLineIni = 0;
  var line = "";
  
  //gets the first "%"
  for (line of this.tab.getRange(findRangeStr).getValues()) {
    if (line[0] == "%") {break;}
    else {tempLineIni++;}
  }
  //prepares to find the following "%"
  var tempLineEnd = 1;
  findRangeStr = "A" + (seed+tempLineIni+1).toString() + ":A" + (seed+50).toString();
  //gets the following "%"
  for (line of this.tab.getRange(findRangeStr).getValues()) {
    if (line[0] == "%") {break;}
    else {tempLineEnd++;}
  }
  // retunrs the relevant range
  return "A" + (seed+tempLineIni+1).toString() + ":C" + (seed+tempLineIni+tempLineEnd-1).toString();
}

//Draws a random sentence for a specific user
FortuneOnGoogle.prototype.selectRange = function(id) {
  //catch the user pref
  var userSpread = new SpreadData();
  var userPrefs = userSpread.findSubscriber(id);
  var i = 0;
  for (; i < this.setup.length; i++) {
    if (userPrefs['fortune'] == this.setup[i][0]) {break;}
  }
  this.tab = SpreadsheetApp.openById(FortuneDBSpreadsheet).getSheetByName(userPrefs['fortune']);
  //select a random sentence
  const seed = parseInt(Math.random()*this.setup[i][1]);
  
  //creates the ranges to find a sentence
  const dataRangeStr = "A" + seed.toString() + ":C" + (seed+30).toString();
  var findRangeStr = "A" + seed.toString() + ":A" + (seed+50).toString();
  var tempLineIni = 0;
  var line = "";
  
  //gets the first "%"
  for (line of this.tab.getRange(findRangeStr).getValues()) {
    if (line[0] == "%") {break;}
    else {tempLineIni++;}
  }
  //prepares to find the following "%"
  var tempLineEnd = 1;
  findRangeStr = "A" + (seed+tempLineIni+1).toString() + ":A" + (seed+50).toString();
  //gets the following "%"
  for (line of this.tab.getRange(findRangeStr).getValues()) {
    if (line[0] == "%") {break;}
    else {tempLineEnd++;}
  }
  // retunrs the relevant range
  return "A" + (seed+tempLineIni+1).toString() + ":C" + (seed+tempLineIni+tempLineEnd-1).toString();
}

//Gets text from the DB
FortuneOnGoogle.prototype.dataRetrieval = function(rangeString) {
  var stringFound = "";
  var line= [];
  var line2 = "";
  for (line of this.tab.getRange(rangeString).getValues()) {
    for (line2 of line) {
      //test }
      if (line2 == "") {
        stringFound = stringFound + "     ";
      }
      else { 
        stringFound = stringFound + line2;
      }
    }
    stringFound += '\n';
  }
  return stringFound;
}

//Gets next draw data from the DB
FortuneOnGoogle.prototype.getNext = function(dbName) {
  var i = 0;
  for (; i < this.setup.length; i++) {
    if (dbName == this.setup[i][0]) {break;}
  }
  i++;
  if (i == this.setup.length) { i = 0}
  return this.setup[i][0];
}

//Gets all the draws and the descriptions
FortuneOnGoogle.prototype.listTrays = function() {
  var result = [];
  for (i=0; i < this.setup.length; i++) {
    result.push(this.setup[i][0]);
  }
  return result;
}

//Testing function. Use locally
function main(){
  var f = new FortuneOnGoogle();
  var r = f.selectRange(readDebugChat());
  var pippo=f.dataRetrieval(r);
  Logger.log(pippo);
}
    
