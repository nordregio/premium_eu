const state = {
  selectedPolygonId: null,
  polygonLayer: null,
  deckgl: null,
  defaultFillColor: [160, 159, 188, 255],
  selectedFillColor: [172, 87, 55, 255]
};

function createPolygonLayer(mapDataUrl) {
  return new deck.PolygonLayer({
    id: "PolygonLayer",
    data: mapDataUrl,
    pickable: true,
    getPolygon: d => d.border,
    filled: true,
    getLineColor: [37, 42, 83, 255],
    getFillColor: d =>
      d.NUTS_ID === state.selectedPolygonId ?
      state.selectedFillColor : state.defaultFillColor,
    updateTriggers: {
      getFillColor: state.selectedPolygonId
    },
    lineWidthMinPixels: 0.7,
    opacity: 0.2,
  });
}

function updateMapSelection(mapDataUrl) {
  state.polygonLayer = createPolygonLayer(mapDataUrl);
  if (state.deckgl) {
    state.deckgl.setProps({ layers: [state.polygonLayer] });
  }
}

export function initializeMap(config, onRegionClick) {
  const { DeckGL, MapView, PolygonLayer, CompassWidget, ZoomWidget } = deck;

  state.polygonLayer = createPolygonLayer(config.mapDataUrl);

  state.deckgl = new DeckGL({
    container: 'map-container',
    map: maplibregl,
    mapStyle: config.mapStyle,
    initialViewState: config.initialViewState,
    views: [new MapView({ id: "map", controller: true })],
    getTooltip: ({ object }) =>
      object ? `${object.NUTS_ID}\n${object.NUTS_NAME}` : null,
    getCursor: ({ isHovering }) => (isHovering ? 'crosshair' : 'default'),
    layers: [state.polygonLayer],
    onClick: ({ object }) => {
      if (object) {
        state.selectedPolygonId = object.NUTS_ID;
        updateMapSelection(config.mapDataUrl);
        onRegionClick(object.NUTS_ID, object.NUTS_NAME);
      }
    },
    widgets: [
      new CompassWidget({ id: "compass", viewId: "map" }),
      new ZoomWidget({ id: "zoom", viewId: "map" }),
    ],
  });
}

export function selectRegion(regionId, mapDataUrl) {
  state.selectedPolygonId = regionId;
  updateMapSelection(mapDataUrl);
}

export function clearSelection(mapDataUrl) {
  state.selectedPolygonId = null;
  updateMapSelection(mapDataUrl);
}
