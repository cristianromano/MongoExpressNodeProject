/* eslint-disable */
export const displayMap = (locations) => {
  // Set the Mapbox access token
  mapboxgl.accessToken =
    "pk.eyJ1IjoiY3JvbWFubzk5IiwiYSI6ImNscnZmbGJtYTBsaDkyam56Z3k3M3AxMWIifQ.iDNFPu1KeQRb8bApnu0J5A";

  // Create a new Mapbox map instance
  var map = new mapboxgl.Map({
    container: "map", // container ID
    style: "mapbox://styles/cromano99/clrvg3g8z011d01pb9wx9b9ox", // style URL
    center: [-74.5, 40], // starting position [lng, lat]
    /**
     * Represents the bounds of the map.
     * @type {mapboxgl.LngLatBounds}
     */
    /**
     * The bounds variable represents the boundaries of the map.
     * @type {Array<number>}
     */
    zoom: 9, // starting zoom
  });

  //#region Explicacion de la funcion
  /*
  
  1. `const bounds = new mapboxgl.LngLatBounds();`: This line creates a new instance of the `LngLatBounds` class from the Mapbox GL JS library. 
  This object will be used to store the geographical bounds of the map.
  
  2. `locations.forEach((loc) => {`: This line starts a loop that iterates over each element in the `locations` array. 
  It uses the `forEach` method to execute the provided function for each element.
  
  3. el.className = "marker";: This line sets the className property of the el element to "marker". This assigns a CSS class to the element, which can be used to style it.
  
  4. `const el = document.createElement("div");`: This line creates a new HTML `div` element using the `createElement` method from the `document` object. 
  This element will be used as a marker on the map.
  
  5. `new mapboxgl.Marker({`: This line creates a new instance of the `Marker` class from the Mapbox GL JS library. 
  It takes an object as an argument with configuration options for the marker.
  
  6. `.setLngLat(loc.coordinates)`: This line sets the longitude and latitude coordinates of the marker using the `setLngLat` method. 
  It takes the `coordinates` property of the `loc` object as an argument.
  
  7. `.addTo(map);`: This line adds the marker to the map by calling the `addTo` method and passing the `map` object as an argument.
  
  8. `new mapboxgl.Popup({`: This line creates a new instance of the `Popup` class from the Mapbox GL JS library. 
  It takes an object as an argument with configuration options for the popup.
  
  9. `.setLngLat(loc.coordinates)`: This line sets the longitude and latitude coordinates of the popup using the `setLngLat` method. 
  It takes the `coordinates` property of the `loc` object as an argument.
  
  10. `.setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)`: This line sets the HTML content of the popup using the `setHTML` method. 
  It takes a template string that includes the `day` and `description` properties of the `loc` object.
  
  11. `.addTo(map);`: This line adds the popup to the map by calling the `addTo` method and passing the `map` object as an argument.
  
  12. `bounds.extend(loc.coordinates);`: This line extends the geographical bounds of the map by including the coordinates of the current location. 
  It uses the `extend` method of the `bounds` object.
  
  13. `map.fitBounds(bounds, {`: This line adjusts the map's zoom level and position to fit the specified bounds. 
  It uses the `fitBounds` method of the `map` object and takes the `bounds` object as the first argument.
  
  31-36. The `padding` property is an optional configuration option for the `fitBounds` method. It specifies the amount of padding (in pixels) to be added around the bounds. 
  This ensures that the markers and popups are not positioned too close to the edges of the map.
  
  */
  //#endregion

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    // Create marker
    const el = document.createElement("div");
    el.className = "marker";

    // Add marker
    new mapboxgl.Marker({
      element: el,
      anchor: "bottom",
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // Add popup
    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    // Extend map bounds to include current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
