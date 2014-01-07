
var arDrone = require('ar-drone');
var http    = require('http');

//var pngStream = arDrone.createClient().getPngStream();
var client = arDrone.createClient();
client.disableEmergency();

console.log('Connecting png stream ...');
var pngStream = client.getPngStream();

var lastPng;
pngStream
  .on('error', console.log)
  .on('data', function(pngBuffer) {
    lastPng = pngBuffer;
  });

var server = http.createServer(function(req, res) {
  if (!lastPng) {
    res.writeHead(503);
    res.end('Did not receive any png data yet.');
    return;
  }

  res.writeHead(200, {'Content-Type': 'image/png'});
  res.end(lastPng);
});

server.listen(8081, function() {
  console.log('Serving latest png on port 8080 ...');
  arise();
});

var arise = function() {
  client.takeoff();
  client
    .after(2000, function() {
      console.log("Arise");
      this.up(0.5);
    })
    .after(5000, function() {
      this.stop();
    })
    .after(500, function() {
      patrol();
    });
}

var patrolCorner = function(iter) {
  client
    .after(100, function() {
      console.log("Forwards");
      this.stop();
      this.front(0.5);
    })
    .after(2000, function() {
      console.log("Corner");
      this.stop();
      this.counterClockwise(.75);
      this.stop();
    })
    .after(900, function() {
      if (iter > 0) {
        patrolCorner(iter -1);
      } else {
        returnToBase();
      }
    });
}

var patrol = function() {
  patrolCorner(4);
}

var returnToBase = function() {
  client
    .after(100, function() {
      console.log("Bye");
      this.land();
    })
    .after(5000, function() {
      console.log("Exiting");
      process.exit(0);
    });
}
