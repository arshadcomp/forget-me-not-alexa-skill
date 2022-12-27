
  // 1. Text strings =====================================================================================================
  //    Modify these strings and messages to change the behavior of your Lambda function

  const Alexa = require('alexa-sdk');
  const placeData = require('./placeData');
  const helperFunctions = require('./helperFunctions');

  // const AWS = require('aws-sdk');  // this is defined to enable a DynamoDB connection from local testing
  // const AWSregion = 'local';   // eu-west-1
  // var persistenceEnabled;
  // AWS.config.update({
  //     region: AWSregion,
  //     endpoint: 'http://localhost:8000'
  // });

  const languageStrings = {
    'en': {
      'translation': {
        'WELCOME' : `Don't forget your ${sayArray(placeData.commonItems, 'and')}.`,// "Don't forget your keys.",
        'TITLE'   : "Forget Me Not",
        'REPROMPT'  : "May I ask where are you going?",
        'HELP'    : "Rhea will help you with last minutes check before you leave home, be it for office or for a long holiday.  You can ask the items you will need before going to places and even add specific items you require. With Reminder Rhea you are never forgetting a thing.",
        'STOP'    : "Okay, see you next time! ",
        'NEW_PLACE': "I shall add the place to your list",
        'PROMPT_ITEM' : "May I know what do you usually carry to %s.",
        'PROMPT_ACTION': "Any important actions like \'Feeding the cat\' etcetra, you do before leaving for %s."

      }
    }
    // , 'de-DE': { 'translation' : { 'WELCOME'   : "Guten Tag etc." } }
  };

  const EXIT_MESSAGE = [
  "Bye!", "Good Bye!", "Bye Bye!", "See you later.", "Have a nice day.",
  "Have a good day.", "Have a nice trip.", "Looking forward to our next meet.",
  "Take care.", "Catch you later!",
  "Aloha!", "Adiós!", "Adieu1", "Ciao!", "Au revoir!", "Bon voyage!", "Sayonara!",
  "Shalom!" ];

  const EXCUSE_MESSAGE = [
    "Sorry for bothering you, but just one last question.",
    "I am sorry if I being too much trouble",
    "I am sorry if I am boring you.",
    "Just one lat question",
    "Excuse me for the trouble just one last question.",
    "Just for the sake of completeness.",
    "Just to be thorough.",
    "If it is not too much.",
    "Since this is the first time, I just need to be thorough.",
    "Just for the record, ",
    "To be precise, "
  ];

  const PREPEND_MESSAGE = [
    `You must take with you, {itemsArray}.`,
    `Please don\'t forget, {itemsArray}.`,
    `Please take, {itemsArray} with you.`,
    `Things you must take with you inludes, {itemsArray}.`,
    `Don\'t forget, {itemsArray}.`,
    `I think you should take, {itemsArray} with you.`,
    `{itemsArray} are the things you will need.`,
    `You must take, {itemsArray} with you.`,
    `Following items may be required, {itemsArray}.`,
    `It\'s best if you have, {itemsArray} with you.`,
    `Take along, {itemsArray}.`
  ];

  const NEW_PLACE_PREPEND_MESSAGE = [
    `Normally people take, {itemsArray}.`,
    `People usually take, {itemsArray}.`,
    `Take along, {itemsArray} with you.`,
    `Don't forget, {itemsArray}.`,
    `I think you should take, {itemsArray} with you.`,
    `{itemsArray} are the things you may need.`,
    `You may take, {itemsArray} with you.`,
    `Following items may be required, {itemsArray}.`,
    `It\'s best if you have, {itemsArray} with you.`
  ];

  const ADD_ITEM_LATER = [
    'You can add or delete the items later by saying edit items',
    'You can add or remove the items later by saying edit items.',
    'You can add or delete the items later, when you are not in a hurry by saying edit items.',
    'You can add or remove the items later, when you are not in a hurry by saying edit items.',
    'You can add or delete the items later, when you are free by saying edit items.',
    'You can add or remove the items later, when you are free by saying edit items.',
    'Feel free to add or delete items later by saying edit items.',
    'Feel free to add or remove items later by saying edit items.',
    'Feel free to add or delete items when you are not in a hurry by saying edit items.',
    'Feel free to add or remove items when you are not in a hurry by saying edit items.',
  ];

  const welcomeCardImg = {
      smallImageUrl: 'https://s3.amazonaws.com/webappvui/img/breakfast_sandwich_small.png',
      largeImageUrl: 'https://s3.amazonaws.com/webappvui/img/breakfast_sandwich_large.png'
  };
  // 2. Skill Code =======================================================================================================





  const states = {
      USER: "_USER",
      GUESS_PLACE: "_GUESS_PLACE",
      NEW_PLACE: "_NEW_PLACE",
      PLACE: "_PLACE",
      ITEM: "_ITEM",
      TODO: "_TODO",
      TIME: "_TIME",
      HELP: "_HELP",
      FINAL: "_FINAL"
  };

  const newSessionHandlers = {
    'LaunchRequest': function () {
      var timeNow = new Date();
      var places = this.attributes['places'];

      if(places) {
        //console.log('User exists');
        //var places = this.attributes['places'];
        if(places.length==0){
          // user exist but no place saved
          this.attributes['timestamp'] = timeNow.toString();
          this.handler.state = states.PLACE;
          this.emitWithState("Start");
        } else if(places.length==1) {
          // user with single place so go in guess mode if this is the only place
          var place = places[0];
          this.attributes['timestamp'] = timeNow.toString();
          this.handler.state = states.GUESS_PLACE;
          this.emitWithState("GuessPlace", place);
        } else {
          // user with many places saved randomly select the place or select based on time. Guess the place
          this.attributes['timestamp'] = timeNow.toString();
          this.handler.state = states.PLACE;
          this.emitWithState("Start");
        }
      } else {
        this.handler.state = states.USER;
        this.emitWithState("NewUser");
      }

    },
    'PlaceIntent' : function() {
      let slots = this.event.request.intent.slots;
      if(validateSlot(slots)){
        let placeName = getPlaceName(slots);
        this.attributes['placeName'] = placeName;
        this.handler.state = states.USER;
        this.emitWithState('CheckUserPlace');
      } else {
        this.handler.state = states.PLACE;
        this.emitWithState('Start');
      }
    },
    'SportIntent' : function() {
      let slots = this.event.request.intent.slots;
      let placeName = getSportName(slots);

      this.attributes['placeName'] = placeName;
      this.handler.state = states.USER;
      this.emitWithState('CheckUserPlace');
    },
    'MusicIntent' : function() {
      let slots = this.event.request.intent.slots;
      let placeName = getMusicName(slots);

      this.attributes['placeName'] = placeName;
      this.handler.state = states.USER;
      this.emitWithState('CheckUserPlace');
    },
    'AppointmentIntent' : function() {
      let slots = this.event.request.intent.slots;
      let placeName = getAppointmentName(slots);

      this.attributes['placeName'] = placeName;
      this.handler.state = states.USER;
      this.emitWithState('CheckUserPlace');
    },
    'EditItemIntent': function(){
      this.attributes['editItem'] = true;
      this.response.speak('Please say the name of place.').listen('May I know where are you going?');
      this.handler.state = states.PLACE;
      this.emitWithState('AskPlace');
    },
    'AMAZON.NextIntent' : function() {
      this.response.speak('Next Intent');
      this.emit(':responseReady');
    }
  };

  const userHandlers = Alexa.CreateStateHandler(states.USER,{
    /// This is never used
    'Start': function() {
      randomiseArray(placeData.commonItems);

      let speechOutput = this.t('WELCOME') +' '+this.t('REPROMPT');
      let repromptText = this.t('REPROMPT');

      // if (helperFunctions.supportsDisplay.call(this)||helperFunctions.isSimulator.call(this)) {
      //   let content = helperFunctions.getSimpleAskContent.call(this, speechOutput, repromptText);
      //   helperFunctions.renderTemplate.call(this, content);
      // } else {
      //   helperFunctions.noDisplayAsk.call(this, speechOutput, repromptText);
      // }

      this.response.speak(speechOutput).listen(this.t('REPROMPT'));
      this.emit(":responseReady");


    },
    'CheckUserPlace': function() {
      var placeName = this.attributes['placeName'];
      var places = this.attributes['places'];
      let userPlace;
      if(places) {
        if(placeName!==undefined){
          userPlace = getUserPlace(placeName, places);
          if(userPlace){
            this.handler.state = states.FINAL;
            this.emitWithState("KnownPlace", userPlace);
          } else {
            this.handler.state = states.NEW_PLACE;
            this.emitWithState("KnownPlace", placeName);
          }
        } else{
          this.handler.state = states.PLACE;
          this.emitWithState("Start");
        }
      } else {
        this.emitWithState("NewUser");
      }
    },
    'NewUser' : function(){
      let timeNow = new Date();
      let placeName = this.attributes['placeName'];
      this.attributes['timestamp'] = timeNow.toString();
      this.attributes['places'] = [];
      if(placeName!==undefined){
        this.handler.state = states.NEW_PLACE;
        this.emitWithState("KnownPlace", placeName);
      }
      else{
        this.handler.state = states.PLACE;
        this.emitWithState("Start");
      }
    },
    'EditItemIntent': function(){
      this.attributes['editItem'] = true;
      this.response.speak('Please say the name of place.').listen('May I know where are you going?');
      this.handler.state = states.PLACE;
      this.emitWithState('AskPlace');
    },
    'AMAZON.StopIntent': function () {
      this.handler.state = states.FINAL;
      this.emitWithState('SessionEndedRequest', randomArrayElement(EXIT_MESSAGE));
    },
    'AMAZON.CancelIntent': function () {
      this.handler.state = states.FINAL;
      this.emitWithState('SessionEndedRequest', randomArrayElement(EXIT_MESSAGE));
    },
    'AMAZON.HelpIntent' : function(){
      this.handler.state = states.HELP;
      this.emitWithState('Start');
    },
    'Unhandled' : function(){
      this.emitWithState('Start');
    },
    'SessionEndedRequest' :function(){
      this.handler.state = states.FINAL;
      this.emitWithState('SessionEndedRequest', randomArrayElement(EXIT_MESSAGE));
    }
  });

  const placeHandlers = Alexa.CreateStateHandler(states.PLACE,{
    'Start': function() {
      randomiseArray(placeData.commonItems);
      let speechOutput = this.t('WELCOME') +' '+this.t('REPROMPT');
      let repromptText = this.t('REPROMPT');

      console.log('State:'+ this.attributes['STATE']);

      // if (helperFunctions.supportsDisplay.call(this)||helperFunctions.isSimulator.call(this)) {
      //   let content = helperFunctions.getSimpleAskContent.call(this, speechOutput, repromptText);
      //   helperFunctions.renderTemplate.call(this, content);
      // } else {
      //   helperFunctions.noDisplayAsk.call(this, speechOutput, repromptText);
      // }
      this.response.cardRenderer(this.t('TITLE'), speechOutput);
      this.response.speak(speechOutput).listen(this.t('REPROMPT'));
      this.emit(":responseReady");
    },
    'AskPlace': function() {
      //let speechOutput = this.t('REPROMPT');
      //let repromptText = this.t('REPROMPT');
      // if (helperFunctions.supportsDisplay.call(this)||helperFunctions.isSimulator.call(this)) {
      //   let content = helperFunctions.getSimpleAskContent.call(this, speechOutput, repromptText);
      //   helperFunctions.renderTemplate.call(this, content);
      // } else {
      //   helperFunctions.noDisplayAsk.call(this, speechOutput, repromptText);
      // }
      //this.response.cardRenderer(this.t('TITLE'), speechOutput);
      this.response.speak(this.t('REPROMPT')).listen(this.t('REPROMPT'));
      this.emit(":responseReady");
    },
    'PlaceIntent' : function() {
      let slots = this.event.request.intent.slots;
      if(validateSlot(slots)){
        let placeName = getPlaceName(slots);
        this.attributes['placeName'] = placeName;

        if(this.attributes['editItem']){
          this.handler.state = states.ITEM;
          this.emitWithState('CheckUserPlace');
        } else {
          this.handler.state = states.USER;
          this.emitWithState('CheckUserPlace');
        }
      } else {
        this.response.speak('Sorry, I didn\'t get that. May I know where are you going?').listen(this.t('REPROMPT'));
        this.emit(":responseReady");
        }
    },
    'SportIntent' : function() {
      let slots = this.event.request.intent.slots;
      let placeName = getSportName(slots);
      this.attributes['placeName'] = placeName;
      if(this.attributes['editItem']!==undefined){
        this.handler.state = states.ITEM;
        this.emitWithState('CheckUserPlace');
      } else {
        this.handler.state = states.USER;
        this.emitWithState('CheckUserPlace');
      }
    },
    'MusicIntent' : function() {
      let slots = this.event.request.intent.slots;
      let placeName = getMusicName(slots);
      this.attributes['placeName'] = placeName;
      if(this.attributes['editItem']!==undefined){
        this.handler.state = states.ITEM;
        this.emitWithState('CheckUserPlace');
      } else {
        this.handler.state = states.USER;
        this.emitWithState('CheckUserPlace');
      }
    },
    'AppointmentIntent' : function() {
      let slots = this.event.request.intent.slots;
      let placeName = getAppointmentName(slots);

      this.attributes['placeName'] = placeName;
      if(this.attributes['editItem']){
        this.handler.state = states.ITEM;
        this.emitWithState('CheckUserPlace');
      } else {
        this.handler.state = states.USER;
        this.emitWithState('CheckUserPlace');
      }
    },
    'EditItemIntent': function(){
      this.attributes['editItem'] = true;
      //this.emitWithState('AskPlace');
      this.response.speak('Please say the name of place.').listen('May I know where are you going?');
      this.emit(':responseReady');
      // this.handler.state = states.PLACE;
      // this.emitWithState('AskPlace');
    },
    'AMAZON.StopIntent' : function(){
      this.handler.state = states.FINAL;
      this.emitWithState('SessionEndedRequest', randomArrayElement(EXIT_MESSAGE));
    },
    'AMAZON.CancelIntent' : function() {
      this.handler.state = states.FINAL;
      this.emitWithState('SessionEndedRequest', randomArrayElement(EXIT_MESSAGE));
    },
    'AMAZON.HelpIntent' : function(){
      this.handler.state = states.HELP;
      this.emitWithState('Start');
    },
    'Unhandled' : function(){
      this.emitWithState('Start');
    },
    'SessionEndedRequest' :function(){
      this.handler.state = states.FINAL;
      this.emitWithState('SessionEndedRequest', randomArrayElement(EXIT_MESSAGE));
    }
  });

  const guessPlaceHandlers = Alexa.CreateStateHandler(states.GUESS_PLACE,{
    'GuessPlace' : function(place){
      let speechOutput = "Don't forget your "+sayArray(placeData.commonItems, 'and') +'. ';
      let repromptText;
      if(place.placeName.specificName == ' ')
        repromptText = "Aren't you going to " + toTitleCase(place.placeName.genericName)+"?";
      else
        repromptText = "Aren't you going to " + toTitleCase(place.placeName.specificName)+"?";

      this.attributes['currentPlace'] = place;
      this.attributes['placeName'] = place.placeName;

      // if (helperFunctions.supportsDisplay.call(this)||helperFunctions.isSimulator.call(this)) {
      //   let content = helperFunctions.getSimpleAskContent.call(this, speechOutput, repromptText);
      //   helperFunctions.renderTemplate.call(this, content);
      // } else {
      //   helperFunctions.noDisplayAsk.call(this, speechOutput, repromptText);
      // }
      this.response.cardRenderer(this.t('TITLE'), speechOutput + repromptText);
      this.response.speak(speechOutput + repromptText).listen(repromptText);
      this.emit(":responseReady");
    },
    'AMAZON.YesIntent': function () {
      this.handler.state = states.FINAL;
      this.emitWithState('KnownPlace', this.attributes['currentPlace']);
    },
    'AMAZON.NoIntent': function () {
      this.handler.state = states.PLACE;
      this.emitWithState('AskPlace');
    },
    'EditItemIntent': function(){
      this.attributes['editItem'] = true;
      //this.response.speak('Please say the name of place.').listen('');
      //this.handler.state = states.PLACE;
      //this.emitWithState('AskPlace');

      this.handler.state = states.ITEM;
      this.emitWithState('CheckUserPlace');
    },
    'AMAZON.StopIntent' : function(){
      this.handler.state = states.FINAL;
      this.emitWithState('SessionEndedRequest', randomArrayElement(EXIT_MESSAGE));
    },
    'AMAZON.CancelIntent' : function(){
      this.handler.state = states.FINAL;
      this.emitWithState('SessionEndedRequest', randomArrayElement(EXIT_MESSAGE));
    },
    'AMAZON.HelpIntent' : function(){
      this.handler.state = states.HELP;
      this.emitWithState('Start');
    },
    'Unhandled': function () {
      this.emitWithState('AMAZON.NoIntent');
      //this.handler.state = states.FINAL;
      //this.emitWithState('SessionEndedRequest', randomArrayElement(EXIT_MESSAGE));
    },
    'SessionEndedRequest' :function(){
      this.handler.state = states.FINAL;
      this.emitWithState('SessionEndedRequest', randomArrayElement(EXIT_MESSAGE));
    }
  });

  const newPlaceHandlers = Alexa.CreateStateHandler(states.NEW_PLACE,{
    'UnlistedPlace' : function() {
      /// To be checked thoroughly
      var timeNow = new Date();
      let speechOutput = "This is not in your list. I shall add it your list." + ' ' + randomArrayElement(ADD_ITEM_LATER);
      let place = {
        placeName : this.attributes['placeName'],
        usualHour : timeNow.getHours(),
        itemList : [],
        actionList  : []
      };
      this.attributes['currentPlace'] = place;
      this.attributes['places'].push(place);

      this.handler.state = states.FINAL;
      this.emitWithState('SessionEndedRequest', speechOutput);
    },
    'KnownPlace' : function(placeName) {
      let place;
      var timeNow = new Date();
      place = getDefaultPlace(placeName);

      let placeNameArray = placeName.specificName.split(" ");
      let tempPlaceName = placeName;
      if(!place && placeNameArray.length>0) {
        for(let i=0;i<placeNameArray.length;i++) {
          tempPlaceName.specificName = placeNameArray[i];
          place = getSPecificDefaultPlace(placeName);
          if(place)
            break;
        }
      }

      if(place) {
        place.placeName = this.attributes['placeName'];
        place.usualHour = timeNow.getHours();
        this.attributes['currentPlace'] = place;
        this.attributes['places'].push(place);

        this.handler.state = states.FINAL;
        this.emitWithState('ListedPlace', place);
      }
      else
        this.emitWithState('UnlistedPlace');
    },
    'AMAZON.HelpIntent' : function(){
      this.handler.state = states.HELP;
      this.emitWithState('Start');
    },
    'AMAZON.StopIntent': function () {
      this.handler.state = states.FINAL;
      this.emitWithState('SessionEndedRequest', randomArrayElement(EXIT_MESSAGE));
    },
    'AMAZON.CancelIntent': function () {
      this.handler.state = states.FINAL;
      this.emitWithState('SessionEndedRequest', randomArrayElement(EXIT_MESSAGE));
    },
    'Unhandled': function () {
      this.handler.state = states.PLACE;
      this.emitWithState('AskPlace');
    },
    'SessionEndedRequest' :function(){
      this.handler.state = states.FINAL;
      this.emitWithState('SessionEndedRequest', randomArrayElement(EXIT_MESSAGE));
    }
  });

  const sayItemHandlers = Alexa.CreateStateHandler(states.FINAL, {
    'KnownPlace' : function(place){
      let speechOutput = "";
      //let repromptText = "";
      if(place.itemList.length>10){
        this.emitWithState('SayLongItemList', place);
      }else if(place.itemList.length>0){
        //speechOutput =  prepareItemResponse(place.itemList.concat(place.actionList));
        speechOutput =  prepareItemResponse(place.itemList) +' '+ sayArray(place.actionList, 'and') +' '+randomArrayElement(EXIT_MESSAGE);
        //this.emitWithState('DisplayFinalList', speechOutput);
        this.emitWithState('SessionEndedRequest', speechOutput);
      } else {
        speechOutput = "No items for "+place.placeName.genericName+'. '+randomArrayElement(EXIT_MESSAGE);
        this.emitWithState('SessionEndedRequest', speechOutput);
      }
    },
    'ListedPlace' : function(place){
      let speechOutput = "";

      if(place.itemList.length>10){
        this.emitWithState('SayLongItemList', place);
      } else if(place.itemList.length>0){
        //speechOutput = prepareItemResponseNewPlace(place.itemList.concat(place.actionList)) + " " + randomArrayElement(ADD_ITEM_LATER);
        speechOutput = prepareItemResponseNewPlace(place.itemList) +' '+ sayArray(place.actionList, 'and') + ' ' + randomArrayElement(ADD_ITEM_LATER)+' '+randomArrayElement(EXIT_MESSAGE);
        //this.emitWithState('DisplayFinalList', speechOutput);
        this.emitWithState('SessionEndedRequest', speechOutput);
      } else {
        speechOutput = "No items for "+place.placeName.genericName+ ". " + randomArrayElement(ADD_ITEM_LATER)+' '+randomArrayElement(EXIT_MESSAGE);
        this.emitWithState('SessionEndedRequest', speechOutput);
      }
    },
    'SayLongItemList' : function(place) {
      var chunkedItems = chunkItems(place.itemList, 5);
      chunkedItems = chunkedItems.concat(chunkItems(place.actionList, 2));
      this.attributes['chunkedItems'] = chunkedItems;
      this.attributes['step'] = 0;
      this.emitWithState('SayChunkedItems');
    },
    'SayChunkedItems' : function(){
      let chunkedItems = this.attributes['chunkedItems'];
      let step = this.attributes['step'];
      let speechOutput;
      let repromptText;
      let content;
      if(step==0){
        speechOutput ="It's a long list. I will read them few at a time. ";
        speechOutput =  speechOutput + prepareItemResponse(chunkedItems[step]) + ' Say next for more.';
        repromptText = 'Say Next, Previous or Repeat.';

        // if (helperFunctions.supportsDisplay.call(this)||helperFunctions.isSimulator.call(this)) {
        //   content = helperFunctions.getListContent.call(this, speechOutput, repromptText, ':ask', chunkedItems[step]);
        //   helperFunctions.renderTemplate.call(this,content);
        // } else {
        //   helperFunctions.noDisplayAsk.call(this, speechOutput, repromptText);
        // }


        this.response.cardRenderer(this.t('TITLE'), speechOutput);
        this.response.speak(speechOutput).listen(repromptText);
        this.emit(':responseReady');
      } else if (step==chunkedItems.length-1) {
        speechOutput = 'and finally, ';
        speechOutput =  speechOutput + sayArray(chunkedItems[step], 'and') + '. '+ randomArrayElement(EXIT_MESSAGE);
        // if (helperFunctions.supportsDisplay.call(this)||helperFunctions.isSimulator.call(this)) {
        //   content = helperFunctions.getListContent.call(this, speechOutput, undefined, ':tell', chunkedItems[step]);
        //   helperFunctions.renderTemplate.call(this,content);
        // } else {
        //   helperFunctions.noDisplayTell.call(this, speechOutput);
        // }

        this.emitWithState('SessionEndedRequest', speechOutput);
      } else {
        speechOutput =  sayArray(chunkedItems[step], 'and') + '. Say next for more.';
        repromptText = 'Say next or repeat.';

        // if (helperFunctions.supportsDisplay.call(this)||helperFunctions.isSimulator.call(this)) {
        //   content = helperFunctions.getListContent.call(this, speechOutput, repromptText, ':ask', chunkedItems[step]);
        //   helperFunctions.renderTemplate.call(this,content);
        // } else {
        //   helperFunctions.noDisplayAsk.call(this, speechOutput, repromptText);
        // }

        this.response.cardRenderer(this.t('TITLE'), speechOutput);
        this.response.speak(speechOutput).listen(repromptText);
        this.emit(':responseReady');
      }
    },
    'AMAZON.NextIntent': function(){
      if(this.attributes['step']<this.attributes['chunkedItems'].length)
        this.attributes['step'] = this.attributes['step'] + 1;
      this.emitWithState('SayChunkedItems');
    },
    'AMAZON.PreviousIntent': function(){
      if(this.attributes['step']>0)
        this.attributes['step'] = this.attributes['step'] - 1;
      this.emitWithState('SayChunkedItems');
    },
    'AMAZON.RepeatIntent' : function() {
      this.emitWithState('SayChunkedItems');
    },
    'DisplayFinalList': function(speechOutput){
      speechOutput = speechOutput + ' ' + randomArrayElement(EXIT_MESSAGE);
      console.log('State:'+ this.attributes['STATE']);
      if (supportsDisplay.call(this)||isSimulator.call(this)) {
        let content = getListContent.call(this, speechOutput, undefined, ':tell', undefined);
        renderTemplate.call(this,content);
      } else {
        noDisplayTell.call(this, speechOutput);
      }
    },
    'SessionEndedRequest': function (speechOutput) {
      // if (supportsDisplay.call(this)||isSimulator.call(this)) {
      //   let content = getSimpleTellContent.call(this, speechOutput);
      //   renderTemplate.call(this,content);
      // } else {
      //   noDisplayTell.call(this, speechOutput);
      // }

      this.handler.state = '';
      delete this.attributes['STATE'];
      delete this.attributes['guessedPlace'];
      delete this.attributes['currentPlace'];
      delete this.attributes['editItem'];
      delete this.attributes['placeName'];
      delete this.attributes['chunkedItems'];
      delete this.attributes['step'];

      this.response.cardRenderer(this.t('TITLE'), speechOutput);
      this.response.speak(speechOutput);
      this.emit(":responseReady");

/*

    },

    'SessionEndedRequest': function (speechOutput) {

      if(speechOutput!==undefined)
        speechOutput = speechOutput + ' ' + randomArrayElement(EXIT_MESSAGE);
      else
        speechOutput = randomArrayElement(EXIT_MESSAGE);

      //  console.log(this.attributes['currentPlace'].itemList);
      ///
      if (helperFunctions.supportsDisplay.call(this)||helperFunctions.isSimulator.call(this)) {

      } else {
        this.response.cardRenderer(this.t('TITLE'), speechOutput);
        this.response.speak(speechOutput);
        this.emit(":responseReady");
      }

      ///
      */



    },

    // "ElementSelected" : function() {
    //   // We will look for the value in this.event.request.token in the AnswerIntent call to compareSlots
    //   console.log("in ElementSelected QUIZ state");
    //   this.response.speak('speechOutput');
    //   this.emit(":responseReady");
    // },
    'AMAZON.StopIntent': function () {
      this.emitWithState('SessionEndedRequest', randomArrayElement(EXIT_MESSAGE));
    },
    'AMAZON.CancelIntent': function () {
      this.emitWithState('SessionEndedRequest', randomArrayElement(EXIT_MESSAGE));
    },
    'AMAZON.HelpIntent' : function(){
      this.handler.state = states.HELP;
      this.emitWithState('Start');
    },
    'Unhandled' : function(){
      this.emitWithState('SessionEndedRequest', randomArrayElement(EXIT_MESSAGE));
    }
  });

  const helpHandlers = Alexa.CreateStateHandler(states.HELP, {
    'Start' : function(){
      let speechOutput =  "Just say the name of place you are going to know the list of items to carry. " +
                          "To add or remove items from your existing list say edit item list. ";

      //this.handler.state = states.FINAL;
      //this.emitWithState('SessionEndedRequest', speechOutput +' '+ randomArrayElement(EXIT_MESSAGE));
      this.response.speak(speechOutput).listen(speechOutput);
      this.emit(':responseReady');

    },
    'EditItemIntent': function(){
      this.attributes['editItem'] = true;
      //this.response.speak('Please say the name of place.').listen('');
      //this.handler.state = states.PLACE;
      this.handler.state = states.ITEM;
      this.emitWithState('Start');

      //this.handler.state = states.ITEM;
      //this.emitWithState('CheckUserPlace');
    },
    'AMAZON.StopIntent': function () {
      this.handler.state = states.FINAL;
      this.emitWithState('SessionEndedRequest', randomArrayElement(EXIT_MESSAGE));
    },
    'AMAZON.CancelIntent': function () {
      this.handler.state = states.FINAL;
      this.emitWithState('SessionEndedRequest', randomArrayElement(EXIT_MESSAGE));
    },
    'Unhandled' : function(){
      this.handler.state = states.PLACE;
      this.emitWithState('Start');
      //this.emitWithState('SessionEndedRequest', randomArrayElement(EXIT_MESSAGE));
    },
    'SessionEndedRequest' :function(){
      this.handler.state = states.FINAL;
      this.emitWithState('SessionEndedRequest', randomArrayElement(EXIT_MESSAGE));
    }
  });

  const itemHandlers = Alexa.CreateStateHandler(states.ITEM,{
    'Start' : function() {
      let speechOutput;
      let repromptText;
      if(this.attributes['currentPlace']) {
        speechOutput =  "Just say the name of items one by one as add car key, or you can say the name of all items separated by and, like add car key and water bottle. " +
                            "Similary say remove followed by item name for removal.";
        repromptText = "Say add followed by item name";
        this.response.speak(speechOutput).listen(repromptText);
        this.emit(":responseReady");
      } else {
        speechOutput = "But first, please name the place you want to go!";
        this.handler.state = states.PLACE;
        this.response.speak(speechOutput).listen('May I know where are you going?');
        this.emit(":responseReady");
      }
    },
    'CheckUserPlace' : function(){
      var placeName = this.attributes['placeName'];
      var places = this.attributes['places'];
      let speechOutput = '';
      let repromptText = '';
      if(this.attributes['places']!==undefined){
        if(this.attributes['placeName']!==undefined){
          let userPlace = getUserPlace(placeName, places);
          if(userPlace){
            this.attributes['currentPlace'] = userPlace;
            speechOutput =  "Just say the name of items one by one as add car key, or you can say the name of all items separated by and, like add car key and water bottle. " +
                            "Similary say remove followed by item name for removal.";
            repromptText = "Say add or remove followed by item name";
            this.response.speak(speechOutput).listen(repromptText);
            this.emit(":responseReady");
          } else {
            speechOutput = "No such place found in your places to go. Please include the place first.";
            //this.handler.state = states.NEW_PLACE;
            //this.emitWithState('KnownPlace', placeName);

            this.handler.state = states.FINAL;
            this.emitWithState('SessionEndedRequest', speechOutput);
          }
        } else {
          this.emitWithState('Start');
        }
      } else {
        speechOutput = "Please add the place first.";
        this.handler.state = states.FINAL;
        this.emitWithState('SessionEndedRequest', speechOutput);
      }
    },
    'AddItemIntent': function(){
      let currentPlace = this.attributes['currentPlace'];
      let currentItemList = currentPlace.itemList;
      let speechOutput = '';
      let repromptText = '';
      let index;
      if(this.attributes['currentPlace']) {
        let itemName = this.event.request.intent.slots.Item.value;

        if(itemName) {
          var itemArray = itemName.split("and");
          itemArray.forEach(function (item){
            index = currentItemList.indexOf(item.toString().trim().toLowerCase());
            if (index !== -1) {
              speechOutput = "Item alreday exists. You want to add something else?";
            } else {
              console.log('Added Item:' + item);
              currentItemList.push(item.toString().trim().toLowerCase());
              speechOutput = "OK. You want to add more?";
            }
          });

          repromptText = "You want to add or remove more items?";
          this.response.speak(speechOutput).listen(repromptText);
          this.emit(":responseReady");
        } else {
          speechOutput = 'To add items please say Add followed by item name such as add car keys.';
          this.response.speak(speechOutput).listen(speechOutput);
          this.emit(":responseReady");
        }
      } else {
        speechOutput = "But first, please name the place you want to go!";
        this.handler.state = states.PLACE;
        this.response.speak(speechOutput).listen(speechOutput);
        this.emit(":responseReady");
      }
    },
    'RemoveItemIntent': function(){
      let currentPlace = this.attributes['currentPlace'];
      let currentItemList = currentPlace.itemList;
      let speechOutput = '';
      let repromptText = '';
      let index;
      if(this.attributes['currentPlace']) {
        let itemName = this.event.request.intent.slots.Item.value;

        if(itemName) {
          var itemArray = itemName.split("and");
          itemArray.forEach(function (item){
            index = currentItemList.indexOf(item.toString().trim().toLowerCase());
            if (index !== -1) {
              currentItemList.splice(index, 1);
              speechOutput = "Removed. You want to delete more?";
            }
            else {
              speechOutput = "No such item found! You want to delete something else?";
            }
          });

          repromptText = "You want to add or remove more items?";
          this.response.speak(speechOutput).listen(repromptText);
          this.emit(":responseReady");
        } else {
          speechOutput = 'To remove items please say Remove followed by item name such as add car keys.';
          this.response.speak(speechOutput).listen(speechOutput);
          this.emit(":responseReady");
        }
      } else {
        speechOutput = "But first, please name the place you want to go!";
        this.handler.state = states.PLACE;
        this.response.speak(speechOutput).listen(speechOutput);
        this.emit(":responseReady");
      }
    },
    'AMAZON.NoIntent': function () {
      let currentPlace = this.attributes['currentPlace'];
      let speechOutput = "Thank you! I have modified the items.";
      if(this.attributes['places'].length > 0){
        let userPlace = getUserPlace(currentPlace.placeName, this.attributes['places']);
        if(userPlace){
          let updatedPlaces = updateUserPlace(currentPlace, this.attributes['places']);
          this.attributes['places'] = updatedPlaces;
        } else {
          this.attributes['places'].push(currentPlace);
        }
      } else {
        this.attributes['places'].push(currentPlace);
      }

      this.handler.state = states.FINAL;
      this.emitWithState('SessionEndedRequest', speechOutput);
    },
    'AMAZON.YesIntent': function () {
      let repromptText = "Please add or remove followed by item name.";
      this.response.speak(repromptText).listen(repromptText);
      this.emit(":responseReady");
    },
    'AMAZON.StopIntent': function () {
      this.handler.state = states.FINAL;
      this.emitWithState('SessionEndedRequest', "No change has been made. "+randomArrayElement(EXIT_MESSAGE));
    },
    'AMAZON.CancelIntent': function () {
      this.handler.state = states.FINAL;
      this.emitWithState('SessionEndedRequest', "No change has been made. "+randomArrayElement(EXIT_MESSAGE));
    },
    'Unhandled': function () {
      // let repromptText = "Please name the items.";
      // this.response.speak(repromptText).listen(repromptText);
      // this.emit(":responseReady");
      this.emitWithState('AMAZON.NoIntent')
    },
    'SessionEndedRequest' :function(){
      this.handler.state = states.FINAL;
      this.emitWithState('SessionEndedRequest', randomArrayElement(EXIT_MESSAGE));
    }
  });

