$(document).ready( 
    function() {
        if (window.location.hash && window.location.hash !== "#") {
            loadArtistFromHash();
        } else {
            loadPerformances()
        }
    }
);

function loadPerformances(query) {
    getLocalPerformances(
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
        }        
    );
}

function showPerformances(performances) {
    clearPerformances();
    addNearbyPerformances(performances);
}

function setPerformanceHtml(performance, row) {
    var innerHTML =  '<div class="performance">' + 
        getPerformanceTitleHtml(performance) + "<br />" + 
        //getPerformersHtml(performance) + "<br />" +
        formatDate(performance.datetime_local) + "<br />" +
        performance.venue.city + ", " + performance.venue.state + "<br />" +
        getPerformanceLinkHtml(performance) +
        '</div>';
    var cell = row.insertCell(0);
    cell.innerHTML = innerHTML;
    return;
}