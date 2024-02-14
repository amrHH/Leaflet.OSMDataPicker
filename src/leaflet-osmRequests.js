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
    out geom;`;
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
        console.log(element.type);
        switch (element.type) {
          case "node":
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
          case "way":
            var latlngs = [];
            element.geometry.forEach(function (node) {
              latlngs.push(L.latLng(node.lat, node.lon));
            });
            // Check if way is polygon or polyline
            var isPolygon =
              latlngs.length > 1 &&
              latlngs[0].equals(latlngs[latlngs.length - 1]);

            if (isPolygon) {
              var polygon = L.polygon(latlngs).addTo(map);
              if (element.tags) {
                var popupContent = "<b>Informations:</b><br>";
                for (var key in element.tags) {
                  popupContent += key + ": " + element.tags[key] + "<br>";
                }
                polygon.bindPopup(popupContent);
              }
            } else {
              var polyline = L.polyline(latlngs).addTo(map);
              if (element.tags) {
                var popupContent = "<b>Informations:</b><br>";
                for (var key in element.tags) {
                  popupContent += key + ": " + element.tags[key] + "<br>";
                }
                polyline.bindPopup(popupContent);
              }
            }
            break;

          case "relation":
            if (element.members) {
              var allLatlngs = [];
              element.members.forEach(function (member) {
                if (member.geometry) {
                  var memberLatlngs = [];
                  member.geometry.forEach(function (node) {
                    memberLatlngs.push(L.latLng(node.lat, node.lon));
                  });
                  allLatlngs = allLatlngs.concat(memberLatlngs);
                }
              });
              if (allLatlngs.length > 0) {
                var polygon = L.polygon(allLatlngs).addTo(map);
                if (element.tags) {
                  var popupContent = "<b>Informations:</b><br>";
                  for (var key in element.tags) {
                    popupContent += key + ": " + element.tags[key] + "<br>";
                  }
                  polygon.bindPopup(popupContent);
                }
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
