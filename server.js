// var http = require('http');

// var server = http.createServer();

// server.on('request', function(request,response){
//     console.log('Connection established');
//     console.log(request.method);
//     response.end("Responce is configured", "utf8", () => {console.log('finish'); });
// })

// server.listen(3000);

// server.on('listening', function(){
//     console.log('Server running on port 3000');
// })
var express = require("express");
var app = express();
var router = require('./route');


app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use('/',router.route);

app.listen(3000, function(){
    console.log('server start on port 3000')
}) 