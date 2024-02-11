(function () {
  var OSMRequests = {};

  OSMRequests.sendOverpassRequest = function (
    selectedKey,
    selectedValue,
    polygonCoordinates,
    drawnPolygon
  ) {
    // Construction of the query

    const overpassQuery = `[out:json];
    (
      node["${selectedKey}"="${selectedValue}"](${polygonCoordinates});
      way["${selectedKey}"="${selectedValue}"](${polygonCoordinates});
      rel["${selectedKey}"="${selectedValue}"](${polygonCoordinates});
    );
    out;`;
    // Send the query to API Overpass
    fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: overpassQuery,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Response from Overpass API:", data);
        addDataToMap(data, drawnPolygon);
      })
      .catch((error) => {
        console.error("Error sending Overpass request:", error);
      });
  };

  function addDataToMap(data, drawnPolygon) {
    if (data.elements.length > 0) {
      data.elements.forEach(function (element) {
        switch (element.type) {
          case "node":
            // Create point for each node
            var latlng = L.latLng(element.lat, element.lon);
            if (pointInPolygon(latlng, drawnPolygon)) {
              var marker = L.marker(latlng).addTo(map);
              if (element.tags) {
                var popupContent = "<b>Informations:</b><br>";
                for (var key in element.tags) {
                  popupContent += key + ": " + element.tags[key] + "<br>";
                }
                marker.bindPopup(popupContent);
              }
            }
            break;
        }
      });
    } else {
      console.log("No elements found in the Overpass API response.");
    }
  }

  // Check if point inside polygon
  function pointInPolygon(latlng, drawnPolygon) {
    var lat = latlng.lat;
    var lng = latlng.lng;
    var inside = false;
    for (
      var i = 0, j = drawnPolygon.length - 1;
      i < drawnPolygon.length;
      j = i++
    ) {
      var xi = drawnPolygon[i].lat,
        yi = drawnPolygon[i].lng;
      var xj = drawnPolygon[j].lat,
        yj = drawnPolygon[j].lng;

      var intersect =
        yi > lng != yj > lng && lat < ((xj - xi) * (lng - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  }

  window.OSMRequests = OSMRequests;
})();