//    END of Intent Handlers {} ========================================================================================
// 3. Helper Function  =================================================================================================

//function getBackgroundImage() { return "https://s3.amazonaws.com/webappvui/img/breakfast_sandwich_large.png"; }


function sayArray(myData, andor) {
  //say items in an array with commas and conjunctions.
  // the first argument is an array [] of items
  // the second argument is the list penultimate word; and/or/nor etc.

  var listString = '';

  if (myData.length == 1) {
    //just say the one item
    listString = myData[0];
  } else {
    if (myData.length == 2) {
      //add the conjuction between the two words
      listString = myData[0] + ' ' + andor + ' ' + myData[1];
    } else if (myData.length == 4 && andor=='and'){
      //read the four words in pairs when the conjuction is and
      listString=myData[0]+" and "+myData[1]+", as well as, "
      + myData[2]+" and "+myData[3];

    }  else {
      //build an oxford comma separated list
      for (var i = 0; i < myData.length; i++) {
        if (i < myData.length - 2) {
          listString = listString + myData[i] + ', ';
        } else if (i == myData.length - 2) {            //second to last
          listString = listString + myData[i] + ', ' + andor + ' ';
        } else {                                        //last
          listString = listString + myData[i];
        }
      }
    }
  }

  return(listString);
}

function randomArrayElement(array) {
  var i = 0;
  i = Math.floor(Math.random() * array.length);
  return(array[i]);
}

