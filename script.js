var runAutomatic = false;
var suppressUpdate = false;
function initialize() {
    var sv = new google.maps.StreetViewService();
    var start = {
        lat: 51.5234932,
        lng: -0.1354476
    };
    var map = new google.maps.Map(document.getElementById('map'),{
        center: start,
        zoom: 14
    });
    panorama = new google.maps.StreetViewPanorama(document.getElementById('pano'),{
        position: start,
        pov: {
            heading: 0,
            pitch: 0
        }
    });
    map.setStreetView(panorama);
    var update = function() {
        if (suppressUpdate && runAutomatic)
            return;
        suppressUpdate = true;
        panoid = panorama.getPano();
        if (seen[panoid]) {
            console.log("seen " + panoid);
            nextTodo(false);
            return;
        }
        seen[panoid] = 1;
        console.log("update on " + panoid);
        document.getElementById('panoid').innerHTML = "id: " + (panoid ? panoid : "move pegman first");
        if (panorama.location) {
            document.getElementById('panolat').innerHTML = "lat/long: " + panorama.location.latLng.lat() + "," + panorama.location.latLng.lng();
        } else {
            $("#panlat").empty();
            $("#heading").empty();
        }
        parameters = null ;
        getExact(panoid, function(v) {
            if (v)
                document.getElementById('full').innerHTML = "lat_long_height?_roty_rotx?_rotz?: " + v.join("_");
            parameters = v;
            if (v && runAutomatic) {
                var latLongKey = toLatLongKey(parameters);
                if (!seen[latLongKey]) {
                    seen[latLongKey] = 1;
                    if (parameters[0] >= minLat && parameters[0] <= maxLat && parameters[1] >= minLong && parameters[1] <= maxLong) {
                        addTodo(panorama.getLinks());
                        process();
                    } else
                        nextTodo(false);
                } else
                    nextTodo(false);
            } else
                nextTodo(false);
        });
    }
    //    google.maps.event.addListener(panorama, "visible_changed", update);
    google.maps.event.addListener(panorama, "position_changed", update);
}
function toLatLongKey(parameters) {
    return parameters[1] + "," + parameters[0]
}
var seen = {}
  , todo = {}
