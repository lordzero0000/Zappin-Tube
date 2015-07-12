var mongoose = require( 'mongoose' ),
	db_link = 'mongodb://rpi_user:Th15D04SN0tR3s3mbl3S@ds047632.mongolab.com:47632/db_zappin',
	db = mongoose.connect(db_link);

var video_schema = require( '../models/video' ),
	Video = db.model('Video', video_schema);

var request = require('request');
var cheerio = require('cheerio');

exports.index = function (req, res, next) {
	Video.find().sort({_id:-1}).limit(1).exec(gotVideos);

	function gotVideos (err, videos) {
		if (err) {
			console.log(err);
			return next();
		}

		var room = req.query.r;

		if (room === undefined || room === '' || room === null)
		{
			console.log('¡Un nuevo usuario ha entrado!');
			return res.render('inicio', { title: 'Zappin\'-Tube' });
		}else{
			console.log('Un usuario a entrado a la sala ' + room + '.');
			return res.render('index', { title: 'Zappin\'-Tube', videos: videos, room: room });
		}

	}

}

exports.push = function (req, res, next) {
	var url = req.body.url || '';
	var yid, nombre, newUrl;
	if (url === ''){
		console.log('Wey, datos vacios insertados.');
		res.setHeader('content-type', 'application/json');
		return res.send('{ status: "error", error: "Vacio." }');
	}

	yid = getParam('v', url);
	newUrl = "http://www.youtube.com/watch?v=" + yid;

	request(url, function (err, res, body){
		if (err) {
			console.log(err);
			res.setHeader('content-type', 'application/json');
			return res.send('{ status: "error", error: "' + err + '" }');
		}
		$ = cheerio.load(body);
		$('#eow-title').each(function(){
			nombre = $(this).attr('title');
			console.log(nombre);
		});
	});

	var video_data = {
		name: nombre,
		url: newUrl,
		yid: yid
	};

	var inserto = new Video(video_data);

	inserto.save(onSaved);

	function getParam( name, url )
	{
		name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
		var regexS = "[\\?&]"+name+"=([^&#]*)";
		var regex = new RegExp( regexS );
		var results = regex.exec( url );
		if( results == null )
		 return "";
		else
		 return results[1];
	}

	function onSaved(err){

		if (err){
			console.log(err);
			res.setHeader('content-type', 'application/json');
			return res.send('{ status: "error", msg: "' + err + '" }');
		}

		res.header('content-type', 'application/json');
		return res.send('{ status: "success", msg: "Insertado." }');

	}
	//Video.insert( { name: "Hola!", url:  } );
}
