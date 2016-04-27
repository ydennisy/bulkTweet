/**
 * Dependencies
 */
var afinn = require('./data/afinn.json');
var http = require('http');

// convert all words in string to tokens for comparsion to AFINN
var tokenize = function(input) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9á-úñäâàéèëêïîöôùüûœç\- ]+/g, '')
    .replace('/ {2,}/',' ')
    .split(' ');
};

// main function taking phrase as the argument
var applySentiment = function(id, phrase) {
  // simple check to ensure data is a string
  if (typeof phrase !== 'string') {
    phrase = ''; // set empty string for this phrase
    console.log('Error: Phrase was not a string!');
  }

  // Storage objects
  var tokens      = tokenize(phrase),
      score       = 0,
      words       = [],
      positive    = [],
      negative    = [];

  // check each token/word
  var len = tokens.length;
  while (len--) {
    var obj = tokens[len];
    var item = afinn[obj];
    if (!afinn.hasOwnProperty(obj)) continue;

    words.push(obj);
    if (item > 0) positive.push(obj);
    if (item < 0) negative.push(obj);

    score += item;
  }

  //build the results object
  var result = {
    id :          id,
    score :       score,
    comparative : score / tokens.length,
    tokens :      tokens,
    words :       words,
    positive :    positive,
    negative :    negative
  };

  // append each result object to response array
  responseArray.push(result);

}

// Response array to be sent back to requesting server
var responseArray = [];

var bulkCheck = function (obj) {
  for (tweet in obj) {
    applySentiment(tweet, obj[tweet]);
  }
  console.log(responseArray);
}

// Create HTTP server
http.createServer(function(req, res){

  // our single API route listening on /bulkTweet
  switch(req.url) {

    case '/bulkTweet' :
      // accepting POST requests only
      if (req.method == 'POST') {
        var postData = '';
        req.on('data', function(chunk){
          postData += chunk.toString();
        });
        req.on('end', function(){
          bulkCheck(JSON.parse(postData));
          res.writeHead(200, {'Content-Type': 'application/json'})
          res.end(JSON.stringify(responseArray));
          console.log('[200] ' + req.method + ' to ' + req.url);
        });
      }
      break;

    default :
      res.writeHead(404, 'Not found', {'Content-Type': 'application/json'});
      res.end();
      console.log('[404] ' + req.method + ' to ' + req.url);
  };
}).listen(3000);

console.log('server running on 3000');
