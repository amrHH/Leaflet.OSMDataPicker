(function (L) {
  var OSMDataPicker = {};
  var drawnPolygon = [];

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
        var svgIcon = L.DomUtil.create("img", "leaflet-osmdatapicker-icon");
        svgIcon.src = "./assets/openstreetmap.svg";
        svgIcon.style.width = "100%";
        svgIcon.style.height = "100%";
        svgIcon.style.objectFit = "contain";
        button.appendChild(svgIcon);
        L.DomEvent.on(button, "click", function (e) {
          L.DomEvent.stopPropagation(e);
          L.DrawingFunctions.startDrawing(map, function (polygon) {
            drawnPolygon = polygon;
            openOSMDataPickerDialog();
            console.log("Polygon drawn:", drawnPolygon);
          });
        });

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
    }

    // Load JSON file and populate KeysList
    fetch("./assets/osmtags.json")
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
      fetch("./assets/osmtags.json")
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
    drawnPolygon = [];
    map.eachLayer(function (layer) {
      if (layer instanceof L.Polygon) {
        map.removeLayer(layer);
      }
    });
    // Clear the selected value of KeysList dropdown menu
    var keysList = document.getElementById("KeysList");
    keysList.selectedIndex = 0;
    // Clear the selected value of ValuesList dropdown menu
    var valuesList = document.getElementById("ValuesList");
    valuesList.innerHTML = "";
  }

  L.OSMDataPicker = OSMDataPicker;
})(window.L);
