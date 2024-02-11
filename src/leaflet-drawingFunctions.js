(function (L) {
  var DrawingFunctions = {};

  DrawingFunctions.startDrawing = function (map, callback) {
    var drawing = true;
    var drawnPolygon = [];
    var lines = [];
    var firstPointMarker = null;

    // Change cursor while drawing
    map.getContainer().style.cursor = "crosshair";

    var drawClickHandler = function (e) {
      if (drawing) {
        var latlng = e.latlng;
        drawnPolygon.push(latlng);

        if (drawnPolygon.length === 1) {
          // Add the first point marker with red color
          firstPointMarker = L.circleMarker(latlng, {
            color: "red",
            radius: 6,
          }).addTo(map);
        } else {
          // Add a marker for each point clicked with a blue circle
          var marker = L.circleMarker(latlng, {
            color: "blue",
            radius: 6,
          }).addTo(map);

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
        // Remove the lines when the drawing is complete
        lines.forEach(function (line) {
          map.removeLayer(line);
        });

        // Reset the color of the first point to blue
        if (firstPointMarker) {
          firstPointMarker.setStyle({ color: "blue" });
        }
        callback(drawnPolygon); // Call the callback function with the drawn polygon coordinates
      }
    };

    map.on("keydown", keydownHandler);
  };

  L.DrawingFunctions = DrawingFunctions;
})(window.L);
