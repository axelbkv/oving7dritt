var express = require('express');
var app = express();

//This resource makes it possible to download and start the Angular client
app.use(express.static(__dirname + "/../client"));

//Start the web server
//Open for instance http://localhost:3000 in a web browser
var server = app.listen(3000, () => {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Example app listening at http://%s:%s', host, port);
});