function randomiseArray(itemList) {
  var j, x, i;
  for (i = itemList.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = itemList[i];
    itemList[i] = itemList[j];
    itemList[j] = x;
  }
}

function getDefaultPlace(placeName){
  let placeObject = false;

  placeObject = placeData.defaultPlaces.filter(x => (x.placeName.genericName.toLowerCase() == placeName.genericName.toString().toLowerCase() && x.placeName.specificName.toLowerCase() == placeName.specificName.toString().toLowerCase()));

  if(placeObject.length==0)
    placeObject = placeData.defaultPlaces.filter(x => (x.placeName.genericName.toLowerCase() == placeName.genericName.toString().toLowerCase()));
  if(placeObject.length==0)
    placeObject = placeData.defaultPlaces.filter(x => (x.placeName.specificName.toLowerCase() == placeName.genericName.toString().toLowerCase()));

  return placeObject[0];
}

function getSPecificDefaultPlace(placeName){
  let placeObject = false;

  placeObject = placeData.defaultPlaces.filter(x => (x.placeName.specificName.toLowerCase() == placeName.specificName.toString().toLowerCase()));

  return placeObject[0];
}

function getUserPlace(placeName, places){
  let placeObject = false;
  console.log(placeName);
  console.log(places);
  places.forEach(function(place){
    if(place.placeName.genericName.toLowerCase() == placeName.genericName.toLowerCase() && place.placeName.specificName.toLowerCase() == placeName.specificName.toLowerCase())
        placeObject = place;
  });

  if(!placeObject){
    places.forEach(function(place){
      if(place.placeName.genericName.toLowerCase() == placeName.genericName.toLowerCase())
          placeObject = place;
    });
  }

  if(!placeObject){
    places.forEach(function(place){
      if(place.placeName.specificName.toLowerCase() == placeName.genericName.toLowerCase())
          placeObject = place;
    });
  }
  return placeObject;
}

