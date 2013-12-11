var DavesMusicThing = DavesMusicThing || {};

function getSuggestions(callback, error, query) {	
	console.log(query);  

	var uri = "suggest?q=" + query;

	var xhr = $.ajax( uri )
	.done(
		function (data) {
			console.log(data);    				
			callback(data);
		}
	).fail(
		function (e) {
			alert("FAIL");
			alert(e);
			error(e);
		}
	);
}

function getArtistSpotifyInfo(callback, error, query) {
	var uri = "artist?q=" + query;

	var xhr = $.ajax( uri )
	.done(
		function (data) {
			console.log("Data from spotify call");
			console.log(data);  			
			if (data.length == 0) {
				error("Spotify artist not found");
			} else {
				callback(data);
			}	
		}
	).fail(
		function (e) {			
			error(e);
		}
	);	
}

function getSimilarArtists(callback, error, query) {
	var uri = "similar?q=" + query;

	var xhr = $.ajax( uri )
	.done(
		function (data) {
			console.log(data); 
			if (data.length == 0) {
				error("Similar artists not found");
			} else {
				callback(data);
			}
		}
	).fail(
		function (e) {
			console.log(e);
			error(e);
		}
	);	
}

function getPerformances(callback, error, query) {
    var uri = "events?q=" + query;

    var xhr = $.ajax( uri )
    .done(
        function (data) {
            console.log(data);   
            if (data.length == 0) {
            	error("No performances found");
            } else {
	            callback(data);
	        }
        }
    ).fail(
        function (e) {
            console.log(e);
            error(e);
        }
    );  
}

function getLocalPerformances(callback, error) {
    var uri = "events/local";

    var xhr = $.ajax( uri )
    .done(
        function (data) {
            console.log(data);   
            if (data.length == 0) {
            	error("No performances found");
            } else {
	            callback(data);
	        }
        }
    ).fail(
        function (e) {
            console.log(e);
            error(e);
        }
    );  
}