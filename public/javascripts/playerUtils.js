var DavesMusicThing = {};

$(
	function() {
	    
	    $("#artist_search").autocomplete(
	    	{
	    		'source': getSuggestions,
	    		'select': menuUsedForSelection
	    	}
	    ).keypress(
	    	function(e) {
	    		if (e.keyCode === 13) {
	    			enterUsedForSelection();		    			
		    	}
		    }
		);
	}
);

$(document).ready( 
    function() {
        if (window.location.hash && window.location.hash !== "#") {
            loadArtistFromHash();
        } else {
            enterUsedForSelection();        
        }
    }
);

$(window).on('hashchange', function() {
    $("#artist_search").autocomplete("close");
    loadArtistFromHash();
});

function loadArtistFromHash() {
    var hash = window.location.hash;
    if (!hash || hash === "#") {
        return;
    }
    if (hash.charAt(0) === '#') {
        hash = hash.substring(1,hash.length);
    }
    $("#artist_search").val(hash);
    console.log(hash);
    loadArtist(hash);
}

//search

function getSuggestions(event, callback) {
	var query = $("#artist_search").val();
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
			callback([]);
		}
	);
}

function getArtistSpotifyInfo(callback, error, query) {
	var uri = "artist?q=" + query;

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
			callback([]);
		}
	);	
}

function getSimilarArtists(callback, error, query) {
	var uri = "similar?q=" + query;

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
			callback([]);
		}
	);	
}

function getPerformances(callback, error, query) {
    var uri = "events?q=" + query;

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
            callback([]);
        }
    );  
}

function updatePlayer(spotifyUri) {
	var uri = "http://embed.spotify.com/?uri=" + spotifyUri;
	console.log(uri);
    $("#spotify_widget").get(0).contentWindow.location.replace(uri); 
	//$("#spotify_widget").attr('src', uri);
}

function matchArtist(query, artists) {
	var bestGuess = artists[0];
	for (var i = artists.length - 1; i >= 0; i--) {
		if (artists[i].name === query) {
			bestGuess = artists[i];
		}
	};
	return bestGuess;
}

function loadArtist(query) {
	getArtistSpotifyInfo (    	
		function (artists) {
			console.log(artists);
			var artist = matchArtist(query, artists);
			var artistUri = artist.href;
			console.log(artistUri);
			updatePlayer(artistUri);
			clearSimilarArtists();
			loadSimilarArtists(artist.name);
            loadPerformances(artist.name);
		},
		function(e) {
			console.log(e);
			alrert(e);
		},
		query
	);
}

function useSelection(query) {
	console.log("Got to USE SELECTION");
	console.log(query);
	//loadArtist(query);
    window.location.hash = '#' + query;
}

function menuUsedForSelection(event, ui) {
	var query = ui.item.value;
	console.log(query);
	useSelection(query);
}

function enterUsedForSelection() {
	var query = $("#artist_search").val();
	//$("#artist_search").autocomplete("close");    	
	useSelection(query);
}

function makeSelection(query) {
	$("#artist_search").val(query);
	useSelection(query);
}

function clearSimilarArtists() {
	$("#similar_artists").find("tr").remove(); 		
}

function artistHasSpotifyListings(artist) {
    if (!("foreign_ids" in artist )) return false;
    for (var i = 0; i < artist.foreign_ids.length; i++) {
        if (artist.foreign_ids[i].catalog === "spotify-WW") return true;
    };
    return false;
}

function getSimilarArtistsPlayButtonHtml(artist) {
    if (artistHasSpotifyListings(artist)) {
        //return '<a href="#" onclick="javascript:makeSelection(' + "'" + artist.name + "'" + '); return false;">Play</a>';
        return '<a href="#' + artist.name + '">Play</a>';
    } else {
        //return '<a href="#" onclick="javascript:makeSelection(' + "'" + artist.name + "'" + '); return false;">Show</a>';
        return '<a href="#' + artist.name + '">Show</a>';
    }
}

function getSimilarArtistsHtml(artist) {
	return '<tr class="border_bottom"><td>' + artist.name + '</td><td>' + getSimilarArtistsPlayButtonHtml(artist) + '</td></tr>';
}

function showSimilarArtists(artists) {
	clearSimilarArtists();
	var totalHtml = "";
	for (var i = 0; i < artists.length; i++) {
		var artist = artists[i];    		
        artist.similarArtistIndex = i;
		totalHtml += getSimilarArtistsHtml(artist);
	};
	$("#similar_artists > tbody:last").after(totalHtml);
}

function loadSimilarArtists(query) {
	getSimilarArtists(
		function(artists) {
            DavesMusicThing.similarArtists = artists;
            for (var i = 0; i < artists.length; i++) {
                artists[i].similarArtistIndex = i;            
            };
			console.log(artists);
			showSimilarArtists(artists);
		},
		function(e) {
			console.log("oops");
		},
		query
	);
}

function clearPerformances() {
    $("#performances").find("tr").remove();      
}

function getPerformanceLinkHtml(performance) {
    return '<a href="' + performance.url + '">Info</a>';
}

function setPerformanceHtml(performance, row) {
    //var result =  '<tr class="border_bottom"><td><div class="performance">' + 
    var innerHTML =  '<div class="performance">' + 
        performance.title + "<br />" + 
        performance.datetime_local + "<br />" +
        performance.venue.city + ", " + performance.venue.state + "<br />" +
        getPerformanceLinkHtml(performance) +
        '</div>';
    var cell = row.insertCell(0);
    cell.innerHTML = innerHTML;
    return;
}

function addSameArtistNearbyPerformances(performances) {
    var nearbyPerformances = performances.sameArtistNearbyPerformances;
    for (var i = 0; i < nearbyPerformances.length; i++) {
        var performance = nearbyPerformances[i];
        var row = document.getElementById("same_artist_nearby_performances").insertRow(i);
        row.className = "border_bottom";
        setPerformanceHtml(performance, row);
    };
    //document.getElementById("same_artist_nearby_performances").insertRow(-1).insertCell(0).innerHTML = " ";
}

function addSameArtistAllPerformances(performances) {
    var allPerformances = performances.sameArtistAllPerformances;
    for (var i = 0; i < allPerformances.length; i++) {
        var performance = allPerformances[i];
        var row = document.getElementById("same_artist_all_performances").insertRow(i);
        row.className = "border_bottom";
        setPerformanceHtml(performance, row);
    };
}

function showPerformances(performances) {
    clearPerformances();
    var totalHtml = "";
    //sameArtistAllPerformances
    /*
    for (var i = 0; i < performances.length; i++) {
        var performance = performances[i];            
        totalHtml += getPerformanceHtml(performance);
    };
    $("#performances > tbody:last").after(totalHtml);
    */
    addSameArtistNearbyPerformances(performances);
    addSameArtistAllPerformances(performances);
}

function loadPerformances(query) {
    getPerformances(
        function(performances) {
            console.log("GOT PERFORMANCES");
            console.log(performances);
            DavesMusicThing.performances = performances;
            /*
            for (var i = 0; i < performances.length; i++) {
                performances[i].performanceIndex = i;            
            };
            console.log(performances);
            */
            showPerformances(performances);
        },
        function(e) {
            console.log("oops");
        },
        query
    );
}