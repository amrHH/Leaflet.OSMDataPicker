<a href="https://www.npmjs.com/package/leaflet.osmdatapicker"><img alt="npm" src="https://img.shields.io/npm/dt/leaflet.osmdatapicker"></a>
<a href="https://www.npmjs.com/package/leaflet.osmdatapicker"><img alt="npm" src= "https://img.shields.io/npm/v/leaflet.osmdatapicker?color=red"></a>

# Leaflet OSM Data Picker Plugin

Leaflet OSMDataPicker Plugin is a JavaScript plugin that provides a very simple interface for selecting OpenStreetMap (OSM) data within a drawn polygon on a Leaflet map.

**_Note: This plugin is still under development. Improvements and fixes are ongoing._**

## Features

- Allows users to draw polygons on the map interface.
- Provides a popup interface for selecting OSM data categories and values.
- Sends queries to the OSM Overpass API to retrieve data within the drawn polygon.
- Displays retrieved OSM data on the map.

## Requirements

Leaflet 1.0.0 and plus

Desktops: Windows 10, Google Chrome, Microsoft Edge

## Demo

You can view a demo [here](https://amrhh.github.io/Leaflet.OSMDataPicker/).

## Installation

```bash
npm install leaflet.osmdatapicker
```

then add these 2 lines in your main html file :

```html
<script src="./node_modules/leaflet.osmdatapicker/src/leaflet-osmdatapicker.js"></script>
<link
  rel="stylesheet"
  href="./node_modules/leaflet.osmdatapicker/src/osmdatapicker-page.css"
/>
```

or use with CDN :

```html
<script src="https://unpkg.com/leaflet.osmdatapicker@latest/src/leaflet-osmdatapicker.js"></script>
<link
  rel="stylesheet"
  href="https://unpkg.com/leaflet.osmdatapicker@latest/src/osmdatapicker-
page.css"
/>
```

## Usage

```javascript
var map = L.map("map").setView([46.6031, 1.8883], 6);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

L.OSMDataPicker.addControl(map);
```

## Licence

This plugin is released under the MIT License. See the [LICENSE](https://opensource.org/license/mit/) file for details.

## Contributing

Contributions are welcome! :) If you find any issues or have suggestions for improvements, please open an issue or submit a pull request on the GitHub repository.
