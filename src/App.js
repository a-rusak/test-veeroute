import { DATA_URL, CSS } from "./constants"
import { transformToGeoJson, getDataFromUrl } from "./utils/utils"

export default class App {
  constructor(options, callback) {
    this.options = Object.assign({}, App.defaults, options)
    this.callback = callback
    this.data = null
    this.sidebarDom = null
    this.regionsDom = null
    this.regionsPanelDom = null
    this.regionsSelectedDom = null
    this.regionsSelectedPanelDom = null
    this.domKeys = [
      "sidebar",
      "regions",
      "regionsPanel",
      "regionsSelected",
      "regionsSelectedPanel"
    ]
    this.init()
  }

  init() {
    this.request().then(this.handleResponse.bind(this))
    this.getDomComponents(this.domKeys)
  }

  request() {
    return getDataFromUrl(this.options.ajax.url)
  }

  handleResponse(response) {
    this.data = transformToGeoJson(response)
    this.callback()
  }

  getDomComponents(keys) {
    keys.forEach(key => {
      this[`${key}Dom`] = document.querySelector(`.${CSS[key]}`)
    })
  }
}

App.defaults = {
  ajax: {
    url: DATA_URL
  }
}
