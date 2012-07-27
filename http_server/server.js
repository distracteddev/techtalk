var http = require('http')
  , colors = require('colors')
  , fs = require('fs')
  , request = require('request');

var server = new http.Server();

server.on('request', function(request, response) {
  // Tell us what URL has been requested along with the method
  console.log(request.method.white, ' ',request.url.blue)
  // Match the URL to a route handler in our router object. Lets support RegEx for fun..
  for (route in router) {
    var url = request.url, FOUND
    // Append a $ so that the RegEx terminates by default
    var re = new RegExp(route + "$")
    var match = url.match(re)
    // if the RegEx matches, call the request handler with the request and response objects
    if (re.test(url)) {
      console.log("Found a Route Handler for ", match, re.test(url));
      response.writeHead(200);
      // Call the route associated with this RegEx and pass through the matched
      // URL parameter as defined by the RegEx
      router[route](request, response, match[1]);
      FOUND = true;
    }
  }

  if (!FOUND) {
    // The requested route was not found
    response.writeHead(404);
    response.end('Error: 404 - '.red + http.STATUS_CODES[404].red + '\n');
  }

});


// Lets create some route handlers
function index(req, res) {
  res.writeHead(200);
  res.end("JavaScript is fun so node is fun.\n".green);
}

function home(req, res, param) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write("Node is built on cloud optimized unicorns and rainbows.\n".green);
  res.end(("Extension Provided: " + param + "\n").blue)
}

function page(req, res) {
  fs.readFile('page.html', 'utf8', function(err, page) {
    if (err) {
      res.writeHead(404);
      res.end('File not found\n'.red);
    } else {
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.end(page);
    }
  });
}

function stream_page(req, res) {
  // Get a readable stream of data from our file system.
  var readStream = fs.createReadStream('page.html', {encoding: 'utf8'});
  // When that stream emits a data event, write the data to our response
  readStream.on('data', function(data) {
    res.write(data);
  });

  // When we are finished reading the stream, send the response with the
  // correct header
  readStream.on('end', function() {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end();
  });

  // If we get an error while processing the read stream, end the response
  // with a 404.
  readStream.on('error', function(err) {
    res.writeHead(404);
    res.end('File not found\n'.red);
  });

}

var router = {
  '/': index,
  '/home(.+)': home,
  '/page.html': page
}


server.listen(2000);
console.log("HTTP Server Listening on Port 2000".green);
