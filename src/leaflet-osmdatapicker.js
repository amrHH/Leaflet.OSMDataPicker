(function (L) {
  var OSMDataPicker = {};

  OSMDataPicker.addControl = function () {
    var customControl = L.Control.extend({
      options: {
        position: "topright",
      },
      onAdd: function (map) {
        var button = L.DomUtil.create("button", "leaflet-osmdatapicker-button");
        button.innerHTML = "Open OSM Data Picker";

        L.DomEvent.on(button, "click", function () {
          openOSMDataPickerDialog();
        });

        return button;
      },
    });

    var control = new customControl();
    control.addTo(map);

    // Create the dialoge form
    var dialog = L.DomUtil.create("div", "leaflet-osmdatapicker-dialog");
    dialog.innerHTML = `
          <div class="leaflet-osmdatapicker-header">
              <h2>OSM Data Picker</h2>
          </div>
          <div class="leaflet-osmdatapicker-content">
              <h4>Choose an amenity :</h4>
              <select id="osmDataPickerSelect">
                  <option value="value1">V1</option>
                  <option value="value2">V2</option>
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
      console.log("Validated");
    });

    var cancelButton = dialog.querySelector("#osmDataPickerCancel");
    cancelButton.addEventListener("click", function () {
      console.log("Canceled");
      closeOSMDataPickerDialog();
    });

    function openOSMDataPickerDialog() {
      dialog.style.display =
        dialog.style.display === "block" ? "none" : "block";
    }

    function closeOSMDataPickerDialog() {
      dialog.style.display = "none";
    }
  };

  L.OSMDataPicker = OSMDataPicker;
})(window.L);
