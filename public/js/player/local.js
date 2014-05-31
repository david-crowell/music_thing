$(document).ready( 
    function() {
        if (window.location.hash && window.location.hash !== "#") {
            loadArtistFromHash();
        } else {
            loadPerformances()
        }

        $("#postal_code").keypress(
            function(e) {
                if (e.keyCode === 13) {
                    setPostalCode();                        
                }
            }
        );
    }
);

function setPostalCode() {
    loadPerformances(null);
}

function loadPerformances(query) {
    var postal_code = $("#postal_code").val();

    getLocalPerformances(
        function(performances) {
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
            DavesMusicThing.performances = [];
            showPerformances([]);
        },
        postal_code        
    );
}

function showPerformances(performances) {
    clearPerformances();
    addNearbyPerformances(performances);
}

function setTwoColumnPerformanceHtml(performance, row) {
    var innerHTML =  '' + 
        '<div class="performance">' + 
            '<div class="performance_info">' +
                '<div class="performance_title">' + performance.title + "</div>" + 
                '<div class="performance_date">' + formatDate(performance.datetime_local) + "</div>" +
                '<div class="performance_venue">' + performance.venue.name + "</div>" +
                '<div class="performance_location">' + performance.venue.city + ", " + performance.venue.state + "</div>" +
                '<div class="performance_link">' + getPerformanceLinkHtml(performance) + "</div>" +
            '</div>' + 
            '<div class="performance_artists">' +
                getPerformersHtml(performance) +
            '</div>' +
        '</div>';
    var cell = row.insertCell(0);
    cell.innerHTML = innerHTML;
    return;
}

function updatePlayer(artistName, spotifyUri) {
    var uri = "http://embed.spotify.com/?uri=" + spotifyUri;
    $("#spotify_widget").get(0).contentWindow.location.replace(uri); 
    getPredictedSetlist(
        function (setlist){
            setPredictedSetlist(setlist, artistName);
        },
        function(e){
            console.log(e);
        },
        artistName
    );
    //$("#spotify_widget").attr('src', uri);
}

function setPredictedSetlist(setlist, artistName) {
    var uri = "http://embed.spotify.com/?uri=spotify:trackset:" + artistName + " Setlist:";
    for (var i = 0; i < setlist.length; i++) {
        var song = setlist[i];
        if (song.onSpotify == false) continue;
        
        var spotifyId = song.spotifyUri.split(':').pop();
        uri += spotifyId;

        if (i <= setlist.length - 2) {
            // it's not the last one
            uri += ",";
        }
    };
    $("#setlist_spotify_widget").get(0).contentWindow.location.replace(uri); 
}

function clearPlayer() {
    $("#spotify_widget").get(0).contentWindow.location.replace("about:blank");  
    $("#setlist_spotify_widget").get(0).contentWindow.location.replace("html/defaultSpotifyWidget.html"); 
    console.log($("#setlist_spotify_widget").get(0).contentWindow.location);
}