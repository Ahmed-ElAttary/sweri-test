"use strict";

let latlngs = [];
let routeLine;
let lastTime;
var carIcon = L.icon({
  iconSize: [40, 40],
  iconAnchor: [19, 13],
  iconUrl: "./dot.png",
});
const att_map = L.map("map", { zoomControl: true, attributionControl: false });
att_map.setView([27, 31], 6);
const satellite = L.tileLayer(
  "https://mt0.google.com/vt/lyrs=s&hl=ar&x={x}&y={y}&z={z}",
  { maxZoom: 20, maxNativeZoom: 20 }
);
const street = L.tileLayer(
  "https://mt0.google.com/vt/lyrs=m&hl=ar&x={x}&y={y}&z={z}",
  { maxZoom: 20, maxNativeZoom: 20 }
);
att_map.addLayer(satellite);
const baseLayers = {
  satellite: satellite,
  street: street,
};

const overlays = {};
const maplayers = L.control
  .layers(baseLayers, overlays, { position: "bottomleft" })
  .addTo(att_map);
var layer;

let mrkCurrentLocation;
L.easyButton({
  position: "topright",
  states: [
    {
      icon: "ion-android-locate",
      onClick: function () {
        att_map.locate({
          watch: true,
          enableHighAccuracy: false,
        });
      },
    },
  ],
}).addTo(att_map);

L.easyButton({
  position: "topright",
  states: [
    {
      icon: "ion-android-close",
      onClick: function () {
        att_map.stopLocate();
      },
    },
  ],
}).addTo(att_map);

att_map.on("locationerror", function (e) {
  alert("خطأ في تحديد الموقع");
});
att_map.on("locationfound", function (e) {
  if (e.accuracy > 20) {
    document.getElementById("coords").innerHTML =
      "poor accuracy: " + e.accuracy.toFixed(2);
  } else {
    att_map.setView(e.latlng, 20);
    document.getElementById("coords").innerHTML =
      e.latitude + " " + e.longitude + "<br> acc: " + e.accuracy.toFixed(2);
    if (latlngs.length == 0) {
      mrkCurrentLocation = L.marker(e.latlng, { icon: carIcon }).addTo(att_map);
      latlngs.push([e.latitude, e.longitude]);

      return;
    } else if (latlngs.length == 1) {
      if (latlngs[0][0] == e.latitude && latlngs[0][1] == e.longitude) {
        return;
      } else {
        latlngs.push([e.latitude, e.longitude]);
      }
    } else if (latlngs.length == 2) {
      if (latlngs[1][0] == e.latitude && latlngs[1][1] == e.longitude) {
        return;
      } else {
        latlngs.shift();
        latlngs.push([e.latitude, e.longitude]);
      }
    }
    const distance = turf.distance(...latlngs, { units: "meters" });

    if (routeLine) routeLine.remove();
    routeLine = L.polyline([...latlngs], {
      weight: 0,
    }).addTo(att_map);

    if (mrkCurrentLocation) mrkCurrentLocation.remove();
    if (distance > 5) {
      console.log({ latlngs, distance, time: new Date().getTime() - lastTime });
      mrkCurrentLocation = L.animatedMarker(routeLine.getLatLngs(), {
        distance,
        interval: new Date().getTime() - lastTime,
        icon: carIcon,
      }).addTo(att_map);

      mrkCurrentLocation.start();
    } else {
      mrkCurrentLocation = L.marker(e.latlng, { icon: carIcon }).addTo(att_map);
    }
    lastTime = new Date().getTime();
  }
});
