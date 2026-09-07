/*
 * Guia de comerços, empreses i serveis de Sella
 * JavaScript vanilla. Tota la informació mostrada prové exclusivament de
 * data/comercos.json — aquest fitxer no conté cap dada comercial pròpia.
 */
(function () {
  'use strict';

  var DATA_URL = 'data/comercos.json';
  var NO_FIXED_LOCATION = 'no_fixed_public_location';

  // Etiquetes i ordre dels filtres, tal com s'han definit per a la interfície.
  // L'id de cada filtre ha de coincidir amb un id de categoria del JSON.
  var CATEGORY_FILTERS = [
    { id: 'all', label: 'Totes' },
    { id: 'alimentacio', label: 'Alimentació' },
    { id: 'restauracio', label: 'Restauració' },
    { id: 'allotjaments', label: 'Allotjaments' },
    { id: 'construccio', label: 'Construcció i instal·lacions' },
    { id: 'serveis', label: 'Serveis' },
    { id: 'oci', label: 'Oci i esports' },
    { id: 'altres', label: 'Altres' }
  ];

  // Centre aproximat del nucli urbà de Sella (Alacant), només per orientar
  // la vista inicial del mapa mentre no hi ha coordenades validades.
  var MAP_CENTER = [-0.2722, 38.6081];
  var MAP_ZOOM = 14;

  var BASEMAP_STYLES = {
    light: rasterStyle(
      ['https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'],
      '© OpenStreetMap contributors © CARTO'
    ),
    streets: rasterStyle(
      ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      '© OpenStreetMap contributors'
    ),
    terrain: rasterStyle(
      [
        'https://a.tile.opentopomap.org/{z}/{x}/{y}.png',
        'https://b.tile.opentopomap.org/{z}/{x}/{y}.png',
        'https://c.tile.opentopomap.org/{z}/{x}/{y}.png'
      ],
      '© OpenStreetMap contributors, SRTM © OpenTopoMap (CC-BY-SA)',
      17
    )
  };

  var state = {
    businesses: [],
    categoryLabels: {},
    activeCategory: 'all',
    searchTerm: '',
    map: null,
    markers: {},
    reduceMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
  };

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    renderFilters();
    bindControls();

    loadData()
      .then(function (data) {
        state.businesses = data.businesses || [];
        state.categoryLabels = buildCategoryLabels(data.categories || []);
        renderAll();
        initMap();
      })
      .catch(showLoadError);
  }

  function loadData() {
    return fetch(DATA_URL).then(function (res) {
      if (!res.ok) {
        throw new Error('No s’han pogut carregar les dades (' + res.status + ')');
      }
      return res.json();
    });
  }

  function showLoadError(err) {
    var errorEl = document.getElementById('sg-load-error');
    var summaryEl = document.getElementById('sg-summary');
    if (errorEl) {
      errorEl.hidden = false;
      errorEl.textContent = 'No s’han pogut carregar les dades de comerços. Torna-ho a provar més tard.';
    }
    if (summaryEl) {
      summaryEl.textContent = '';
    }
    if (window.console && console.error) {
      console.error(err);
    }
  }

  function buildCategoryLabels(categories) {
    var map = {};
    categories.forEach(function (c) {
      map[c.id] = c.label;
    });
    // Les etiquetes curtes definides per a la interfície tenen prioritat
    // visual sobre les etiquetes llargues del JSON.
    CATEGORY_FILTERS.forEach(function (f) {
      if (f.id !== 'all') {
        map[f.id] = f.label;
      }
    });
    return map;
  }

  /* ---------- Utilitats de dades ---------- */

  function isNoFixedLocation(b) {
    return b.location_type === NO_FIXED_LOCATION;
  }

  function hasValidCoords(b) {
    return typeof b.latitude === 'number' && typeof b.longitude === 'number' &&
      isFinite(b.latitude) && isFinite(b.longitude);
  }

  function getCategoryLabel(id) {
    return state.categoryLabels[id] || id;
  }

  function normalizeText(str) {
    return String(str || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  function getSearchableText(b) {
    return [
      b.name,
      getCategoryLabel(b.category),
      b.address,
      b.phone,
      b.email,
      b.website,
      b.instagram
    ].filter(Boolean).join(' ');
  }

  function telHref(phone) {
    return 'tel:' + phone.replace(/[^\d+]/g, '');
  }

  function displayUrl(url) {
    return String(url).replace(/^https?:\/\//i, '').replace(/\/$/, '');
  }

  function websiteHref(url) {
    return /^https?:\/\//i.test(url) ? url : 'https://' + url;
  }

  function instagramHandle(value) {
    return String(value).replace(/^@/, '').replace(/\/$/, '');
  }

  function instagramUrl(value) {
    return 'https://www.instagram.com/' + instagramHandle(value) + '/';
  }

  function directionsUrl(b) {
    return 'https://www.google.com/maps/dir/?api=1&destination=' + b.latitude + ',' + b.longitude;
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }

  // Camps a mostrar (categoria i nom es gestionen a banda, com a capçalera).
  function getBusinessFields(b) {
    var fields = [];

    if (isNoFixedLocation(b)) {
      fields.push({ label: null, value: 'Servei sense lloc fix d’atenció al públic' });
    } else if (b.address) {
      fields.push({ label: 'Adreça', value: b.address });
    }

    if (b.phone) fields.push({ label: 'Telèfon', value: b.phone });
    if (b.email) fields.push({ label: 'Email', value: b.email });
    if (b.website) fields.push({ label: 'Web', value: displayUrl(b.website) });
    if (b.instagram) fields.push({ label: 'Instagram', value: '@' + instagramHandle(b.instagram) });

    return fields;
  }

  // opts.directions -> afig "Com arribar" (popup del mapa)
  // opts.showOnMapButton -> afig "Veure al mapa" (targeta del directori)
  function getBusinessActions(b, opts) {
    opts = opts || {};
    var actions = [];

    if (b.phone) actions.push({ type: 'link', href: telHref(b.phone), label: 'Telefonar' });
    if (b.email) actions.push({ type: 'link', href: 'mailto:' + b.email, label: 'Correu' });
    if (b.website) actions.push({ type: 'link', href: websiteHref(b.website), label: 'Web', external: true });
    if (b.instagram) actions.push({ type: 'link', href: instagramUrl(b.instagram), label: 'Instagram', external: true });

    if (opts.directions && hasValidCoords(b)) {
      actions.push({ type: 'link', href: directionsUrl(b), label: 'Com arribar', external: true });
    }
    if (opts.showOnMapButton && hasValidCoords(b)) {
      actions.push({ type: 'button', mapTarget: b.id, label: 'Veure al mapa' });
    }

    return actions;
  }

  function renderFieldsHtml(fields, className) {
    className = className || 'sg-fields';
    if (!fields.length) return '';
    var items = fields.map(function (f) {
      if (f.label) {
        return '<li class="' + className + '__item"><span class="' + className + '__label">' +
          escapeHtml(f.label) + '</span><span class="' + className + '__value">' +
          escapeHtml(f.value) + '</span></li>';
      }
      return '<li class="' + className + '__item ' + className + '__item--note">' + escapeHtml(f.value) + '</li>';
    }).join('');
    return '<ul class="' + className + '">' + items + '</ul>';
  }

  function renderActionsHtml(actions) {
    return actions.map(function (a) {
      if (a.type === 'button') {
        return '<button type="button" class="sg-action" data-map-target="' +
          escapeHtml(a.mapTarget) + '">' + escapeHtml(a.label) + '</button>';
      }
      var target = a.external ? ' target="_blank" rel="noopener noreferrer"' : '';
      return '<a class="sg-action" href="' + escapeHtml(a.href) + '"' + target + '>' + escapeHtml(a.label) + '</a>';
    }).join('');
  }

  /* ---------- Filtratge ---------- */

  function getFilteredBusinesses() {
    var term = normalizeText(state.searchTerm.trim());
    return state.businesses.filter(function (b) {
      if (state.activeCategory !== 'all' && b.category !== state.activeCategory) return false;
      if (!term) return true;
      return normalizeText(getSearchableText(b)).indexOf(term) !== -1;
    });
  }

  /* ---------- Render ---------- */

  function renderFilters() {
    var container = document.getElementById('sg-filters');
    container.innerHTML = '';
    CATEGORY_FILTERS.forEach(function (f) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'sg-filter' + (f.id === state.activeCategory ? ' is-active' : '');
      btn.dataset.category = f.id;
      btn.setAttribute('aria-pressed', f.id === state.activeCategory ? 'true' : 'false');
      btn.textContent = f.label;
      container.appendChild(btn);
    });
  }

  function updateFilterButtons() {
    var buttons = document.querySelectorAll('#sg-filters .sg-filter');
    buttons.forEach(function (btn) {
      var active = btn.dataset.category === state.activeCategory;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  function renderAll() {
    var filtered = getFilteredBusinesses();
    renderSummary(filtered);
    renderNoResults(filtered);
    renderAccordion(filtered.filter(isNoFixedLocation));
    renderDirectory(filtered);
    renderMapMarkers(filtered);
  }

  function renderSummary(list) {
    var el = document.getElementById('sg-summary');
    var total = list.length;
    if (total === 0) {
      el.textContent = '0 activitats';
      return;
    }
    var withLocation = list.filter(function (b) { return !isNoFixedLocation(b); }).length;
    var withoutLocation = total - withLocation;
    el.textContent = total + (total === 1 ? ' activitat' : ' activitats') +
      ' · ' + withLocation + ' amb localització · ' + withoutLocation + ' sense localització fixa';
  }

  function renderNoResults(list) {
    var el = document.getElementById('sg-no-results');
    el.hidden = list.length !== 0;
  }

  function renderAccordion(list) {
    var container = document.getElementById('sg-accordion');
    container.innerHTML = '';

    if (list.length === 0) {
      var empty = document.createElement('p');
      empty.className = 'sg-guia__empty-note';
      empty.textContent = 'No hi ha serveis sense localització fixa amb aquests criteris.';
      container.appendChild(empty);
      return;
    }

    list.forEach(function (b) {
      var details = document.createElement('details');
      details.className = 'sg-accordion__item';
      details.id = 'sg-accordion-' + b.id;

      var summary = document.createElement('summary');
      summary.className = 'sg-accordion__summary';
      summary.innerHTML = '<span class="sg-accordion__name">' + escapeHtml(b.name) + '</span>' +
        '<span class="sg-accordion__category">' + escapeHtml(getCategoryLabel(b.category)) + '</span>';
      details.appendChild(summary);

      var body = document.createElement('div');
      body.className = 'sg-accordion__body';
      var fields = getBusinessFields(b);
      var actions = getBusinessActions(b, {});
      body.innerHTML = renderFieldsHtml(fields, 'sg-accordion__fields') +
        (actions.length ? '<div class="sg-accordion__actions">' + renderActionsHtml(actions) + '</div>' : '');
      details.appendChild(body);

      container.appendChild(details);
    });
  }

  function renderDirectory(list) {
    var container = document.getElementById('sg-directory');
    container.innerHTML = '';

    list.forEach(function (b) {
      var article = document.createElement('article');
      article.className = 'sg-card';
      article.id = 'sg-card-' + b.id;
      article.setAttribute('role', 'listitem');

      var fields = getBusinessFields(b);
      var actions = getBusinessActions(b, { showOnMapButton: true });

      article.innerHTML =
        '<p class="sg-card__eyebrow">' + escapeHtml(getCategoryLabel(b.category)) + '</p>' +
        '<h3 class="sg-card__name">' + escapeHtml(b.name) + '</h3>' +
        renderFieldsHtml(fields, 'sg-card__fields') +
        (actions.length ? '<div class="sg-card__actions">' + renderActionsHtml(actions) + '</div>' : '');

      container.appendChild(article);
    });
  }

  function bindControls() {
    document.getElementById('sg-filters').addEventListener('click', function (e) {
      var btn = e.target.closest('.sg-filter');
      if (!btn) return;
      state.activeCategory = btn.dataset.category;
      updateFilterButtons();
      renderAll();
    });

    document.getElementById('sg-search').addEventListener('input', function (e) {
      state.searchTerm = e.target.value;
      renderAll();
    });

    document.getElementById('sg-directory').addEventListener('click', function (e) {
      var btn = e.target.closest('[data-map-target]');
      if (!btn) return;
      showOnMap(btn.getAttribute('data-map-target'));
    });
  }

  /* ---------- Mapa (MapLibre GL JS) ---------- */

  function rasterStyle(tiles, attribution, maxzoom) {
    return {
      version: 8,
      sources: {
        'sg-raster': {
          type: 'raster',
          tiles: tiles,
          tileSize: 256,
          attribution: attribution,
          maxzoom: maxzoom || 19
        }
      },
      layers: [
        { id: 'sg-raster-layer', type: 'raster', source: 'sg-raster' }
      ]
    };
  }

  function getAccentColor() {
    var value = getComputedStyle(document.getElementById('sg-guia')).getPropertyValue('--sg-accent');
    return value ? value.trim() : '#0b5fa5';
  }

  function initMap() {
    var mapEl = document.getElementById('sg-map');
    var noteEl = document.getElementById('sg-map-note');
    var basemapSelect = document.getElementById('sg-basemap');

    if (!window.maplibregl) {
      mapEl.hidden = true;
      noteEl.hidden = false;
      noteEl.textContent = 'El mapa no s’ha pogut carregar. Pots consultar totes les activitats al directori de més avall.';
      return;
    }

    state.map = new maplibregl.Map({
      container: mapEl,
      style: BASEMAP_STYLES.light,
      center: MAP_CENTER,
      zoom: MAP_ZOOM,
      attributionControl: true
    });

    state.map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

    state.map.on('load', function () {
      renderMapMarkers(getFilteredBusinesses());
    });

    if (basemapSelect) {
      basemapSelect.addEventListener('change', function () {
        var style = BASEMAP_STYLES[basemapSelect.value] || BASEMAP_STYLES.light;
        state.map.setStyle(style);
        state.map.once('styledata', function () {
          renderMapMarkers(getFilteredBusinesses());
        });
      });
    }
  }

  function renderMapMarkers(list) {
    if (!state.map) return;

    Object.keys(state.markers).forEach(function (id) {
      state.markers[id].marker.remove();
    });
    state.markers = {};

    var validList = list.filter(hasValidCoords);
    var accentColor = getAccentColor();

    validList.forEach(function (b) {
      var popup = new maplibregl.Popup({ offset: 24, maxWidth: '280px' }).setHTML(buildPopupHtml(b));
      var marker = new maplibregl.Marker({ color: accentColor })
        .setLngLat([b.longitude, b.latitude])
        .setPopup(popup)
        .addTo(state.map);
      state.markers[b.id] = { marker: marker, popup: popup };
    });

    var noteEl = document.getElementById('sg-map-note');
    if (!noteEl) return;

    if (validList.length === 0) {
      noteEl.hidden = false;
      noteEl.textContent = 'Les ubicacions dels comerços estan pendents de validació per l’Ajuntament. ' +
        'Mentrestant, pots consultar totes les dades al directori de més avall.';
    } else {
      noteEl.hidden = true;
    }
  }

  function buildPopupHtml(b) {
    var fields = getBusinessFields(b);
    var actions = getBusinessActions(b, { directions: true });
    return '<div class="sg-popup">' +
      '<p class="sg-popup__eyebrow">' + escapeHtml(getCategoryLabel(b.category)) + '</p>' +
      '<h3 class="sg-popup__name">' + escapeHtml(b.name) + '</h3>' +
      renderFieldsHtml(fields, 'sg-popup__fields') +
      (actions.length ? '<div class="sg-popup__actions">' + renderActionsHtml(actions) + '</div>' : '') +
      '</div>';
  }

  function showOnMap(id) {
    var entry = state.markers[id];
    var mapWrap = document.querySelector('.sg-guia__map-wrap');
    if (!entry || !state.map || !mapWrap) return;

    mapWrap.scrollIntoView({ behavior: state.reduceMotion ? 'auto' : 'smooth', block: 'start' });

    window.requestAnimationFrame(function () {
      var target = { center: entry.marker.getLngLat(), zoom: Math.max(state.map.getZoom(), 16) };
      if (state.reduceMotion) {
        state.map.jumpTo(target);
      } else {
        state.map.flyTo(target);
      }
      if (!entry.popup.isOpen()) {
        entry.marker.togglePopup();
      }
    });
  }
})();
