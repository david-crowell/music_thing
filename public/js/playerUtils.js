var DavesMusicThing = DavesMusicThing || {};

$(
    function() {
        
        $("#artist_search").autocomplete(
            {
                'source': getSuggestionsFromSearchbar,
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

function getSuggestionsFromSearchbar(event, callback) {
    var query = $("#artist_search").val();
    getSuggestions(
        callback, 
        function(e){
            callback([]);
        }, 
        query
    );
}

function updatePlayer(spotifyUri) {
    var uri = "http://embed.spotify.com/?uri=" + spotifyUri;
    console.log(uri);
    $("#spotify_widget").get(0).contentWindow.location.replace(uri); 
    //$("#spotify_widget").attr('src', uri);
}

function clearPlayer() {
    $("#spotify_widget").get(0).contentWindow.location.replace("about:blank");  
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
            clearPlayer();
            clearSimilarArtists();
            loadSimilarArtists(query);
            loadPerformances(query);
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
            console.log(e);
            DavesMusicThing.similarArtists = [];
            showSimilarArtists([]);
        },
        query
    );
}

function clearPerformances() {
    $("#performances").find("tr").remove();      
}

function annealWithFiller(parts, filler) {
    var innerHTML = "";
    for (var i = 0; i < parts.length; i++) {
        if (i == parts.length - 1) {
            //is last
            innerHTML = innerHTML + parts[i];
        } else {
            innerHTML = innerHTML + parts[i] + filler;
        }
    };
    return innerHTML;
}

function isLink(string) {
    return string.indexOf('<a ') == 0;
}

function splitOnFirstInstanceOf(string, toMatch) {
    var start = string.indexOf(toMatch);
    var end = start + toMatch.length // 'end' in that it's the first character after the substring
    var first = string.slice(0,start);
    var match = string.slice(start, end);
    var rest = '';
    if (end < string.length) {
        rest = string.slice(end);
    }
    return [first, rest];
}

// treat array of substrings as string
function replaceSubstringInArrayWith(substringArray, toReplace, replaceWith) {    
    for (var i = 0; i < substringArray.length; i++) {
        var substring = substringArray[i];
        if (isLink(substring)) {
            continue;
        }
        if (substring.indexOf(toReplace) != -1) {
            var splits = splitOnFirstInstanceOf(substring, toReplace); //substring.split(toReplace, 1);
            splits = [splits[0], replaceWith, splits[1]];
            var rebuiltSubstringArray = substringArray.slice(0,i).concat(splits);
            if (i < substringArray.length - 1) {
                rebuiltSubstringArray = rebuiltSubstringArray.concat(substringArray.slice(i+1));
            }
            return rebuiltSubstringArray;
        }
    };
    return substringArray;
}

function getPerformerLink(performer) {
    return '<a href="#' + performer.name + '">' + performer.name + '</a>';
}

function addMissedArtists(title, performers) {
    if (performers.length == 0) {return title;}
    title = title + " (with ";
    for (var i = 0; i < performers.length; i++) {
        console.log(performers[i].name);
        title = title + " " + getPerformerLink( performers[i] ) + ",";
    };
    title = title.slice(0,title.length - 1);
    title = title + ")";
    return title;
}

function getPerformanceTitleHtml(performance) {
    var performersWhoDidntGetIn = [];
    var title = performance.title;
    var parts = [title];
    for (var i = 0; i < performance.performers.length; i++) {
        var performer = performance.performers[i];
        var performerLink = getPerformerLink(performer);        

        newParts = replaceSubstringInArrayWith(parts, performer.name, performerLink);
        if (newParts.length === parts.length) {
            performersWhoDidntGetIn.push(performer);
        }
        parts = newParts;
    };
    title = parts.join('');
    title = addMissedArtists(title, performersWhoDidntGetIn);
    return title;
}

function getPerformersHtml(performance) {
    var innerHTML = "<ul>";
    for (var i = 0; i < performance.performers.length; i++) {
        var performer = performance.performers[i];
        innerHTML += '<li><a href="#' + performer.name + '">' + performer.name + '</a></li>';
    };
    innerHTML += "</ul>";
    return innerHTML;
}

function getPerformanceLinkHtml(performance) {
    return '<a href="' + performance.url + '">Info</a>';
}

function setPerformanceHtml(performance, row) {
    var innerHTML =  '' + 
        '<div class="performance">' + 
            '<div class="performance_title">' + getPerformanceTitleHtml(performance) + "</div>" + 
            '<div class="performance_date">' + formatDate(performance.datetime_local) + "</div>" +
            '<div class="performance_venue">' + performance.venue.name + "</div>" +
            '<div class="performance_location">' + performance.venue.city + ", " + performance.venue.state + "</div>" +
            '<div class="performance_link">' + getPerformanceLinkHtml(performance) + "</div>" +
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

function addNearbyPerformances(performances) {
    for (var i = 0; i < performances.length; i++) {
        var performance = performances[i];
        var row = document.getElementById("all_artists_nearby_performances").insertRow(i);
        row.className = "border_bottom";
        setPerformanceHtml(performance, row);
    };
}

function formatDate(dateString) {
    var parsed = Date.parse(dateString);
    return parsed.getDayName() + " " + (parsed.getMonth() + 1) + "/" + parsed.getDate() + "/" + parsed.getFullYear();
}