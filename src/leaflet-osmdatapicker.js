(function (factory, window) {
  if (typeof define === "function" && define.amd) {
    define(["leaflet"], factory);
  } else if (typeof exports === "object") {
    module.exports = factory(require("leaflet"));
  } else {
    window.L.OSMDataPicker = factory(L);
  }
})(function (L) {
  var OSMDataPicker = {};

  OSMDataPicker.addControl = function () {
    var customControl = L.Control.extend({
      options: {
        position: "topright",
      },
      onAdd: function (map) {
        var button = L.DomUtil.create("button", "leaflet-osmdatapicker-button");
        button.innerHTML = "OSM Button";

        L.DomEvent.on(button, "click", function () {
          console.log("Clicked");
        });

        return button;
      },
    });

    var control = new customControl();
    control.addTo(map);
  };

  L.OSMDataPicker = OSMDataPicker;

  return OSMDataPicker;
}, window);
