// alexa-cookbook sample code

// There are three sections, Text Strings, Skill Code, and Helper Function(s).
// You can copy and paste the entire file contents as the code for a new Lambda function,
//  or copy & paste section #3, the helper function, to the bottom of your existing Lambda code.


// 1. Text strings =====================================================================================================
//    Modify these strings and messages to change the behavior of your Lambda function


const welcomeRePrompt = "Please provide your input"

// 2. Skill Code =======================================================================================================


var Alexa = require('alexa-sdk');

exports.handler = function(event, context, callback) {
    const alexa = Alexa.handler(event, context);

    // alexa.appId = 'amzn1.echo-sdk-ams.app.1234';
    // alexa.dynamoDBTableName = 'YourTableName'; // creates new table for session.attributes

    alexa.registerHandlers(handlers);
    alexa.execute();
};

const handlers = {
    'LaunchRequest': function () {
        this.response.speak('Welcome to the Movie Decider Skill. You can listen to a random poem by saying: Alexa, tell me a poem. ' + ' Or, you can listen to a poem of your favorite author by saying: Alexa, tell me a poem by Oscar Wilde. Just replace the poet name with your favorite authors name. ').listen(welcomeRePrompt);
        this.emit(':responseReady');
    },
    
    'Unhandled': function() {
        this.emit(':ask', 'Sorry, Given Movie name cannot be found. Please retry with another Poet name. ');
    },

    
    'Watch_or_not': function () {
        
        var Movie = this.event.request.intent.slots.Movie.value;
        console.log("Movie Name from Slot: " + Movie);
        
        httpGet(Movie,  (myResult1, myResult2, myResult3, myResult4, imdb, rottentomatoes, metacritic) => {
                console.log("sent     : " + Movie);
                console.log("received : " + myResult1 + ", " + myResult2 + ", " + myResult3 + ", " + myResult4 + ", " + imdb + ", " + rottentomatoes + ", " + metacritic);
                
                if (myResult2 == "False") {
                    this.response.speak('Sorry, Given Movie cannot be found. Please retry with another Movie name.');
                    this.emit(':responseReady');
                    
                } else {
                
                    this.response.speak('Movie Found. The movie: ' + myResult1 + ', ' + ' released in: ' + myResult2 + ', is directed by: ' + myResult3 +  ' and has the plot as follows: ' + myResult4);
                    this.emit(':responseReady');
                }
            }
        );

    },
    
    'AMAZON.HelpIntent': function () {
        speechOutput = "I'm here to help you. You can listen to a random poem by saying: Alexa, tell me a poem. Or, you can listen to a poem of your favorite author by saying: Alexa, tell me a poem by Oscar Wilde. Just replace the poet name with your favorite authors name. ";
        reprompt = "I'm waiting for your input ";
        this.response.speak(speechOutput).listen(reprompt);
        this.emit(':responseReady');
    },
    
    'AMAZON.CancelIntent': function () {
        speechOutput = "Cancelling the current operation.";
        this.response.speak(speechOutput);
        this.emit(':responseReady');
    },
    
    'AMAZON.StopIntent': function () {
        speechOutput = "Thank you for allowing me to tell you a poem. Exiting for now!";
        this.response.speak(speechOutput);
        this.emit(':responseReady');
    },
    
    'SessionEndedRequest': function () {
        var speechOutput = "Sorry, your session is over.";
        this.response.speak(speechOutput);
        this.emit(':responseReady');
    },
};


//    END of Intent Handlers {} ========================================================================================
// 3. Helper Function  =================================================================================================


var http = require('http');
// https is a default part of Node.JS.  Read the developer doc:  https://nodejs.org/api/https.html
// try other APIs such as the current bitcoin price : https://btc-e.com/api/2/btc_usd/ticker  returns ticker.last

function httpGet(myData, callback) {

    // GET is a web service request that is fully defined by a URL string
    // Try GET in your browser:
    // https://cp6gckjt97.execute-api.us-east-1.amazonaws.com/prod/stateresource?usstate=New%20Jersey

    console.log("myData: " + myData);
    
    
    // Update these options with the details of the web service you would like to call
    var options = {
        host: 'omdbapi.com',
        path: '/?t=' + encodeURIComponent(myData) +'&apikey=458d4ffb',
        method: 'GET',

        // if x509 certs are required:
        // key: fs.readFileSync('certs/my-key.pem'),
        // cert: fs.readFileSync('certs/my-cert.pem')
    };

    var req = http.request(options, res => {
        res.setEncoding('utf8');
        var returnData = "";

        res.on('data', chunk => {
            returnData = returnData + chunk;
        });
        
        
        res.on('end', () => {
            // we have now received the raw return data in the returnData variable.
            // We can see it in the log output via:
            // console.log(JSON.stringify(returnData))
            // we may need to parse through it to extract the needed data
            
            console.log("returnData: " + returnData);
        
            var a = JSON.parse(returnData);
            var desc = JSON.parse(returnData);
            var total = JSON.parse(returnData).length;
            
            console.log("Status: " + a.Response);
            
            if (a.Response == "False") {
                
                console.log("Not Found");
                callback("", a.Response, "", "");
                
            } else {
                

                    console.log("title: " + a.Title);
                    console.log("year: " + a.Year);
                    console.log("director: " + a.Director);
                    console.log("plot: " + a.Plot);     
                    console.log("imdb rating: " + a.imdbRating);

                    var ratingscount = a.Ratings.length;
                    console.log("No. of ratings: " +ratingscount);

                    if (ratingscount == '1') {
                        callback(a.Title, a.Year, a.Director, a.Plot, a.imdbRating, "", "");

                    } else if (ratingscount == '2'){

                        var rt = a.Ratings[2].Value.match(/^\d+\W+\d/);
                        callback(a.Title, a.Year, a.Director, a.Plot, a.imdbRating, rt, "");

                    } else {

                        var rt = a.Ratings[2].Value.match(/^\d+\W+\d/);
                        var metac = a.Ratings[3].Value.match(/^\d+\W+\d/);
                        callback(a.Title, a.Year, a.Director, a.Plot, a.imdbRating, rt, metac);                      
                    }


                    
                }
            
        });

    });
    req.end();

}

