/*
 * v2: bases vectorials d'OpenFreeMap (https://openfreemap.org).
 * Dades d'OpenStreetMap, ús gratuït i sense clau ni registre.
 * Selector de la v2: «Mapa clar» (Liberty, per defecte), «Mapa viu»
 * (Bright) i «Vista aèria» (ortofoto PNOA de l'IGN).
 */
(function () {
  'use strict';
  if (!window.SG_BASEMAPS) return;

  var ATTR = '<a href="https://openfreemap.org" target="_blank" rel="noopener">OpenFreeMap</a> ' +
    '&copy; <a href="https://www.openmaptiles.org/" target="_blank" rel="noopener">OpenMapTiles</a> ' +
    'Dades de <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>';

  var vector = [
    { id: 'ofm-liberty', type: 'maplibre', label: 'Mapa clar', style: 'https://tiles.openfreemap.org/styles/liberty', attribution: ATTR },
    { id: 'ofm-bright', type: 'maplibre', label: 'Mapa viu', style: 'https://tiles.openfreemap.org/styles/bright', attribution: ATTR }
  ];

  // Vista aèria: ortofoto PNOA de l'IGN (definida a js/basemaps.js).
  var satellite = (window.SG_BASEMAPS.keyless || []).filter(function (d) { return d.id === 'pnoa'; });
  satellite.forEach(function (d) { d.label = 'Vista aèria (PNOA)'; });

  // A la v2 el selector mostra només estes tres capes.
  window.SG_BASEMAPS.keyless = vector.concat(satellite);
  window.SG_BASEMAPS.optional = [];
})();
