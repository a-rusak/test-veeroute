import "mapbox-gl/dist/mapbox-gl.css"
import "./index.css"
import Promise from "babel-runtime/core-js/promise"
import "whatwg-fetch"
import App from "./App"
import Mapbox from "./components/Mapbox/Mapbox"
import Marker from "./components/Marker/Marker"
import List from "./components/List/List"

if (!window.Promise) {
  window.Promise = Promise;
}

const app = new App({}, () => {
  const mapbox = new Mapbox({}, app)
  app.data.features.forEach(
    (featuresData, index) => new Marker({ index, featuresData, mapbox })
  )
  new List(mapbox)
})