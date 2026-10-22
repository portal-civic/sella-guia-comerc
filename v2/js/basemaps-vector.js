/*
 * v2: bases vectorials d'OpenFreeMap (https://openfreemap.org).
 * Dades d'OpenStreetMap, ús gratuït i sense clau ni registre.
 * S'afigen al principi de la llista, de manera que «Liberty» (semblant a
 * CARTO Voyager) és el mapa per defecte. Les capes ràster de
 * js/basemaps.js continuen disponibles al selector.
 */
(function () {
  'use strict';
  if (!window.SG_BASEMAPS) return;

  var ATTR = '<a href="https://openfreemap.org" target="_blank" rel="noopener">OpenFreeMap</a> ' +
    '&copy; <a href="https://www.openmaptiles.org/" target="_blank" rel="noopener">OpenMapTiles</a> ' +
    'Dades de <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>';

  var vector = [
    { id: 'ofm-liberty', type: 'maplibre', label: 'Mapa clar (Liberty)', style: 'https://tiles.openfreemap.org/styles/liberty', attribution: ATTR },
    { id: 'ofm-positron', type: 'maplibre', label: 'Mapa gris (Positron)', style: 'https://tiles.openfreemap.org/styles/positron', attribution: ATTR },
    { id: 'ofm-bright', type: 'maplibre', label: 'Mapa viu (Bright)', style: 'https://tiles.openfreemap.org/styles/bright', attribution: ATTR }
  ];

  window.SG_BASEMAPS.keyless = vector.concat(window.SG_BASEMAPS.keyless || []);
})();
