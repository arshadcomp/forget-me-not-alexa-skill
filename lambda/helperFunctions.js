
module.exports = {



supportsDisplay: function () {
    var hasDisplay =
      this.event.context &&
      this.event.context.System &&
      this.event.context.System.device &&
      this.event.context.System.device.supportedInterfaces &&
      this.event.context.System.device.supportedInterfaces.Display

    return hasDisplay;
  },

isSimulator: function () {
    var isSimulator = !this.event.context; //simulator doesn't send context
    return false;
  },

noDisplayAsk : function(speechOutput, repromptText) {
  this.response.cardRenderer(this.t('TITLE'), speechOutput);
  this.response.speak(speechOutput).listen(repromptText);
  this.emit(":responseReady");
},

noDisplayTell : function(speechOutput) {
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
},

getSimpleAskContent : function(speechOutput, repromptText) {
  let content = {
              "hasDisplaySpeechOutput" : speechOutput,
              "hasDisplayRepromptText" : repromptText,
              "noDisplaySpeechOutput" : speechOutput,
              "noDisplayRepromptText" : repromptText,
              "simpleCardTitle" : this.t('TITLE'),
              "simpleCardContent" : speechOutput,
              "bodyTemplateContent" : this.t('TITLE') + "\n" + speechOutput,
              "templateToken" : "SimpleView",
              "askOrTell": ":ask",
              "hint" : "I am leaving for Office",
              "sessionAttributes" : this.attributes
          };
  return content;
},
getSimpleTellContent : function(speechOutput) {
  let content = {
              "hasDisplaySpeechOutput" : speechOutput,
              //"hasDisplayRepromptText" : repromptText,
              "noDisplaySpeechOutput" : speechOutput,
              //"noDisplayRepromptText" : repromptText,
              "simpleCardTitle" : this.t('TITLE'),
              "simpleCardContent" : speechOutput,
              "bodyTemplateContent" : this.t('TITLE') + "\n" + speechOutput,
              "templateToken" : "SimpleView",
              "askOrTell": ":tell",
              //"hint" : "Try saying the name of place like 'Office'",
              "sessionAttributes" : this.attributes
          };
  return content;
},

getListContent : function(speechOutput, repromptText, askOrTell, items) {
  let headerText = 'Items Required: ';
  if(this.attributes['currentPlace'].placeName.specificName == ' ')
    headerText += toTitleCase(this.attributes['currentPlace'].placeName.genericName);
  else
    headerText += toTitleCase(this.attributes['currentPlace'].placeName.specificName);

  if(items===undefined)
    items = this.attributes['currentPlace'].itemList.concat(this.attributes['currentPlace'].actionList);

  let listItems = items.map((x) => {
    return { "token" : x,
      "textContent" : {
        "primaryText":
        {
          "text": toTitleCase(x),
          "type": "PlainText"
        }
      }
    }
  });
  let content = {
        "hasDisplaySpeechOutput" : speechOutput,
        "hasDisplayRepromptText" : repromptText,
        "noDisplaySpeechOutput" : speechOutput,
        "noDisplayRepromptText" : repromptText,
        "simpleCardTitle" : headerText,
        "simpleCardContent" : speechOutput,
        "listTemplateTitle" : headerText,
        "templateToken" : "MultipleItemListView",
        "askOrTell": askOrTell,
        "listItems" : listItems,
        "sessionAttributes" : this.attributes
    };

  return content;
},


renderTemplate : function(content) {
   console.log("renderTemplate" + content.templateToken);
   //learn about the various templates
   //https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/display-interface-reference#display-template-reference
   //
   switch(content.templateToken) {
       case "WelcomeScreenView":
         //Send the response to Alexa
         this.context.succeed(response);
         break;
       case "SimpleView":
        //  "hasDisplaySpeechOutput" : response + " " + EXIT_SKILL_MESSAGE,
        //  "bodyTemplateContent" : getFinalScore(this.attributes["quizscore"], this.attributes["counter"]),
        //  "templateToken" : "FinalScoreView",
        //  "askOrTell": ":tell",
        //  "hint":"start a quiz",
        //  "sessionAttributes" : this.attributes
        //  "backgroundImageUrl"
        var response = {
          "version": "1.0",
          "response": {
            "directives": [
              {
                "type": "Display.RenderTemplate",
                "backButton": "HIDDEN",
                "template": {
                  "type": "BodyTemplate6",
                  //"title": content.bodyTemplateTitle,
                  "token": content.templateToken,
                  "textContent": {
                    "primaryText": {
                      "type": "RichText",
                      "text": "<font size = '7'>"+content.bodyTemplateContent+"</font>"
                    }
                  }
                }
              },{
                  "type": "Hint",
                  "hint": {
                    "type": "PlainText",
                    "text": content.hint
                  }
                }
            ],
            "outputSpeech": {
              "type": "SSML",
              "ssml": "<speak>"+content.hasDisplaySpeechOutput+"</speak>"
            },
            // "reprompt": {
            //   "outputSpeech": {
            //     "type": "SSML",
            //     "ssml": ""
            //   }
            // },
            "reprompt": {
              "outputSpeech": {
                "type": "SSML",
                "ssml": "<speak>"+content.hasDisplayRepromptText+"</speak>"
              }
            },
            "shouldEndSession": content.askOrTell== ":tell",

          },
          "sessionAttributes": content.sessionAttributes

        }

        if(content.backgroundImageUrl) {
          //when we have images, create a sources object

          let sources = [
            {
              "size": "SMALL",
              "url": content.backgroundImageUrl
            },
            {
              "size": "LARGE",
              "url": content.backgroundImageUrl
            }
          ];
          //add the image sources object to the response
          response["response"]["directives"][0]["template"]["backgroundImage"]={};
          response["response"]["directives"][0]["template"]["backgroundImage"]["sources"]=sources;
        }


        //if(content.askOrTell==':tell') {
              this.handler.state = '';
              delete this.attributes['STATE'];
              delete this.attributes['guessedPlace'];
              delete this.attributes['currentPlace'];
              delete this.attributes['editItem'];
              delete this.attributes['placeName'];
              delete this.attributes['chunkedItems'];
              delete this.attributes['step'];
        //}


         //Send the response to Alexa
         this.context.succeed(response);
         break;

       case "MultipleItemListView":
       console.log ("listItems "+JSON.stringify(content.listItems));
           var response = {
              "version": "1.0",
              "response": {
                "directives": [
                  {
                    "type": "Display.RenderTemplate",
                    "template": {
                      "type": "ListTemplate1",
                      "title": content.listTemplateTitle,
                      "token": content.templateToken,
                      "listItems":content.listItems,
                      // "backgroundImage": {
                      //   "sources": [
                      //     {
                      //       "size": "SMALL",
                      //       "url": content.backgroundImageSmallUrl
                      //     },
                      //     {
                      //       "size": "LARGE",
                      //       "url": content.backgroundImageLargeUrl
                      //     }
                      //   ]
                      // },
                      "backButton": "HIDDEN"
                    }
                  }
                ],
                "outputSpeech": {
                  "type": "SSML",
                  "ssml": "<speak>"+content.hasDisplaySpeechOutput+"</speak>"
                },
                "reprompt": {
                  "outputSpeech": {
                    "type": "SSML",
                    "ssml": "<speak>"+content.hasDisplayRepromptText+"</speak>"
                  }
                },
                "shouldEndSession": content.askOrTell== ":tell",
                "card": {
                  "type": "Simple",
                  "title": content.simpleCardTitle,
                  "content": content.simpleCardContent
                }
              },
                "sessionAttributes": content.sessionAttributes

          }

            if(content.backgroundImageLargeUrl) {
              //when we have images, create a sources object
              //TODO switch template to one without picture?
              let sources = [
                {
                  "size": "SMALL",
                  "url": content.backgroundImageLargeUrl
                },
                {
                  "size": "LARGE",
                  "url": content.backgroundImageLargeUrl
                }
              ];
              //add the image sources object to the response
              response["response"]["directives"][0]["template"]["backgroundImage"]={};
              response["response"]["directives"][0]["template"]["backgroundImage"]["sources"]=sources;
            }
            console.log("ready to respond (MultipleChoiceList): "+JSON.stringify(response));
            //if(content.askOrTell==":tell") {
              this.handler.state = '';
              delete this.attributes['STATE'];
              delete this.attributes['guessedPlace'];
              delete this.attributes['currentPlace'];
              delete this.attributes['editItem'];
              delete this.attributes['placeName'];
              delete this.attributes['chunkedItems'];
              delete this.attributes['step'];
            //}
            this.context.succeed(response);
           break;
       default:
          this.handler.state = '';
          delete this.attributes['STATE'];
          delete this.attributes['guessedPlace'];
          delete this.attributes['currentPlace'];
          delete this.attributes['editItem'];
          delete this.attributes['placeName'];
          delete this.attributes['chunkedItems'];
          delete this.attributes['step'];
          this.response.speak("Thanks for playing, goodbye");
          this.emit(':responseReady');
   }

}


};



function toTitleCase(str) {
  return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}
