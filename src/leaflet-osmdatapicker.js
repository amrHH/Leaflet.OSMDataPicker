/*
 * leaflet.osmdatapicker
 * (c) Amr HAMADEH; MIT License
 */
(function (L) {
  var OSMDataPicker = {};
  var drawnPolygon = [];
  var buttonClicked = false;
  var OSMRequests = {};
  var DrawingFunctions = {};

  OSMDataPicker.addControl = function () {
    var customControl = L.Control.extend({
      options: {
        position: "topright",
      },
      onAdd: function (map) {
        var button = L.DomUtil.create("button", "leaflet-osmdatapicker-button");
        button.style.position = "relative";
        button.style.padding = "0";
        button.style.width = "30px";
        button.style.height = "30px";
        var popup = L.DomUtil.create("div", "leaflet-osmdatapicker-popup");
        popup.innerHTML = "Click 'Enter' to end drawing";
        popup.style.position = "absolute";
        popup.style.display = "none";
        popup.style.backgroundColor = "#ffffff";
        popup.style.whiteSpace = "nowrap";
        var svgIcon = L.DomUtil.create("img", "leaflet-osmdatapicker-icon");
        svgIcon.style.width = "100%";
        svgIcon.style.height = "100%";
        svgIcon.style.objectFit = "contain";
        button.appendChild(svgIcon);
        button.appendChild(popup);

        L.DomEvent.on(button, "click", function (e) {
          L.DomEvent.stopPropagation(e);
          if (!buttonClicked) {
            buttonClicked = true;
            togglePopup();

            L.DrawingFunctions.startDrawing(map, function (polygon) {
              drawnPolygon = polygon;
              openOSMDataPickerDialog();
            });
          }
        });
        // Function to toggle popup visibility
        function togglePopup() {
          if (popup.style.display === "none") {
            var buttonRect = button.getBoundingClientRect();
            popup.style.right = buttonRect.width + "px";
            popup.style.bottom = 0 + "px";
            popup.style.display = "block";
          } else {
            popup.style.display = "none";
          }
        }
        return button;
      },
    });

    var control = new customControl();
    control.addTo(map);

    // Create the dialog form
    var dialog = L.DomUtil.create("div", "leaflet-osmdatapicker-dialog");
    dialog.innerHTML = `
          <div class="leaflet-osmdatapicker-header">
              <h2>OSM Data Picker</h2>
          </div>
          <div class="leaflet-osmdatapicker-content">
              <h4>Choose a category :</h4>
              <select class = "osmListBox" id="KeysList">
              <option value=""></option>
              </select>
              <h4>Choose a value :</h4>
              <select class = "osmListBox" id="ValuesList">
              </select>
          </div>
          <div class="leaflet-osmdatapicker-footer">
              <button id="osmDataPickerSubmit">Validate</button>
              <button id="osmDataPickerCancel">Cancel</button>
          </div>
      `;

    map.getContainer().appendChild(dialog);

    dialog.style.display = "none";

    var submitButton = dialog.querySelector("#osmDataPickerSubmit");
    submitButton.addEventListener("click", function () {
      var keysList = document.getElementById("KeysList");
      var selectedKey = keysList.value;
      var valuesList = document.getElementById("ValuesList");
      var selectedValue = valuesList.value;

      // Make the bounding box for osm query
      var polygonBounds = L.polygon(drawnPolygon).getBounds();
      var min_latitude = polygonBounds.getSouth();
      var min_longitude = polygonBounds.getWest();
      var max_latitude = polygonBounds.getNorth();
      var max_longitude = polygonBounds.getEast();
      var bbox =
        min_latitude +
        "," +
        min_longitude +
        "," +
        max_latitude +
        "," +
        max_longitude;
      // Call the function to send the request to OSM Overpass API
      OSMRequests.sendOverpassRequest(
        selectedKey,
        selectedValue,
        bbox,
        drawnPolygon
      );
      closeOSMDataPickerDialog();
      resetDialogandPolygon();
    });

    var cancelButton = dialog.querySelector("#osmDataPickerCancel");
    cancelButton.addEventListener("click", function () {
      closeOSMDataPickerDialog();
      resetDialogandPolygon();
    });

    function openOSMDataPickerDialog() {
      dialog.style.display =
        dialog.style.display === "block" ? "none" : "block";
    }

    function closeOSMDataPickerDialog() {
      dialog.style.display = "none";
      var popup = document.querySelector(".leaflet-osmdatapicker-popup");
      popup.style.display = "none";
      buttonClicked = false;
    }

    // Load JSON file and populate KeysList
    fetch("src/assets/osmtags.json")
      .then((response) => response.json())
      .then((data) => {
        var keyList = document.getElementById("KeysList");
        Object.keys(data).forEach((key) => {
          var option = document.createElement("option");
          option.value = key;
          option.textContent = key;
          keyList.appendChild(option);
        });
      })
      .catch((error) => {
        console.error("Error:", error);
      });

    // Add event listener for KeysList change
    var keysList = document.getElementById("KeysList");
    keysList.addEventListener("change", function () {
      var selectedKey = keysList.value;
      var valuesList = document.getElementById("ValuesList");
      valuesList.innerHTML = "";

      // Populate ValuesList based on selectedKey
      fetch("src/assets/osmtags.json")
        .then((response) => response.json())
        .then((data) => {
          var values = data[selectedKey];
          if (values) {
            values.forEach((value) => {
              var option = document.createElement("option");
              option.value = value;
              option.textContent = value;
              valuesList.appendChild(option);
            });
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    });
  };

  // Function to remove the drawn polygon from the map and clear dropdown menus
  function resetDialogandPolygon() {
    map.eachLayer(function (layer) {
      if (
        layer instanceof L.Polygon &&
        arraysEqual(layer.getLatLngs()[0], drawnPolygon)
      ) {
        map.removeLayer(layer);
      }
    });
    drawnPolygon = [];
    // Clear the selected value of KeysList dropdown menu
    var keysList = document.getElementById("KeysList");
    keysList.selectedIndex = 0;
    // Clear the selected value of ValuesList dropdown menu
    var valuesList = document.getElementById("ValuesList");
    valuesList.innerHTML = "";
  }

  // Function to compare arrays for equality
  function arraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    for (var i = 0; i < arr1.length; i++) {
      if (arr1[i].lat !== arr2[i].lat || arr1[i].lng !== arr2[i].lng)
        return false;
    }
    return true;
  }

  DrawingFunctions.startDrawing = function (map, callback) {
    var drawing = true;
    var drawnPolygon = [];
    var lines = [];
    var markers = [];
    // Change cursor while drawing
    map.getContainer().style.cursor = "crosshair";

    var drawClickHandler = function (e) {
      if (drawing) {
        var latlng = e.latlng;
        drawnPolygon.push(latlng);

        if (drawnPolygon.length === 1) {
          // Add the first point marker with red color
          var firstPointMarker = L.circleMarker(latlng, {
            color: "red",
            radius: 6,
          }).addTo(map);
          markers.push(firstPointMarker);
        } else {
          // Add a marker for each point clicked with a blue circle
          var marker = L.circleMarker(latlng, {
            color: "blue",
            radius: 6,
          }).addTo(map);
          markers.push(marker);

          // Draw a line between the last point and the current point
          var line = L.polyline(
            [drawnPolygon[drawnPolygon.length - 2], latlng],
            { color: "lightblue" }
          ).addTo(map);
          lines.push(line);
        }
      }
    };

    map.on("click", drawClickHandler);

    // End drawing on pressing Enter key
    var keydownHandler = function (e) {
      if (
        drawing &&
        e.originalEvent.key === "Enter" &&
        drawnPolygon.length > 2
      ) {
        drawing = false;
        map.off("click", drawClickHandler);
        map.off("keydown", keydownHandler);

        // Set cursor back to original style
        map.getContainer().style.cursor = "";

        // Draw the polygon
        var polygon = L.polygon(drawnPolygon, {
          color: "blue",
          fillColor: "lightblue",
          fillOpacity: 0.3,
        }).addTo(map);

        // Remove the lines and markers when the drawing is complete
        markers.forEach(function (markers) {
          map.removeLayer(markers);
        });
        lines.forEach(function (lines) {
          map.removeLayer(lines);
        });
        callback(drawnPolygon); // Call the callback function with the drawn polygon coordinates
      }
    };

    map.on("keydown", keydownHandler);
  };

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
    var borderColor = generateRandomColor();
    var fillColor = generateRandomColor();
    if (data.elements.length > 0) {
      data.elements.forEach(function (element) {
        console.log(element.type);
        switch (element.type) {
          case "node":
            var latlng = L.latLng(element.lat, element.lon);
            if (pointInPolygon(latlng, drawnPolygon)) {
              var marker = L.circleMarker(latlng, {
                radius: 8,
                color: borderColor,
                fillColor: fillColor,
                fillOpacity: 0.5,
              }).addTo(map);
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
              var polygon = L.polygon(latlngs, {
                color: borderColor,
                fillColor: fillColor,
                fillOpacity: 0.5,
              }).addTo(map);
              if (element.tags) {
                var popupContent = "<b>Informations:</b><br>";
                for (var key in element.tags) {
                  popupContent += key + ": " + element.tags[key] + "<br>";
                }
                polygon.bindPopup(popupContent);
              }
            } else {
              var polyline = L.polyline(latlngs, { color: borderColor }).addTo(
                map
              );
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

  function generateRandomColor() {
    var letters = "0123456789ABCDEF";
    var color = "#";
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  L.OSMDataPicker = OSMDataPicker;
  L.DrawingFunctions = DrawingFunctions;
  L.OSMRequests = OSMRequests;
})(window.L);
