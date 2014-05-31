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

function getLocalPerformances(callback, error, postal_code) {
    var uri = "events/local";
    if (postal_code) {
    	uri = uri + "?postal_code=" + postal_code;
    }

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

function getPredictedSetlist(callback, error, artistName) {
	if (artistName == null) { return; }
	var uri = "setlist?artistName=" + artistName;

	var xhr = $.ajax( uri )
    .done(
        function (setlist) {
            console.log(setlist);   
            if (setlist == null || setlist.length == 0) {
            	error("No setlist found");
            } else {
	            callback(setlist);
	        }
        }
    ).fail(
        function (e) {
            console.log(e);
            error(e);
        }
    ); 
}