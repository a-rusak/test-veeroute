export const transformToGeoJson = data => {
  const GEO_JSON_TEMPLATE = {
    type: "FeatureCollection",
    features: []
  }
  const GEO_JSON_FEATURE_TEMPLATE = {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: []
    },
    properties: {}
  }
  const features = Object.assign({}, GEO_JSON_TEMPLATE)

  features.features = []
  data.cities.forEach(city => {
    const feature = Object.assign({}, GEO_JSON_FEATURE_TEMPLATE)
    const coordinates = {
      coordinates: [city.location.lng, city.location.lat]
    }
    feature.geometry = Object.assign(
      {},
      GEO_JSON_FEATURE_TEMPLATE.geometry,
      coordinates
    )
    const properties = {
      name: city.name,
      weather: city.weather,
      features: city.features
    }
    feature.properties = Object.assign(
      {},
      GEO_JSON_FEATURE_TEMPLATE.properties,
      properties
    )
    features.features.push(feature)
  })
  return features
}

export const getDataFromUrl = url => {
  return new Promise((resolve, reject) => {
    window
      .fetch(url)
      .then(response => {
        response.json().then(json => resolve(json))
      })
      .catch(exception => reject(exception))
  })
}

export const buildFeaturesList = (items, cssClass) => {
  let itemsHTML = ""
  items.forEach(item => {
    itemsHTML += `
      <span class="${cssClass}-feature">${item}</span>
    `
  })
  return itemsHTML
}

export const checkListIsEmpty = ({msg, nodes}) => {
  const items = [...nodes]
  let isEmpty = false
  if (items.length === 0) {
    isEmpty = true
  } else {
    let visibleCount = items.reduce((acc, item) => {
      if (getComputedStyle(item).display === "block") {
        acc++
      }
      return acc
    }, 0)
    isEmpty = visibleCount === 0 ? true : false
  }
  msg.style.display = isEmpty ? "block" : "none"
}
