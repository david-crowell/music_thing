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

function setPerformanceHtml(performance, row) {
    //var result =  '<tr class="border_bottom"><td><div class="performance">' + 
    var innerHTML =  '<div class="performance">' + 
        performance.title + "<br />" + 
        formatDate(performance.datetime_local) + "<br />" +
        performance.venue.city + ", " + performance.venue.state + "<br />" +
        getPerformanceLinkHtml(performance) +
        '</div>';
    var cell = row.insertCell(0);
    cell.innerHTML = innerHTML;
    return;
}