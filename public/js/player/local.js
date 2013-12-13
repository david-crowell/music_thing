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