function updateUserPlace(currentPlace, places) {
  if(places.length>0){
    places.forEach(function(place){
      if(place.placeName.genericName.toLowerCase() == currentPlace.placeName.genericName.toLowerCase() && place.placeName.specificName.toLowerCase() == currentPlace.placeName.specificName.toLowerCase())
        place.itemList = currentPlace.itemList;
    });
  }
  return places;
}

function prepareItemResponse(itemList) {
  var itemsArray = sayArray(itemList, 'and');
  //console.log(itemsArray);
  let str = randomArrayElement(PREPEND_MESSAGE);

  str = str.replace('{itemsArray}', itemsArray);
  return str;// + '.';
}

function prepareItemResponseNewPlace(itemList) {
  var itemsArray = sayArray(itemList, 'and');
  //console.log(itemsArray);
  let str = 'Normally people would take ' + itemsArray + '.' ;
  //str = str.replace('{itemsArray}', itemsArray);
  return str;
}

function validateSlot(slots) {
  let valid = false;
  for (let slot in slots) {
    if (slots[slot].value !== undefined) {
      valid = true;
    }
  }
  return valid;
}

function getPlaceSlot(slots) {
  let slotName = '';
  for (let slot in slots) {
    if (slots[slot].value !== undefined) {
      return slots[slot];
    }
  }
  return slotName;
}

