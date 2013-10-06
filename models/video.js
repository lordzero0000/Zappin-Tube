var Schema = require( 'mongoose' ).Schema;

var video_schema = new Schema({
	name: String,
	url: String,
	yid: String
});

var Video = module.exports = video_schema;