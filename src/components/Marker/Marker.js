import mapboxgl from "mapbox-gl"
import { CSS } from "./../../constants"
import "./marker.css"

export default class Marker {
  constructor({ index, featuresData, mapbox }) {
    this.index = index
    this.featuresData = featuresData
    this.mapbox = mapbox
    this.element = null
    this.init()
  }

  init() {
    this.render()
    this.wireEventHandlers()
  }

  wireEventHandlers() {
    this.element.addEventListener("click", this.onClick.bind(this))
    this.element.addEventListener("mouseover", this.onOver.bind(this))
    this.element.addEventListener("mouseout", this.onOut.bind(this))
  }

  onOver(event) {
    const item = event.target.closest(`.${CSS.marker.item}`)
    if (!item) return

    const index = item.dataset.index

    const currentListItem = document.querySelector(`.${CSS.sidebar} .${CSS.list.hover}`)
    currentListItem && currentListItem.classList.remove(CSS.list.hover)

    const hoverListItem = document.querySelector(
      `.${CSS.sidebar} .${CSS.list.item}[data-index="${index}"]`
    )
    hoverListItem && hoverListItem.classList.add(CSS.list.hover)

    item.classList.add(CSS.marker.hover)
  }

  onOut(event) {
    const item = event.target.closest(`.${CSS.marker.item}`)
    if (!item) return

    const currentListItem = document.querySelector(`.${CSS.sidebar} .${CSS.list.hover}`)
    currentListItem && currentListItem.classList.remove(CSS.list.hover)
    item.classList.remove(CSS.marker.hover)
  }

  onClick(event) {
    const item = event.target.closest(`.${CSS.marker.item}`)
    if (!item || item.dataset.enabled !== "true") return

    const index = item.dataset.index
    const currentListItem = document.querySelector(`.${CSS.sidebar} .${CSS.list.active}`)
    currentListItem && currentListItem.classList.remove(CSS.list.active)

    var activeListItem = document.querySelector(
      `.${CSS.sidebar} .${CSS.list.item}[data-index="${index}"]`
    )
    activeListItem && activeListItem.classList.add(CSS.list.active)

    this.mapbox.flyToMarker(index)
    this.mapbox.createPopUp(index)
  }

  render() {
    this.element = document.createElement("div")
    this.element.className = CSS.marker.item
    this.element.dataPosition = this.index
    this.element.id = "marker-" + this.index
    this.element.setAttribute("data-index", this.index)
    this.element.setAttribute("data-enabled", true)

    new mapboxgl.Marker(this.element, {
      offset: [-7.5, -7.5]
    })
      .setLngLat(this.featuresData.geometry.coordinates)
      .addTo(this.mapbox.map)
  }

}
