const map = L.map('map').setView([64.2, -149.5], 4);

// Base map
L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// North arrow
L.control.attribution({position: 'bottomleft'}).addAttribution('🧭 North ↑');

// Scale
L.control.scale({metric: true}).addTo(map);

// Layer groups 
const layers = {
  "Cities": L.layerGroup(),
  "Tourist Spots": L.layerGroup(),
  "Railway": L.layerGroup(),
  "Roads": L.layerGroup(),
  "Trails": L.layerGroup(),
  "Mile Markers": L.layerGroup()
};

// Custom icons
const icons = {
  city: L.icon({
    iconUrl: 'assets/icons/city.png',
    iconSize: [25, 25]
  }),
  place: L.icon({
    iconUrl: 'assets/icons/place.png',
    iconSize: [25, 25]
  }),
  marker: L.icon({
    iconUrl: 'assets/icons/mile.png',
    iconSize: [20, 20]
  }),
  trail: L.icon({
    iconUrl: 'assets/icons/trail.png',
    iconSize: [15, 15]
  }),
  train: L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/888/888879.png',
    iconSize: [20, 20]
  })
};

const geojsonFiles = [
  {url: 'data/MileMarkers.geojson', layer: layers["Mile Markers"], icon: icons.marker},
  {url: 'data/RailwayTrack.geojson', layer: layers.Railway, style: {color: '#444', dashArray: '4'}},
  {url: 'data/Roads.geojson', layer: layers.Roads, dualLine: true},
  {url: 'data/TouristicCities.geojson', layer: layers.Cities, icon: icons.city},
  {url: 'data/TouristicPlaces.geojson', layer: layers["Tourist Spots"], icon: icons.place},
  {url: 'data/Trailheads.geojson', layer: layers.Trails, icon: icons.trail}
];

geojsonFiles.forEach(item => {
  fetch(item.url)
    .then(res => res.json())
    .then(data => {
      if (item.dualLine) {
        // Black base layer (border)
        L.geoJSON(data, {
          style: {color: 'black', weight: 7}
        }).addTo(item.layer);

        // Yellow road on top
        L.geoJSON(data, {
          style: {color: '#FFD700', weight: 4},
          onEachFeature: (feature, layer) => {
            const name = feature.properties.name || "Unnamed Road";
            layer.bindPopup(`<b>${name}</b>`);
          }
        }).addTo(item.layer);
      } else {
        L.geoJSON(data, {
          pointToLayer: (feature, latlng) => {
            return item.icon ? L.marker(latlng, {icon: item.icon}) : L.marker(latlng);
          },
          style: item.style || null,
          onEachFeature: (feature, layer) => {
            const name = feature.properties.name || "Unnamed";
            layer.bindPopup(`<b>${name}</b>`);
          }
        }).addTo(item.layer);
      }
    });
});

// Add all layers to map
Object.values(layers).forEach(layer => layer.addTo(map));

// Layer control on top left
L.control.layers(null, layers, {
  collapsed: false,
  position: 'topright'  // <-- changed here
}).addTo(map);

// Legend on bottom right
const legend = L.control({position: 'bottomright'});
legend.onAdd = function () {
  const div = L.DomUtil.create('div', 'legend');
  div.innerHTML = `
    <h4>Legend</h4>
    <i><img src="assets/icons/mile.png" width="16" /></i> Mile Marker<br>
    <i><img src="assets/icons/city.png" width="16" /></i> Touristic City<br>
    <i><img src="assets/icons/place.png" width="16" /></i> Touristic Place<br>
    <i><img src="assets/icons/trail.png" width="16" /></i> Trail<br>
    <i><img src="assets/icons/track.png" width="16" /></i> Railway<br>
    <i><img src="assets/icons/road.png" width="16" /></i> Road<br>
  `;
  return div;
};
legend.addTo(map);