function getPlaceName(slots) {
  let placeName = {'genericName': ' ', 'specificName':' '};
  let slot = getPlaceSlot(slots);
  console.log(slot);

  switch(slot.name) {
    case 'Out':
      //placeName.genericName = slot.resolutions.resolutionsPerAuthority.values.value.name;// value; resolutions.resolutionsPerAuthority.values[].value.name
      placeName.genericName = slot.resolutions.resolutionsPerAuthority[0].values[0].value.name;
    break;
    case 'Work':
      //placeName.genericName = slot.value;
      placeName.genericName = slot.resolutions.resolutionsPerAuthority[0].values[0].value.name;
    break;
    case 'YoungWork':
      //placeName.genericName = slot.value;
      placeName.genericName = slot.resolutions.resolutionsPerAuthority[0].values[0].value.name;
    break;
    case 'Party':
      //placeName.genericName = slot.value;
      placeName.genericName = slot.resolutions.resolutionsPerAuthority[0].values[0].value.name;
    break;
    case 'Country' :
      placeName.genericName = 'abroad';
      placeName.specificName = slot.value;
      //placeName.genericName = slot.resolutions.resolutionsPerAuthority[0].values[0].value.name;
    break;
    case 'EuropeCity' :
      placeName.genericName = 'abroad';
      placeName.specificName = slot.value;
      //placeName.genericName = slot.resolutions.resolutionsPerAuthority[0].values[0].value.name;
    break;
    case 'UsCity' :
      placeName.genericName = 'tour';
      placeName.specificName = slot.value;
      //placeName.genericName = slot.resolutions.resolutionsPerAuthority[0].values[0].value.name;
    break;
    case 'Airport' :
      placeName.genericName = 'short travel';
      placeName.specificName = slot.value;
    break;
    case 'MovieTheater' :
      placeName.genericName = 'out';
      placeName.specificName = slot.value;
      //placeName.genericName = slot.resolutions.resolutionsPerAuthority[0].values[0].value.name;
    break;
    case 'Movie' :
      placeName.genericName = 'out';
      placeName.specificName = 'movie';
    break;
    case 'MusicEvent' :
      placeName.genericName = 'out';
      placeName.specificName = slot.value;
      //placeName.genericName = slot.resolutions.resolutionsPerAuthority[0].values[0].value.name;
    break;
    case 'UnlistedPlace' :
      placeName.genericName = 'uncat';
      placeName.specificName = slot.value;
    break;
    default:
      placeName.genericName = 'uncat';
      placeName.genericName = slot.value;
    break;

  }
  return placeName;
}

