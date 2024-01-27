/* eslint-disable */

const locations = JSON.parse(document.getElementById("map").dataset.locations);
console.log(locations);

mapboxgl.accessToken =
  "pk.eyJ1IjoiY3JvbWFubzk5IiwiYSI6ImNscnZmbGJtYTBsaDkyam56Z3k3M3AxMWIifQ.iDNFPu1KeQRb8bApnu0J5A";

const map = new mapboxgl.Map({
  container: "map", // container ID
  style: "mapbox://styles/cromano99/clrvg3g8z011d01pb9wx9b9ox", // style URL
  center: [-74.5, 40], // starting position [lng, lat]
  zoom: 9, // starting zoom
});
