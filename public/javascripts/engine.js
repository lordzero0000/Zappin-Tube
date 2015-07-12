$(document).ready(function () {

	var socket = io.connect(window.location.href);
	var room = getURLParameter('r');
	$('#chatBox').focus();
	if (room !== "")
	{
		socket.emit('suscribe', { room: room });
	}

	$(window).unload(function() {
		console.log('Saliendo...');
		socket.emit('unsuscribe', { room: room });
	});

	$('#zapping').submit(function(e) {
		// Enviamos el formulario usando AJAX

		e.preventDefault();
		$('#urlBox').blur();

		var url = $('#urlBox').val(), yid, newUrl;

		if (url === "")
		{
			$.msgBox({
			    title:"Error de URL.",
			    content:"El campo esta vacio. :("
			});
			$('#urlBox').val('');
			return false;
		}

		yid = getParam( "v", url );
		newUrl = "http://www.youtube.com/watch?v=" + yid;

		if (yid === "")
		{
			$.msgBox({
			    title:"Error de URL.",
			    content:"Copia una URL valida de YouTube.",
			    type:"error"
			});
			$('#urlBox').val('');
			return false;
		}

		$.ajax({
			type: 'POST',
			url: $(this).attr('action'),
			data: $(this).serialize(),
			beforeSend: function (objeto){
				$('#urlBox').val('');
				$('#loader').show();
			}, complete: function (res) {
				$('#video').html(htmlYT(yid));
				$('#liga').html(ligaYT(newUrl));
				$('#loader').hide();
				socket.emit('sendVideo', { room: room, video: yid });
			}
		});

	});

	socket.on('video', function (data) {
        if(data.video) {
        	var longed = "http://www.youtube.com/watch?v=" + data.video;
            $('#video').html(htmlYT(data.video));
			$('#liga').html(ligaYT(longed));
        } else {
            console.log("There is a problem: ", data); // Por si alguien quere ver el log.
        }
    });

	socket.on('message', function (data) {
        if(data.message) {
        	if (data.user === undefined)
        	{
        		$('#messages').append('<p>' + data.message + '</p>');
        	}else{
        		$('#messages').append('<p><strong>' + data.user + ':</strong> ' + data.message + '</p>');
        	}
            $("#messages").scrollTop($("#messages")[0].scrollHeight);
        } else {
            console.log("There is a problem: ", data); // Por si alguien quere ver el log.
        }
    });

	function htmlYT (id) { // Esta función es para crear el html code del video.
		var html = "";
		html += '<object width="640" height="390">';
		html += '<param name="movie" value="https://www.youtube.com/v/' + id + '?version=3&amp;autoplay=1&amp;loop=1&amp;showinfo=1&amp;hide=1&amp;disablekb=1&amp;controls=0&amp;rel=0"></param>'
		html += '<param name="allowScriptAccess" value="always"></param>';
		html += '<embed src="https://www.youtube.com/v/' + id + '?version=3&amp;autoplay=1&amp;loop=1&amp;showinfo=1&amp;hide=1&amp;disablekb=1&amp;controls=0&amp;rel=0" type="application/x-shockwave-flash" allowScriptAccess="always" width="640" height="390"></embed>';
		html += '</object>';
		return html;
	}

	function ligaYT (link) {
		var url = '<a href="' + link + '" target="_blank" class="min">' + link + '</a>';
		return url;
	}

	function ytUrl (url) {

		var longed = "http://www.youtube.com/watch?v=";
		var shorted = "http://youtu.be/";

		var urlong = url.substring(0, longed.length);
		var urlshort = url.substring(0, shorted.length);

		console.log(urlong + " " + urlshort);

		if (urlong == longed || urlshort == shorted)
		{
			return true;
		}else{
			return false;
		}

	}

	function getParam( name, url ) // Esta función se encarga de sacar la id del video de la liga dada.
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

	function getURLParameter(name) {
	    return decodeURI(
	        (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
	    );
	}

	$('#chating').submit(function(e) {

		e.preventDefault();
		var msg = $('#chatBox').val();
		var user = $('#nameBox').val();
		if (msg.length > 140)
		{
			$('#chatBox').val('');
			$.msgBox({
			    title:"Error de Texto.",
			    content:"No puede enviar mensajes con mas de 140 caracteres.",
			    type:"error"
			});
		}else{
			$('#chatBox').val('');
			socket.emit('sendMsg', { room: room, message: msg, user: user });
		}

	});

	$('#userName').submit(function(e){

		e.preventDefault();
		$.msgBox({ type: "prompt",
		    title: "Nombre.",
		    inputs: [
		    { header: "Nombre: ", type: "text", name: "userName" } ],
		    buttons: [
		    { value: "Ok" }],
		    success: function (result, values) {
		        $(values).each(function (index, input) {
		        	if (input.value.length > 20){
		        		return false;
		        	}else if (input.value === ""){
		        		return false;
		        	}else{
		        		var oldName = $('#nameBox').val();
		        		$('#nameBox').val(input.value);
		        		var newMsg = '<strong>' + oldName + '</strong> se ha cambiado el nombre a <strong>' + input.value + '</strong>.';
		        		socket.emit('nameChanged', { room: room, message: newMsg });
		        	}
		        });
		        $('#chatBox').focus();
		    }
		});
	});

	$('#generate').submit(function(e) {
		// Enviamos el formulario usando AJAX

		e.preventDefault();
		$('#urlBox').blur();

		var sala = $('#urlBox').val();

		if (sala === '')
		{
			var room = Math.floor((Math.random()*999999)+1);
		}else{
			var room = sala;
		}

		window.location.replace("/?r=" + room);

	});

});
