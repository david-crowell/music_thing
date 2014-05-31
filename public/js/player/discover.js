$(document).ready( 
    function() {
        if (window.location.hash && window.location.hash !== "#") {
            loadArtistFromHash();
        } else {
            enterUsedForSelection();        
        }
    }
);

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
            DavesMusicThing.performances = [];
            showPerformances([]);
        },
        query
    );
}

function showPerformances(performances) {
    clearPerformances();    
    addSameArtistNearbyPerformances(performances);
    addSameArtistAllPerformances(performances);
}

function updatePlayer(artistName, spotifyUri) {
    var uri = "http://embed.spotify.com/?uri=" + spotifyUri;
    console.log(uri);
    $("#spotify_widget").get(0).contentWindow.location.replace(uri); 
    //$("#spotify_widget").attr('src', uri);
}

function clearPlayer() {
    $("#spotify_widget").get(0).contentWindow.location.replace("about:blank");  
}