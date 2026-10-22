/*
 * Guia de comerç de Sella — proposta v2
 * Llig les mateixes dades que la versió actual (../data/comercos.json).
 * Icones i colors de categoria: idèntics a la versió actual.
 */
(function () {
  'use strict';

  var DATA_URL = '../data/comercos.json';
  var NO_FIXED_LOCATION = 'no_fixed_public_location';

  var CATEGORY_FILTERS = [
    { id: 'all', label: 'Totes' },
    { id: 'alimentacio', label: 'Alimentació' },
    { id: 'restauracio', label: 'Bars i restaurants' },
    { id: 'allotjaments', label: 'Allotjaments' },
    { id: 'construccio', label: 'Construcció' },
    { id: 'serveis', label: 'Serveis' },
    { id: 'oci', label: 'Oci i esports' },
    { id: 'altres', label: 'Altres' }
  ];

  var CATEGORY_ICONS = {
    all: '<rect x="3" y="3" width="7" height="7" rx="1.2"/><rect x="14" y="3" width="7" height="7" rx="1.2"/><rect x="3" y="14" width="7" height="7" rx="1.2"/><rect x="14" y="14" width="7" height="7" rx="1.2"/>',

    // Alimentació: cistell de la compra (cos sòlid + nansa en arc).
    alimentacio: '<path d="M4.5 9.5h15l-1.5 8.7a1.8 1.8 0 0 1-1.8 1.5H7.8a1.8 1.8 0 0 1-1.8-1.5L4.5 9.5Z"/>' +
      '<path d="M8.5 9.5V7.3a3.5 3.5 0 0 1 7 0v2.2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',

    // Restauració: forquilla + ganivet, inconfusibles.
    restauracio: '<path d="M6 2v6a1.5 1.5 0 0 0 3 0V2" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M7.5 2v20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>' +
      '<path d="M16.7 2c-1.8 1-2.9 3-2.9 5.2 0 2 1 3.8 2.6 4.8" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M16.7 2v20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>',

    // Allotjaments: geometria SVG aprovada tal qual (viewBox propi
    // 0 0 178 240, vore CATEGORY_ICON_VIEWBOX) — no reescalar les
    // coordenades, només canviar el viewBox de l'<svg> contenidor.
    allotjaments: '<g fill="currentColor">' +
      '<path d="M30 91 Q30 85 36 85 Q42 85 42 91 L42 162 L30 162 Z"/>' +
      '<path d="M46 116 L46 105 Q46 99 52 99 L57 99 Q71 99 71 112 L71 116 Z"/>' +
      '<path d="M78 123 L78 122 Q78 113 93 113 L141 113 Q147 113 147 119 L147 123 Z"/>' +
      '<rect x="30" y="123" width="117" height="18"/>' +
      '<rect x="137" y="141" width="10" height="21"/>' +
      '</g>',

    // Construcció i instal·lacions: una única clau anglesa clàssica (boca
    // oberta en ganxo + mànec diagonal) — el glif de "clau"/"eina" estàndard,
    // inconfusible i llegible a 18-26px. (Es van provar versions amb dos
    // puntes rectangulars separades i amb anella al mànec: la primera es
    // llegia com un os/pesa i la segona com una clau de casa; aquest ganxo
    // continu és el que es distingeix clarament com a eina.)
    construccio: '<path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/>',

    // Serveis: maletí d'oficina/negocis.
    serveis: '<rect x="3" y="7.5" width="18" height="11" rx="2.2"/>' +
      '<path d="M8.5 7.5V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v1.5" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>',

    // Oci i esports: muntanya de doble pic, ara més alta/prominent dins
    // el mateix viewBox — silueta plana, sense brúixola ni estrela;
    // concepte recuperat d'una versió anterior (més clar per a "activitat
    // a l'aire lliure") i ampliat perquè es note tan fort com la resta.
    oci: '<path d="M2 19 L8.5 3.6 L12.6 11.16 L15.3 7.52 L22 19 Z"/>',

    // Altres: aparador amb tendal ratllat — inconfusible amb una casa/llit.
    altres: '<rect x="3" y="4" width="18" height="3.6" rx="0.6"/>' +
      '<path d="M3 7.6l1.5 3 1.5-3 1.5 3 1.5-3 1.5 3 1.5-3 1.5 3 1.5-3 1.5 3 1.5-3 1.5 3 1.5-3H3Z"/>' +
      '<rect x="4.3" y="12.4" width="15.4" height="7.4" rx="0.5" fill="none" stroke="currentColor" stroke-width="1.7"/>' +
      '<rect x="10" y="15" width="4" height="4.8" rx="0.4"/>'
  };

  // viewBox propi per a categories la geometria de les quals ve donada en
  // un sistema de coordenades diferent del 0 0 24 24 habitual (p. ex. una
  // icona aprovada externament). Per defecte totes usen 0 0 24 24.
  // Allotjaments: la geometria aprovada (paths+rects) ocupa només
  // x 30-147 / y 85-162 dins del viewBox original 0 0 178 240 — un
  // "retall" ajustat a eixe requadre (+ un xicotet marge) fa que el llit
  // òmpliga la icona igual que la resta de glifs, sense tocar cap
  // coordenada del path.
  var CATEGORY_ICON_VIEWBOX = {
    allotjaments: '25 80 127 87'
  };

  // Mapa de color exacte per categoria — colors institucionals de
  // sella.es (verd, roig, blau, groc) més dos tons nous i diferenciats
  // (porpra per a Oci, blau grisenc fosc per a Altres) perquè cada
  // categoria tinga ara una identitat de color única.
  var CATEGORY_COLORS = {
    all: '#106758',
    alimentacio: '#106758',
    restauracio: '#c20a01',
    allotjaments: '#2566d6',
    construccio: '#b38201',
    serveis: '#606060',
    oci: '#713f98',
    altres: '#3f5968'
  };

  // Centre aproximat del nucli urbà de Sella (Alacant), i vista per defecte

  var MAP_CENTER = [38.6089, -0.2734];
  var MAP_ZOOM = 15;

  var state = {
    businesses: [],
    activeCategory: 'all',
    searchTerm: '',
    map: null,
    cluster: null,
    markers: {},
    reduceMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
  };

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    renderFilters();
    bindControls();
    fetch(DATA_URL)
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (data) {
        state.businesses = (data.businesses || []).slice().sort(byNumberThenName);
        initMap();
        renderAll();
      })
      .catch(function (err) {
        var el = document.getElementById('sg-load-error');
        el.hidden = false;
        el.textContent = 'No s’han pogut carregar les dades dels comerços. Torna a carregar la pàgina d’ací a una estona.';
        document.getElementById('sg-summary').textContent = '';
        if (window.console) console.error(err);
      });
  }

  /* ---------- Utilitats ---------- */

  function byNumberThenName(a, b) {
    var an = a.map_id == null ? 9999 : a.map_id;
    var bn = b.map_id == null ? 9999 : b.map_id;
    if (an !== bn) return an - bn;
    return a.name.localeCompare(b.name, 'ca');
  }
  function isUnlocated(b) { return b.location_type === NO_FIXED_LOCATION; }
  function hasCoords(b) {
    return typeof b.latitude === 'number' && typeof b.longitude === 'number' &&
      isFinite(b.latitude) && isFinite(b.longitude);
  }
  function label(id) {
    for (var i = 0; i < CATEGORY_FILTERS.length; i++) if (CATEGORY_FILTERS[i].id === id) return CATEGORY_FILTERS[i].label;
    return id;
  }
  function color(id) { return CATEGORY_COLORS[id] || CATEGORY_COLORS.altres; }
  function icon(id) {
    return '<svg viewBox="' + (CATEGORY_ICON_VIEWBOX[id] || '0 0 24 24') + '" fill="currentColor" aria-hidden="true" focusable="false">' +
      (CATEGORY_ICONS[id] || CATEGORY_ICONS.altres) + '</svg>';
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function norm(s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
  function tel(p) { return 'tel:' + p.replace(/[^\d+]/g, ''); }
  function webHref(u) { return /^https?:\/\//i.test(u) ? u : 'https://' + u; }
  function igHandle(v) { return String(v).replace(/^@/, '').replace(/\/$/, ''); }
  function shortAddress(a) { return String(a || '').replace(/,?\s*03579\s*Sella\s*$/i, ''); }

  function filtered() {
    var term = norm(state.searchTerm.trim());
    return state.businesses.filter(function (b) {
      if (state.activeCategory !== 'all' && b.category !== state.activeCategory) return false;
      if (!term) return true;
      var hay = [b.name, label(b.category), b.address, b.phone, b.email, b.website, b.instagram].filter(Boolean).join(' ');
      return norm(hay).indexOf(term) !== -1;
    });
  }

  /* ---------- Categories ---------- */

  function renderFilters() {
    var box = document.getElementById('sg-filters');
    box.innerHTML = CATEGORY_FILTERS.map(function (f) {
      var active = f.id === state.activeCategory;
      return '<button type="button" class="sg2-cat' + (active ? ' is-active' : '') + '" data-category="' + f.id +
        '" aria-pressed="' + active + '" style="--accent:' + color(f.id) + '">' +
        '<span class="sg2-cat__icon' + (f.id === 'all' ? ' sg2-cat__icon--all' : '') + '">' + icon(f.id) + '</span>' +
        esc(f.label) + '</button>';
    }).join('');
  }

  /* ---------- Llistat ---------- */

  function renderAll() {
    var list = filtered();
    var located = list.filter(function (b) { return !isUnlocated(b); });
    var unlocated = list.filter(isUnlocated);

    renderSummary(list.length);
    renderGroups('sg-directory', located, true);
    renderGroups('sg-unlocated', unlocated, false);
    document.getElementById('sg-no-results').hidden = located.length !== 0;
    document.getElementById('sg-unlocated-empty').hidden = unlocated.length !== 0;
    renderMarkers(located);
  }

  function renderSummary(n) {
    var total = state.businesses.length;
    var el = document.getElementById('sg-summary');
    var filteredNow = state.activeCategory !== 'all' || state.searchTerm.trim();
    if (!filteredNow) {
      el.textContent = total + ' activitats a la guia.';
    } else if (n === 0) {
      el.textContent = 'Cap resultat.';
    } else {
      el.textContent = 'Mostrant ' + n + ' de ' + total + '.';
    }
  }

  function renderGroups(containerId, list, withNumbers) {
    var box = document.getElementById(containerId);
    var html = '';
    groupOrder().forEach(function (f) {
      var items = list.filter(function (b) { return b.category === f.id; });
      if (!items.length) return;
      html += '<div class="sg2-group" style="--accent:' + color(f.id) + '">' +
        '<h3 class="sg2-group__title"><span class="sg2-cat__icon">' + icon(f.id) + '</span>' + esc(f.label) + '</h3>' +
        '<ul class="sg2-rows">' + items.map(function (b) { return rowHtml(b, withNumbers); }).join('') + '</ul></div>';
    });
    box.innerHTML = html;
  }

  // Ordre dels grups = ordre del plànol imprés (número més baix de cada categoria).
  function groupOrder() {
    function minNum(id) {
      var n = 9999;
      state.businesses.forEach(function (b) { if (b.category === id && b.map_id != null && b.map_id < n) n = b.map_id; });
      return n;
    }
    return CATEGORY_FILTERS.filter(function (f) { return f.id !== 'all'; })
      .sort(function (a, b) { return minNum(a.id) - minNum(b.id); });
  }

  function rowHtml(b, withNumbers) {
    var num = withNumbers && b.map_id != null;
    var links = [];
    if (b.email) links.push('<li><a href="mailto:' + esc(b.email) + '">' + esc(b.email) + '</a></li>');
    if (b.website) links.push('<li><a href="' + esc(webHref(b.website)) + '" target="_blank" rel="noopener">Web</a></li>');
    if (b.instagram) links.push('<li><a href="https://www.instagram.com/' + esc(igHandle(b.instagram)) + '/" target="_blank" rel="noopener">Instagram</a></li>');
    if (hasCoords(b) && !isUnlocated(b)) links.push('<li><button type="button" class="sg2-maplink" data-map-target="' + esc(b.id) + '">Veure al mapa</button></li>');

    var phone = b.phone
      ? '<a class="sg2-row__phone" href="' + esc(tel(b.phone)) + '" aria-label="Telefonar a ' + esc(b.name) + ': ' + esc(b.phone) + '">' + esc(b.phone) + '</a>'
      : '';

    return '<li class="sg2-row' + (num ? '' : ' sg2-row--nonum') + '" id="sg-row-' + esc(b.id) + '"' +
      (hasCoords(b) && !isUnlocated(b) ? ' data-biz-id="' + esc(b.id) + '"' : '') + '>' +
      (num ? '<span class="sg2-num" aria-label="Número ' + b.map_id + ' del plànol">' + b.map_id + '</span>' : '') +
      '<div><p class="sg2-row__name">' + esc(b.name) + '</p>' +
      (b.address && !isUnlocated(b) ? '<p class="sg2-row__addr">' + esc(shortAddress(b.address)) + '</p>' : '') +
      '</div>' +
      '<div class="sg2-row__contact">' + phone +
      (links.length ? '<ul class="sg2-row__links">' + links.join('') + '</ul>' : '') +
      '</div></li>';
  }

  /* ---------- Controls ---------- */

  function bindControls() {
    document.getElementById('sg-filters').addEventListener('click', function (e) {
      var btn = e.target.closest('.sg2-cat');
      if (!btn) return;
      state.activeCategory = btn.dataset.category;
      renderFilters();
      renderAll();
    });
    document.getElementById('sg-search').addEventListener('input', function (e) {
      state.searchTerm = e.target.value;
      renderAll();
    });
    var dir = document.getElementById('sg-directory');
    dir.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-map-target]');
      if (btn) showOnMap(btn.getAttribute('data-map-target'));
    });
    ['mouseover', 'focusin'].forEach(function (ev) { dir.addEventListener(ev, function (e) { hover(e, true); }); });
    ['mouseout', 'focusout'].forEach(function (ev) { dir.addEventListener(ev, function (e) { hover(e, false); }); });
  }

  function hover(e, on) {
    var row = e.target.closest('.sg2-row[data-biz-id]');
    if (!row) return;
    var m = state.markers[row.dataset.bizId];
    var el = m && m.getElement();
    if (el) el.classList.toggle('sg2-marker--active', on);
  }

  /* ---------- Mapa ---------- */

  function initMap() {
    var mapEl = document.getElementById('sg-map');
    var note = document.getElementById('sg-map-note');
    if (!window.L) {
      mapEl.hidden = true;
      note.hidden = false;
      note.textContent = 'El mapa no s’ha pogut carregar. Tots els comerços són al llistat de més avall.';
      return;
    }
    var cfg = window.SG_BASEMAPS || { keyless: [] };
    var layers = {};
    var first = null;
    (cfg.keyless || []).forEach(function (d) {
      var l = L.tileLayer(d.url, d.options);
      layers[d.label] = l;
      if (!first) first = l;
    });
    state.map = L.map(mapEl, { center: MAP_CENTER, zoom: MAP_ZOOM, layers: first ? [first] : [], scrollWheelZoom: false });
    if (Object.keys(layers).length > 1) L.control.layers(layers, null, { collapsed: true }).addTo(state.map);

    state.cluster = L.markerClusterGroup({
      maxClusterRadius: 30,
      disableClusteringAtZoom: 17,
      showCoverageOnHover: false,
      iconCreateFunction: function (c) {
        var n = c.getChildCount();
        return L.divIcon({ className: '', html: '<span class="sg2-cluster" style="width:34px;height:34px">' + n + '</span>', iconSize: [34, 34] });
      }
    });
    state.map.addLayer(state.cluster);
  }

  function renderMarkers(list) {
    if (!state.map) return;
    state.cluster.clearLayers();
    state.markers = {};
    var valid = list.filter(hasCoords);
    valid.forEach(function (b) {
      var m = L.marker([b.latitude, b.longitude], {
        icon: L.divIcon({
          className: '',
          html: '<span class="sg2-pin" style="background:' + color(b.category) + '">' + (b.map_id != null ? b.map_id : '') + '</span>',
          iconSize: [28, 28],
          iconAnchor: [14, 14],
          popupAnchor: [0, -14]
        }),
        title: b.name
      }).bindPopup(popupHtml(b), { maxWidth: 260 });
      state.cluster.addLayer(m);
      state.markers[b.id] = m;
    });

    if (valid.length > 1) {
      state.map.fitBounds(L.latLngBounds(valid.map(function (b) { return [b.latitude, b.longitude]; })),
        { padding: [40, 40], maxZoom: 17, animate: !state.reduceMotion });
    } else if (valid.length === 1) {
      state.map.setView([valid[0].latitude, valid[0].longitude], 17, { animate: !state.reduceMotion });
    } else {
      state.map.setView(MAP_CENTER, MAP_ZOOM);
    }
  }

  function popupHtml(b) {
    var dir = 'https://www.google.com/maps/dir/?api=1&destination=' + b.latitude + ',' + b.longitude;
    return '<div class="sg2-pop">' +
      '<p class="sg2-pop__name">' + esc(b.name) + '</p>' +
      '<p class="sg2-pop__cat">' + esc(label(b.category)) + '</p>' +
      (b.address ? '<p>' + esc(shortAddress(b.address)) + '</p>' : '') +
      (b.phone ? '<p><a href="' + esc(tel(b.phone)) + '">' + esc(b.phone) + '</a></p>' : '') +
      '<p><a href="' + esc(dir) + '" target="_blank" rel="noopener">Com arribar</a></p></div>';
  }

  function showOnMap(id) {
    var m = state.markers[id];
    if (!m) return;
    document.querySelector('.sg2-map-wrap').scrollIntoView({ behavior: state.reduceMotion ? 'auto' : 'smooth', block: 'center' });
    state.cluster.zoomToShowLayer(m, function () { m.openPopup(); });
  }
})();
