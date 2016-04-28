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
var getSentiment = function(id, phrase) {
  // simple check to ensure data is a string
  if (typeof phrase !== 'string') {
    phrase = ''; // set empty string for this phrase
    throw new Error('Error: Phrase was not a string!');
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
    var token = tokens[len];
    var tokenRating = afinn[token];
    if (!afinn.hasOwnProperty(token)) continue;

    words.push(obj);
    if (tokenRating > 0) positive.push(token);
    if (tokenRating < 0) negative.push(token);

    score += tokenRating;
  }

  // build the results object
  var result = {
    id :          id,
    score :       score,
    comparative : score / tokens.length,
    tokens :      tokens,
    words :       words,
    positive :    positive,
    negative :    negative
  };

  return result;
}

var calculateSentiments = function (obj) {
  var results = [];
  for (tweet in obj) {
    result.push(getSentiment(tweet, obj[tweet]));
  }
  console.log(results);
  return results;
}

// Create HTTP server
http.createServer(function(req, res){

  // single API route listening on /bulkTweet
  switch(req.url) {

    case '/bulkTweet' :
      // accepting POST requests only
      if (req.method == 'POST') {
        var postData = '';
        req.on('data', function(chunk){
          postData += chunk.toString();
        });
        req.on('end', function(){
          res.writeHead(200, {'Content-Type': 'application/json'})
          res.end(JSON.stringify(calculateSentiments(JSON.parse(postData))));
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
