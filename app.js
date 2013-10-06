
/**
 * Module dependencies.
 */

var express = require('express');
//var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var port = 80;
var app = express();

// Base de datos.

var request = require('request');
var cheerio = require('cheerio');
	
// Base de datos y Scrapping (Aunque no veo la necesidad de usarlo ya...)
// Quitar scrapping en la siguiente versión.

// Agregados
var video = require( './controllers/video' )

// all environments
app.set('port', process.env.PORT || 80);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//app.get('/', routes.index); No vamos a usar routes, se usará controllers :P
app.get('/', video.index);
app.post('/insert', video.push);
//app.get('/about', video.about);
app.get('/users', user.list);

var io = require('socket.io').listen(app.listen(port));
console.log('Estamos en vivo desde el puerto ' + app.get('port') + ' de su PC!');

io.sockets.on('connection', function (socket) {
    //socket.emit('message', { message: 'io-t-bUkfY8' });
    socket.on('sendVideo', function (data) {
        //io.sockets.emit('video', data);
        io.sockets.in(data.room).emit('video', data);
    });

    socket.on('sendMsg', function (data) {
    	console.log('Se ha recibido un mensaje: ' + data.message + ' en la sala ' + data.room + '.');
    	io.sockets.in(data.room).emit('message', data);
    });

    socket.on('nameChanged', function (data) {
    	console.log(data.message);
    	io.sockets.in(data.room).emit('message', data);
    });

    socket.on('suscribe', function (data) {
    	console.log('Usuario conectado en la sala ' + data.room);
    	data.message = 'Un invocador ha entrado al juego.';
    	io.sockets.in(data.room).emit('message', data);
    	socket.join(data.room); // Se supone que aquí nos unimos a la room.
    });

    socket.on('unsuscribe', function (data) {
    	console.log('Un usuario se ha desconectado.');
    	data.message = 'Un invocador se ha desconectado.';
    	io.sockets.in(data.room).emit('message', data);
    	socket.leave(data.room); // Aquí nos salimos de la room dada.
    });

});

/*
http.createServer(app).listen(app.get('port'), function(){
  console.log('Estamos en vivo desde el puerto ' + app.get('port') + ' de su PC!');
});
*/