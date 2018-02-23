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
                    
                } else if(imdb >= 8.0 && rottentomatoes >= 80 && metacritic >= 80 )  {
                
                    this.response.speak('With IMDB rating of  ' + imdb + ' out of 10, and ratings of ' + rottentomatoes + ' percent and ' + metacritic +  ' percent on Rotten Tomatoes and Metacritic respectively;  Alexa highly recommends that you watch ' + myResult1);
                    this.emit(':responseReady');

                } else if(imdb >= 8.0 && rottentomatoes < 80 || metacritic < 80 )  {
                    
                    rePrompt = "I'm waiting! Can I suggest you a different movie of the same genre?"
                    this.response.speak('The movie: ' + myResult1 + ' has got mixed responses from its viewers.  You can watch it if you want or I can suggest you a different movie of the same genre. May I?' ).listen(rePrompt);
                    TMDbGet(myResult1, (title, overview));
                    this.response.speak('')
                    this.emit(':responseReady');
                
                } else {
                
                    this.response.speak('The movie: ' + myResult1 + ' has got negative responses from its viewers.  Alexa recommends that you dont watch this movie. Instead, I can suggest you a different movie of the same genre. May I?' );
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

                    console.log(a.Ratings[0].Value);
                    console.log(a.Ratings[1].Value);
                    console.log(a.Ratings[2].Value);

                    if (ratingscount == '1') {
                        callback(a.Title, a.Year, a.Director, a.Plot, Number(a.imdbRating), "", "");

                    } else if (ratingscount == '2'){

                        var rt = a.Ratings[2].Value.match(/^\d*/);
                        callback(a.Title, a.Year, a.Director, a.Plot,  Number(a.imdbRating), Number(rt[0]), "");

                    } else {

                        var rt = a.Ratings[1].Value.match(/^\d*/);
                        var metac = a.Ratings[2].Value.match(/^\d*/);
                        
                    //    console.log(rt[0]);
                    //    console.log(metac[0]);
                    //    console.log(typeof a.imdbRating);
                    //    console.log(typeof Number(metac), metac[0], Number(metac[0]));
                    //    console.log(typeof rt);
                        
                        callback(a.Title, a.Year, a.Director, a.Plot, Number(a.imdbRating), Number(rt[0]), Number(metac[0]));                      
                    }


                    
                }
            
        });

    });
    req.end();

}

function TMDbGet(myData, callback) {

    console.log("mydata: " +myData);

    var tmdbkey = "e9dd55631e8d5b3af53eeae3e2c13dc6"
    var options = {
        host: 'api.themoviedb.org',
        path: '3/search/movie?api_key='+ tmdbkey +'&query=' +encodeURIComponent(myData),
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

            console.log("Status: " + a.total_results);
            
            if (a.total_results == 0) {
                
                console.log("Not Found");
                callback("", a.total_results, "", "");
                
            } else { 

                for(var i=1; i<=a.total_results; i++)
                {
                    if(a.results[i].title == myData) {

                        getSimilar(a.results[i].id, (title, overview));

                        console.log('Sent from TMDBGet:' + mydata);
                        console.log('Received: ' + title + overview);

                        callback(title, overview);
                    }
                }
            }
        });
    });

    req.end();
}

function getSimilar(id, callback) {

    console.log("id: " +id);

    var tmdbkey = "e9dd55631e8d5b3af53eeae3e2c13dc6"
    var options = {
        host: 'api.themoviedb.org',
        path: '3/movies/'+ id +'/similar?api_key='+ tmdbkey,
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

            console.log("Status: " + a.total_results);
            
            if (a.total_results == 0) {
                
                console.log("Not Found");
                callback("", a.total_results, "", "");
                
            } else { 

                console.log("title: " + a[1].Title);
                console.log("plot: " + a[1].overview); 
                
                callback(a[1].title, a[1].overview);
            }
        });
    });
}