function addTodo(links) {
    var c = 0;
    for (var i in links) {
        // stash links for future processing
        var p = links[i].pano;
        if (!seen[p]) {
            todo[p] = 1;
            c = c + 1;
        }
    }
    console.log("added " + c + " from " + links.length);
}
function nextTodo(delay) {
    var remaining = Object.keys(todo).length;
    console.log("remaining size " + remaining);
    $("#togo").html("togo: " + remaining);
    if (remaining == 0) {
        //         alert("all done");
        return;
    }
    var repeat = false;
    do {
        var key = Object.keys(todo)[0];
        var value = todo[key];
        delete (todo[key]);
        if (seen[key])
            repeat = true;
        else {
            repeat = false;
            setTimeout(function() {
                if (key.indexOf(",") > -1)
                    // lat/long
                    panorama.setPosition({
                        lat: value[0],
                        lng: value[1]
                    });
                else
                    // is a panorama id
                    panorama.setPano(key);
                suppressUpdate = false;
            }, delay ? 2000 : 0);
        }
    } while (repeat);
}
var minLat, maxLat, minLong, maxLong;
function bulk() {
    var lat1 = parseFloat($("#lat1").val())
      , long1 = parseFloat($("#long1").val())
      , lat2 = parseFloat($("#lat2").val())
      , long2 = parseFloat($("#long2").val());
    // beware the meridian
    minLong = Math.min(long1, long2);
    maxLong = Math.max(long1, long2);
    minLat = Math.min(lat1, lat2);
    maxLat = Math.max(lat1, lat2);
    var step = 0.0001;
    for (var x = minLong; x <= maxLong; x += step)
        for (var y = minLat; y <= maxLat; y += step)
            todo[toLatLongKey([y, x])] = [y, x];
    suppressUpdate = false;
    panorama.setPosition({
        lat: lat1,
        lng: long1
    });
}
var lastExactId, lastExactResult;
function getExact(id, ondone) {
    if (id == lastExactId) {
        ondone(lastExactResult);
        return;
    }
    lastExactId = id;
    var xhttp = new XMLHttpRequest();
    // extract the exact GPS, height & orientation info
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
            if (this.responseText.length > 100 && this.responseText.indexOf("googleusercontent") == -1 && this.status == 200) {
                // reference to user photo: ignore these as they are often inside...
                var myRegexp = /\[\[null,null,([^\"]*)/;
                var match = myRegexp.exec(this.responseText);
                if (match) {
                    //                 console.log("::"+match[1]+"::");
                    var strs = match[1].split(/[,\[\]]+/);
                    ondone(lastExactResult = strs.map(parseFloat).filter(function(x) {
                        return !isNaN(x);
                    }));
                }
            } else
                ondone.call();
        }
    }
    xhttp.open("GET", "https://maps.googleapis.com/maps/api/js/GeoPhotoService.GetMetadata?pb=!1m5!1sapiv3!5sUS!11m2!1m1!1b0!2m1!1sen!3m3!1m2!1e2!2s" + id + "!4m10!1e1!1e2!1e3!1e4!1e8!1e6!5m1!1e2!6m1!1e2&callback=_xdc_._misdlu", true);
    xhttp.send();
}
PANO_X = 13312;
PANO_Y = 6656;
TILE = 512;
function process() {
    console.log("process started");
    if (!parameters) {
        alert("didn't find parameters. cors? network issue? try moving the yellow man a bit.");
        return;
    }
    $("#images").empty();
    canvas = document.createElement("canvas");
    // $('<canvas/>', { id: 'canvas', height: 614, width: 1280}).get()[0];
    var resolution = parseFloat($("#resolution option:selected").text());
    $(canvas).attr("id", "canvas");
    $(canvas).attr("width", PANO_X * resolution);
    $(canvas).attr("clientWidth", PANO_X * resolution);
    $(canvas).attr("height", PANO_Y * resolution);
    $(canvas).attr("clientHeight", PANO_Y * resolution);
    $("#images").append(canvas);
    count = 26 * 13;
    for (var x = 0; x <= 25; x++)
        for (var y = 0; y <= 12; y++) {
            create(panoid, x, y, resolution);
            //             count--;
        }
}
function create(panoid, x, y, resolution) {
    var img = new Image();
    document.createElement("img");
    img.onload = function() {
        count--;
        console.log("..." + count);
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, x * TILE * resolution, y * TILE * resolution, TILE * resolution, TILE * resolution);
        if (count == 0) {
            saveCanvas();
            nextTodo(true);
        }
    }
    img.src = "http://cbk0.google.com/cbk?output=tile&panoid=" + panoid + "&zoom=5&x=" + x + "&y=" + y;
}
function setCoords(a, b) {
    $("#" + a).val(parameters[0]);
    $("#" + b).val(parameters[1]);
}
function reset(bulk) {
    runAutomatic = bulk;
    todo = {};
    seen = {};
}
function saveCanvas() {
    if ($('#saveByDownload').get()[0].checked) {

        console.log("download canvas");
            if (chrome.downloads)
                chrome.downloads.download({
                    url: $("#canvas").get()[0].toDataURL("image/jpeg", 1.0),
                    filename: parameters ? parameters.join("_") + ".jpg" : "unknown.jpg"// Optional
                });
    } else {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                console.log("done");
            }
        }
        xhttp.open("POST", "http://localhost:8080/save");
        xhttp.send(JSON.stringify({
            filename: parameters ? parameters.join("_") + ".jpg" : "unknown.jpg",
            data: canvas.toDataURL("image/jpeg")
        }));
    }
}

$(function() {
//     $("#write").click(function() {
//         var xhttp = new XMLHttpRequest();
//         xhttp.onreadystatechange = function() {
//             if (this.readyState == 4 && this.status == 200) {
//                 console.log("done");
//             }
//         }
//         xhttp.open("POST", "http://localhost:8080/save", true);
//         xhttp.send(JSON.stringify({
//             filename: parameters ? parameters.join("_") + ".jpg" : "unknown.jpg",
//             data: canvas.toDataURL("image/jpeg")
//         }));
//     });
    $("#process").click(function() {
        reset(false);
        process();
    });
    $("#set1").click(function() {
        setCoords("lat1", "long1");
    });
    $("#set2").click(function() {
        setCoords("lat2", "long2");
    });
    $("#bulk").click(function() {
        reset(true);
        bulk();
    });
})