function getSportName(slots) {
  let placeName = {'genericName': '', 'specificName':''};
  let slot = getPlaceSlot(slots);
  placeName.genericName = 'practice';
  placeName.specificName = slot.value;
  return placeName;
}

function getMusicName(slots) {
  let placeName = {'genericName': '', 'specificName':''};
  let slot = getPlaceSlot(slots);
  placeName.genericName = 'music';
  placeName.specificName = slot.value;
  return placeName;
}

function getAppointmentName(slots) {
  let placeName = {'genericName': '', 'specificName':''};
  let slot = getPlaceSlot(slots);
  placeName.genericName = 'checkup';
  placeName.specificName = slot.value;
  return placeName;
}

function chunkItems(items, chunkSize) {
  var chunkedItems = [];
  var i,j,tempArray;
  for (i=0,j=items.length; i<j; i+=chunkSize) {
    tempArray = items.slice(i,i+chunkSize);
    chunkedItems.push(tempArray);
  }
  return chunkedItems;
}

function toTitleCase(str) {
  return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

///// From Here


// function supportsDisplay() {
//     var hasDisplay =
//       this.event.context &&
//       this.event.context.System &&
//       this.event.context.System.device &&
//       this.event.context.System.device.supportedInterfaces &&
//       this.event.context.System.device.supportedInterfaces.Display

//     return hasDisplay;
//   }

// function isSimulator() {
//     var isSimulator = !this.event.context; //simulator doesn't send context
//     return false;
//   }

// function noDisplayTell(speechOutput) {
//   this.handler.state = '';
//   delete this.attributes['STATE'];
//   delete this.attributes['guessedPlace'];
//   delete this.attributes['currentPlace'];
//   delete this.attributes['editItem'];
//   delete this.attributes['placeName'];
//   delete this.attributes['chunkedItems'];
//   delete this.attributes['step'];

//   this.response.cardRenderer(this.t('TITLE'), speechOutput);
//   this.response.speak(speechOutput);
//   this.emit(":responseReady");
// }

// function getSimpleTellContent(speechOutput) {
//   let content = {
//               "hasDisplaySpeechOutput" : speechOutput,
//               //"hasDisplayRepromptText" : repromptText,
//               "noDisplaySpeechOutput" : speechOutput,
//               //"noDisplayRepromptText" : repromptText,
//               "simpleCardTitle" : this.t('TITLE'),
//               "simpleCardContent" : speechOutput,
//               "bodyTemplateContent" : this.t('TITLE') + "\n" + speechOutput,
//               "templateToken" : "SimpleView",
//               "askOrTell": ":tell",
//               //"hint" : "Try saying the name of place like 'Office'",
//               "sessionAttributes" : this.attributes
//           };
//   return content;
// }

// function getListContent(speechOutput, repromptText, askOrTell, items) {
//   let headerText = 'Items Required: ';
//   if(this.attributes['currentPlace'].placeName.specificName == ' ')
//     headerText += toTitleCase(this.attributes['currentPlace'].placeName.genericName);
//   else
//     headerText += toTitleCase(this.attributes['currentPlace'].placeName.specificName);

//   if(items===undefined)
//     items = this.attributes['currentPlace'].itemList.concat(this.attributes['currentPlace'].actionList);

//   let listItems = items.map((x) => {
//     return { "token" : x,
//       "textContent" : {
//         "primaryText":
//         {
//           "text": toTitleCase(x),
//           "type": "PlainText"
//         }
//       }
//     }
//   });
//   let content = {
//         "hasDisplaySpeechOutput" : speechOutput,
//         "hasDisplayRepromptText" : repromptText,
//         "noDisplaySpeechOutput" : speechOutput,
//         "noDisplayRepromptText" : repromptText,
//         "simpleCardTitle" : headerText,
//         "simpleCardContent" : speechOutput,
//         "listTemplateTitle" : headerText,
//         "templateToken" : "MultipleItemListView",
//         "askOrTell": askOrTell,
//         "listItems" : listItems,
//         "sessionAttributes" : this.attributes
//     };

//   return content;
// }

// function renderTemplate(content) {
//    console.log("renderTemplate" + content.templateToken);
//    switch(content.templateToken) {
//        case "WelcomeScreenView":
//          this.context.succeed(response);
//          break;
//        case "SimpleView":
//         var response = {
//           "version": "1.0",
//           "response": {
//             "directives": [
//               {
//                 "type": "Display.RenderTemplate",
//                 "backButton": "HIDDEN",
//                 "template": {
//                   "type": "BodyTemplate6",
//                   //"title": content.bodyTemplateTitle,
//                   "token": content.templateToken,
//                   "textContent": {
//                     "primaryText": {
//                       "type": "RichText",
//                       "text": "<font size = '7'>"+content.bodyTemplateContent+"</font>"
//                     }
//                   }
//                 }
//               },{
//                   "type": "Hint",
//                   "hint": {
//                     "type": "PlainText",
//                     "text": content.hint
//                   }
//                 }
//             ],
//             "outputSpeech": {
//               "type": "SSML",
//               "ssml": "<speak>"+content.hasDisplaySpeechOutput+"</speak>"
//             },
//             "reprompt": {
//               "outputSpeech": {
//                 "type": "SSML",
//                 "ssml": "<speak>"+content.hasDisplayRepromptText+"</speak>"
//               }
//             },
//             "shouldEndSession": content.askOrTell== ":tell",

//           },
//           "sessionAttributes": content.sessionAttributes

//         }

//         if(content.backgroundImageUrl) {
//           //when we have images, create a sources object

//           let sources = [
//             {
//               "size": "SMALL",
//               "url": content.backgroundImageUrl
//             },
//             {
//               "size": "LARGE",
//               "url": content.backgroundImageUrl
//             }
//           ];
//           //add the image sources object to the response
//           response["response"]["directives"][0]["template"]["backgroundImage"]={};
//           response["response"]["directives"][0]["template"]["backgroundImage"]["sources"]=sources;
//         }


//         //if(content.askOrTell==':tell') {
//               this.handler.state = '';
//               delete this.attributes['STATE'];
//               delete this.attributes['guessedPlace'];
//               delete this.attributes['currentPlace'];
//               delete this.attributes['editItem'];
//               delete this.attributes['placeName'];
//               delete this.attributes['chunkedItems'];
//               delete this.attributes['step'];
//         //}


//          //Send the response to Alexa
//          this.context.succeed(response);
//          break;

//        case "MultipleItemListView":
//        console.log ("listItems "+JSON.stringify(content.listItems));
//            var response = {
//               "version": "1.0",
//               "response": {
//                 "directives": [
//                   {
//                     "type": "Display.RenderTemplate",
//                     "template": {
//                       "type": "ListTemplate1",
//                       "title": content.listTemplateTitle,
//                       "token": content.templateToken,
//                       "listItems":content.listItems,
//                       "backButton": "HIDDEN"
//                     }
//                   }
//                 ],
//                 "outputSpeech": {
//                   "type": "SSML",
//                   "ssml": "<speak>"+content.hasDisplaySpeechOutput+"</speak>"
//                 },
//                 "reprompt": {
//                   "outputSpeech": {
//                     "type": "SSML",
//                     "ssml": "<speak>"+content.hasDisplayRepromptText+"</speak>"
//                   }
//                 },
//                 "shouldEndSession": content.askOrTell== ":tell",
//                 "card": {
//                   "type": "Simple",
//                   "title": content.simpleCardTitle,
//                   "content": content.simpleCardContent
//                 }
//               },
//                 "sessionAttributes": content.sessionAttributes

//           }

//             console.log("ready to respond (MultipleChoiceList): "+JSON.stringify(response));
//             //if(content.askOrTell==":tell") {
//               this.handler.state = '';
//               delete this.attributes['STATE'];
//               delete this.attributes['guessedPlace'];
//               delete this.attributes['currentPlace'];
//               delete this.attributes['editItem'];
//               delete this.attributes['placeName'];
//               delete this.attributes['chunkedItems'];
//               delete this.attributes['step'];
//             //}
//             this.context.succeed(response);
//            break;
//        default:
//           this.handler.state = '';
//           delete this.attributes['STATE'];
//           delete this.attributes['guessedPlace'];
//           delete this.attributes['currentPlace'];
//           delete this.attributes['editItem'];
//           delete this.attributes['placeName'];
//           delete this.attributes['chunkedItems'];
//           delete this.attributes['step'];
//           this.response.speak("Thanks for playing, goodbye");
//           this.emit(':responseReady');
//    }
// }



///// To here

exports.handler = function (event, context) {
  const alexa = Alexa.handler(event, context);
  alexa.appId = "amzn1.ask.skill.daf07c82-babe-49e8-a9cf-10f0d3a141b5";
  alexa.dynamoDBTableName = 'ReminderRhea';
  alexa.resources = languageStrings;
  alexa.registerHandlers(newSessionHandlers, userHandlers, placeHandlers, newPlaceHandlers, guessPlaceHandlers, sayItemHandlers, itemHandlers, helpHandlers);
  alexa.execute();
};
