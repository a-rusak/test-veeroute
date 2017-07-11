import mapboxgl from "mapbox-gl"
//import "mapbox-gl/dist/mapbox-gl.css"
import {
  MAPBOX_TOKEN,
  MAPBOX_STYLE,
  MAPBOX_CENTER,
  CSS
} from "./../../constants"
import { buildFeaturesList } from "./../../utils/utils"

export default class Mapbox {
  constructor(options, app) {
    this.options = Object.assign({}, Mapbox.defaults, options)
    this.app = app
    this.init()
  }
  init() {
    this.create()
  }
  create() {
    mapboxgl.accessToken = MAPBOX_TOKEN
    this.map = new mapboxgl.Map(this.options)
    this.map.on("load", () => {
      this.map.addSource("places", {
        type: "geojson",
        data: this.app.data
      })

      this.map.addControl(new mapboxgl.NavigationControl(), "top-left")
    })
  }

  flyToMarker(index) {
    const feature = this.app.data.features[index]
    this.map.flyTo({
      center: feature.geometry.coordinates,
      zoom: 9
    })
  }

  createPopUp(index) {
    const feature = this.app.data.features[index]
    const {
      geometry: { coordinates },
      properties: { name, weather, features }
    } = feature
    const cssPopup = CSS.popup.item

    //this.removePopup()
    this.popup && this.popup.remove()
    // TODO: drop active classes on list and marker on close popup
    this.popup = new mapboxgl.Popup({
      closeOnClick: false
    })
      .setLngLat(coordinates)
      .setHTML(
        `
      <div class="${cssPopup}" role="popup" aria-labellebby="${cssPopup}-title-${index}" data-index="${index}">
        <h3 class="${cssPopup}-title" id="popup-title-${index}">
          <span class="${cssPopup}-title-name">${name}</span>,
          <span class="${cssPopup}-title-weather">${weather}</span>
        </h3>
        <div class="${cssPopup}-features">
          ${buildFeaturesList(features, cssPopup)}
        </div>
      </div>
    `
      )
      .addTo(this.map)
  }

  /*removePopup() {
    const popUps = document.querySelector(`.${CSS.map} .${CSS.popup.mapbox}`)
    if (popUps) {
      popUps.remove()
    }
  }*/
}

Mapbox.defaults = {
  container: CSS.map,
  style: MAPBOX_STYLE,
  center: MAPBOX_CENTER,
  zoom: 7,
  scrollZoom: false
}
