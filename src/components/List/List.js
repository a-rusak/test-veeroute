import "./list.css"
import dragula from "dragula"
import "dragula/dist/dragula.css"
import Jets from "Jets"
import { CSS } from "./../../constants"
import { buildFeaturesList, checkListIsEmpty } from "./../../utils/utils"

export default class List {
  constructor(mapbox) {
    this.mapbox = mapbox
    this.app = mapbox.app
    this.itemsDom = []
    this.listEmptyMsgDom = null
    this.selectedListEmptyMsgDom = null
    this.sortButton = null
    this.searchField = null
    this.filterArr = []
    this.filterInputs = []
    this.init()
  }

  init() {
    this.render()
    this.renderFilter()
    this.getDomElements()
    this.addSearch()
    this.wireEventHandlers()
    this.addDragDrop()
    checkListIsEmpty(this.regionsPick)
    checkListIsEmpty(this.selectedRegionsPick)
  }

  getDomElements() {
    this.itemsDom = [
      ...this.app.regionsDom.querySelectorAll(`.${CSS.list.item}`)
    ]
    this.listEmptyMsgDom = this.addEmptyMessage(
      this.app.regionsPanelDom,
      "Список городов пуст"
    )
    this.selectedListEmptyMsgDom = this.addEmptyMessage(
      this.app.regionsSelectedPanelDom,
      "Список выбранных городов пуст"
    )
    this.sortButton = document.querySelector(`.${CSS.sortButton}`)
    this.searchField = document.querySelector(`.${CSS.searchField}`)

    this.regionsPick = {
      msg: this.listEmptyMsgDom,
      nodes: this.app.regionsDom.children
    }
    this.selectedRegionsPick = {
      msg: this.selectedListEmptyMsgDom,
      nodes: this.app.regionsSelectedDom.children
    }
  }

  wireEventHandlers() {
    this.app.sidebarDom.addEventListener("click", this.onClick.bind(this))

    this.itemsDom.forEach(item => {
      item.addEventListener("mouseenter", this.onOver.bind(this))
      item.addEventListener("mouseleave", this.onOut.bind(this))
    })
    this.sortButton.addEventListener("click", this.sortRegions.bind(this))
    this.searchField.addEventListener("input", () => {
      checkListIsEmpty(this.regionsPick)
    })
    this.filterInputs.forEach(input => {
      input.addEventListener("change", this.filterSelectedList.bind(this))
    })
  }

  addDragDrop() {
    this.drake = dragula([this.app.regionsDom, this.app.regionsSelectedDom])
    this.drake.on("drop", (el, target) => {
      if (target === this.app.regionsSelectedDom) {
        el.dataset.jets = el
          .querySelector(`.${CSS.list.item}-features`)
          .textContent.trim()
      }
      if (target === this.app.regionsDom) {
        el.dataset.jets = el
          .querySelector(`.${CSS.list.item}-name`)
          .textContent.toLowerCase()
          .trim()
      }
      checkListIsEmpty(this.regionsPick)
      checkListIsEmpty(this.selectedRegionsPick)
      this.filterSelectedList()
    })
  }

  addEmptyMessage(panel, text) {
    const div = document.createElement("div")
    div.classList.add(CSS.emptyMsg)
    div.textContent = text
    panel.appendChild(div)
    return div
  }

  addSearch() {
    new Jets({
      searchTag: ".regions-search",
      contentTag: ".regions"
    })
  }

  sortRegions(event) {
    const button = event.target
    if (!button) return

    const cssClasses = button.classList
    const isSortedAsc = cssClasses.contains("asc")
    const isSortedDesc = cssClasses.contains("desc")
    const list = [...this.regionsPick.nodes]
    const sortFunc = (ea, eb) => {
      var a = ea.querySelector(".list-item-name").textContent.trim()
      var b = eb.querySelector(".list-item-name").textContent.trim()
      if (isSortedDesc || (!isSortedAsc && !isSortedDesc)) {
        if (a < b) return -1
        if (a > b) return 1
        return 0
      } else {
        if (a < b) return 1
        if (a > b) return -1
        return 0
      }
    }

    list.sort(sortFunc).forEach(item => {
      item.parentElement.appendChild(item)
    })

    if (isSortedDesc || (!isSortedAsc && !isSortedDesc)) {
      button.classList.add("asc")
      button.classList.remove("desc")
    } else {
      button.classList.add("desc")
      button.classList.remove("asc")
    }
  }

  filterSelectedList() {
    this.styleTag.innerHTML = ""
    this.filterInputs.forEach(input => {
      if (!input.checked) {
        const feature = this.filterArr[input.dataset.index]
        this.styleTag.innerHTML += `
        .regions-selected > [data-jets*="${feature}"]{display:none}
      `
      }
    })
    const items = [...this.selectedRegionsPick.nodes]
    items.forEach(item => {
      const marker = document.getElementById(`marker-${item.dataset.index}`)
      marker.dataset.enabled =
        getComputedStyle(item).display === "block" ? true : false
    })
    checkListIsEmpty(this.selectedRegionsPick)
  }

  onClick(event) {
    const item = event.target.closest(`.${CSS.list.item}`)
    if (!item) return

    const index = item.dataset.index
    const el = document.querySelector(`.${CSS.sidebar} .${CSS.list.active}`)
    el && el.classList.remove(CSS.list.active)
    item.classList.add(CSS.list.active)

    this.mapbox.flyToMarker(index)
    this.mapbox.createPopUp(index)
  }

  onOver(event) {
    const item = event.target.closest(`.${CSS.list.item}`)
    if (!item) return

    const marker = document.getElementById(`marker-${item.dataset.index}`)

    item.classList.add(CSS.list.hover)
    marker.classList.add(CSS.marker.hover)
  }

  onOut(event) {
    const item = event.target.closest(`.${CSS.list.item}`)
    if (!item) return
    const marker = document.getElementById(`marker-${item.dataset.index}`)

    item.classList.remove(CSS.list.hover)
    marker.classList.remove(CSS.marker.hover)
  }

  render() {
    const cssClass = CSS.list.item
    const items = this.app.data.features
    let itemsHTML = ""
    items.forEach((item, index) => {
      const { name, weather, features } = item.properties
      itemsHTML += `
      <article class="${cssClass}" data-index="${index}" data-jets="${name
        .toLowerCase()
        .trim()}">
        <h3 class="${cssClass}-title">
          <span class="${cssClass}-name">${name}</span>,
          <span class="${cssClass}-weather">${weather}</span>
        </h3>
        <div class="${cssClass}-features">
          ${buildFeaturesList(features, cssClass)}
        </div>
      </article>
    `
    })
    this.app.regionsDom.innerHTML = itemsHTML
  }

  renderFilter() {
    let filterHtml = ""
    this.app.data.features.forEach(item => {
      item.properties.features.forEach(feature => {
        if (this.filterArr.includes(feature) || feature === "") return
        this.filterArr.push(feature)
      })
    })
    this.filterArr.forEach((item, index) => {
      filterHtml += `
        <input type="checkbox" checked id="filterChb-${index}" data-index="${index}">
        <label for="filterChb-${index}">${item}</label>
      `
    })

    document.querySelector(
      `.${CSS.regionsSelectedPanel}__controls`
    ).innerHTML = filterHtml

    this.filterInputs = [
      ...document.querySelectorAll(
        `.${CSS.regionsSelectedPanel}__controls > input`
      )
    ]

    this.styleTag = document.createElement("style")
    document.head.appendChild(this.styleTag)
  }
}
