/*
 * Guia de comerços, empreses i serveis de Sella
 * JavaScript vanilla. Tota la informació mostrada prové exclusivament de
 * data/comercos.json — aquest fitxer no conté cap dada comercial pròpia.
 */
(function () {
  'use strict';

  var DATA_URL = '../data/comercos.json';
  var NO_FIXED_LOCATION = 'no_fixed_public_location';
  var NO_FIXED_BADGE_TEXT = 'Sense localització fixa';
  var NO_FIXED_SENTENCE_TEXT = 'Servei sense lloc fix d’atenció al públic';

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

  // Icones decoratives per categoria (SVG inline, sense emoji). El nom de la
  // categoria ja apareix sempre com a text, així que la icona és només suport
  // visual. Dissenyades per a llegir-se en BLANC sòlid sobre un cercle de
  // color de categoria (navegació, targetes i marcadors del mapa comparteixen
  // el mateix sistema): la majoria de formes són siluetes planes
  // (fill="currentColor"); només els detalls lineals (forquilla/ganivet,
  // nansa del cistell, anella de la clau anglesa, agulla de la brúixola)
  // usen un trac fi (fill="none" stroke="currentColor").
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
  // quan cap activitat visible té coordenades (vista general del poble).
  var MAP_CENTER = [38.6089, -0.2734];
  var MAP_ZOOM = 15;
  var VILLAGE_CENTER = [38.6092, -0.2738]; // vista inicial: nucli urbà de Sella
  var NEIGHBOURHOOD_ZOOM = 16; // zoom aplicat quan només hi ha un marcador visible
  var FIT_BOUNDS_MAX_ZOOM = 17; // evita un zoom excessiu quan els punts són molt pròxims

  var state = {
    businesses: [],
    categoryLabels: {},
    activeCategory: 'all',
    searchTerm: '',
    map: null,
    markerClusterGroup: null,
    markers: {}, // id de negoci -> L.Marker
    reduceMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
  };

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    renderFilters();
    bindControls();
    initLayoutV3();

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
    // Font principal: full de Google (js/data-source.js); DATA_URL és la
    // còpia de seguretat si el full no es pot llegir.
    if (window.SG_loadData) return window.SG_loadData(DATA_URL);
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

  // Per defecte les formes són siluetes planes (fill=currentColor); els
  // elements que necessiten un traç fi (forquilla, nansa, agulla...)
  // declaren el seu propi fill="none" stroke="currentColor" dins del path.
  function getCategoryIconSvg(id) {
    var path = CATEGORY_ICONS[id] || CATEGORY_ICONS.altres;
    var viewBox = CATEGORY_ICON_VIEWBOX[id] || '0 0 24 24';
    return '<svg viewBox="' + viewBox + '" fill="currentColor" stroke="none" ' +
      'aria-hidden="true" focusable="false">' + path + '</svg>';
  }

  // Color exacte de categoria (paleta municipal fixa, sense variants
  // generades). `all` torna el verd institucional; qualsevol categoria
  // desconeguda cau al gris neutre.
  function getCategoryColor(id) {
    return CATEGORY_COLORS[id] || CATEGORY_COLORS.altres;
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

  // Un registre pot tindre diversos telèfons separats per «/».
  function splitPhones(phone) {
    return String(phone || '').split('/').map(function (p) { return p.trim(); }).filter(Boolean);
  }

  function telHref(phone) {
    return 'tel:' + splitPhones(phone)[0].replace(/[^\d+]/g, '');
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

  // Línia d'adreça: text pla si n'hi ha, o insígnia si el servei no té
  // localització fixa. `sentence` mostra la frase completa (acordió); si no,
  // s'usa el text curt de la insígnia (targeta).
  function getAddressInfo(b, sentence) {
    if (isNoFixedLocation(b)) {
      return { badge: true, text: sentence ? NO_FIXED_SENTENCE_TEXT : NO_FIXED_BADGE_TEXT };
    }
    if (b.address) {
      return { badge: false, text: b.address };
    }
    return null;
  }

  // opts.directions -> afig "Com arribar" (popup del mapa)
  // opts.showOnMapButton -> afig "Veure al mapa" (targeta del directori)
  function getBusinessActions(b, opts) {
    opts = opts || {};
    var actions = [];

    // Totes les accions de contacte comparteixen el mateix llenguatge neutre
    // ("secondary"); "Veure al mapa" és l'única amb accent institucional
    // ("map"), perquè és l'acció pròpia i més rellevant de la guia.
    if (b.phone) actions.push({ type: 'link', href: telHref(b.phone), label: 'Telefonar', variant: 'secondary' });
    if (b.email) actions.push({ type: 'link', href: 'mailto:' + b.email, label: 'Correu', variant: 'secondary' });
    if (b.website) actions.push({ type: 'link', href: websiteHref(b.website), label: 'Web', external: true, variant: 'secondary' });
    if (b.instagram) actions.push({ type: 'link', href: instagramUrl(b.instagram), label: 'Instagram', external: true, variant: 'secondary' });

    if (opts.directions && hasValidCoords(b)) {
      actions.push({ type: 'link', href: directionsUrl(b), label: 'Com arribar', external: true, variant: 'secondary' });
    }
    if (opts.showOnMapButton && hasValidCoords(b)) {
      actions.push({ type: 'button', mapTarget: b.id, label: 'Veure al mapa', variant: 'map' });
    }

    return actions;
  }

  function renderAddressHtml(info, className) {
    if (!info) return '';
    if (info.badge) {
      return '<p class="' + className + '"><span class="sg-badge sg-badge--no-location">' + escapeHtml(info.text) + '</span></p>';
    }
    return '<p class="' + className + '">' + escapeHtml(info.text) + '</p>';
  }

  // Línies de contacte visibles (telèfon, correu, web): sempre en text
  // seleccionable/enllaçable, a més del botó d'acció corresponent — la
  // duplicació text+botó és intencionada, no s'ha de simplificar.
  // Instagram mai apareix ací com a text: només com a botó.
  function getContactLines(b) {
    var lines = [];
    splitPhones(b.phone).forEach(function (p) { lines.push({ href: telHref(p), text: p }); });
    if (b.email) lines.push({ href: 'mailto:' + b.email, text: b.email });
    if (b.website) lines.push({ href: websiteHref(b.website), text: displayUrl(b.website), external: true });
    return lines;
  }

  function renderContactLinesHtml(lines, className) {
    if (!lines.length) return '';
    return '<ul class="' + className + '">' + lines.map(function (l) {
      var target = l.external ? ' target="_blank" rel="noopener noreferrer"' : '';
      return '<li><a href="' + escapeHtml(l.href) + '"' + target + '>' + escapeHtml(l.text) + '</a></li>';
    }).join('') + '</ul>';
  }

  // v3: icona davant de cada acció (traç fi, currentColor).
  var ACTION_ICONS = {
    'Telefonar': '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
    'Correu': '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    'Web': '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    'Instagram': '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".6" fill="currentColor"/>',
    'Com arribar': '<path d="M3 11 21 3l-8 18-2-8-8-2Z"/>',
    'Veure al mapa': '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/>'
  };
  function actionIcon(label) {
    var p = ACTION_ICONS[label];
    return p ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + p + '</svg>' : '';
  }

  function renderActionsHtml(actions) {
    return actions.map(function (a) {
      var variantClass = ' sg-action--' + (a.variant === 'map' ? 'map' : 'secondary');
      if (a.type === 'button') {
        return '<button type="button" class="sg-action' + variantClass + '" data-map-target="' +
          escapeHtml(a.mapTarget) + '">' + actionIcon(a.label) + escapeHtml(a.label) + '</button>';
      }
      var target = a.external ? ' target="_blank" rel="noopener noreferrer"' : '';
      return '<a class="sg-action' + variantClass + '" href="' + escapeHtml(a.href) + '"' + target + '>' + actionIcon(a.label) + escapeHtml(a.label) + '</a>';
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

  // Activitats amb localització fixa que compleixen els filtres actius: és
  // l'únic conjunt que ha d'aparèixer al mapa i al directori principal.
  function getLocatedFilteredBusinesses() {
    return getFilteredBusinesses().filter(function (b) { return !isNoFixedLocation(b); });
  }

  /* ---------- Render ---------- */

  // Navegació de categories a l'estil de les dreceres municipals de
  // sella.es: icona + nom, sense píndola ni fons — l'estat actiu es marca
  // amb una vora inferior sòlida en el mateix color de categoria.
  function renderFilters() {
    var container = document.getElementById('sg-filters');
    container.innerHTML = '';
    CATEGORY_FILTERS.forEach(function (f) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'sg-catnav__item' + (f.id === state.activeCategory ? ' is-active' : '');
      btn.dataset.category = f.id;
      btn.style.setProperty('--sg-catnav-accent', getCategoryColor(f.id));
      btn.setAttribute('aria-pressed', f.id === state.activeCategory ? 'true' : 'false');
      // "Totes" no és una categoria real: s'hi distingeix amb un anell
      // (fons blanc + vora verda) en compte del cercle sòlid de les
      // categories pròpies, mantenint el mateix verd institucional.
      var iconClass = 'sg-catnav__icon' + (f.id === 'all' ? ' sg-catnav__icon--ring' : '');
      btn.innerHTML =
        '<span class="' + iconClass + '">' + getCategoryIconSvg(f.id) + '</span>' +
        '<span class="sg-catnav__label">' + escapeHtml(f.label) + '</span>';
      container.appendChild(btn);
    });
  }

  function updateFilterButtons() {
    var buttons = document.querySelectorAll('#sg-filters .sg-catnav__item');
    buttons.forEach(function (btn) {
      var active = btn.dataset.category === state.activeCategory;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  function renderAll() {
    var filtered = getFilteredBusinesses();
    // El directori principal ("Activitats amb localització") i la secció
    // d'activitats sense localització fixa són conjunts disjunts: cada
    // activitat apareix en un i només un dels dos, mai en tots dos alhora.
    var unlocated = filtered.filter(isNoFixedLocation);
    var located = filtered.filter(function (b) { return !isNoFixedLocation(b); });

    renderSummary(filtered);
    renderNoResults(located);
    renderDirectory(located);
    renderUnlocated(unlocated);
    renderMapMarkers(located);
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

  // Constructor de targeta compartit pel directori principal i per la
  // secció d'activitats sense localització fixa (mateix sistema visual).
  function buildCardEl(b) {
    var article = document.createElement('article');
    article.className = 'sg-card';
    article.id = 'sg-card-' + b.id;
    article.setAttribute('role', 'listitem');
    article.style.setProperty('--sg-card-accent', getCategoryColor(b.category));
    if (hasValidCoords(b)) {
      article.dataset.bizId = b.id;
    }

    var addressInfo = getAddressInfo(b, false);
    var actions = getBusinessActions(b, { showOnMapButton: true });
    var contactLines = getContactLines(b);

    // Foto de l'activitat (columna «Foto» del full). Sense foto: franja amb
    // la icona de la categoria, perquè totes les targetes tinguen la mateixa forma.
    var photoHtml = b.photo
      ? '<div class="sg-card__photo"><img src="' + escapeHtml(b.photo) + '" alt="" loading="lazy" decoding="async" ' +
        'onerror="this.parentNode.classList.add(\'sg-card__photo--empty\');this.remove();"></div>'
      : '<div class="sg-card__photo sg-card__photo--empty" aria-hidden="true"></div>';
    article.classList.add('sg-card--with-photo');

    article.innerHTML =
      photoHtml +
      '<div class="sg-card__top">' +
      '<span class="sg-card__icon">' + getCategoryIconSvg(b.category) + '</span>' +
      '<div class="sg-card__heading">' +
      '<p class="sg-card__eyebrow">' + escapeHtml(getCategoryLabel(b.category)) + '</p>' +
      '<h3 class="sg-card__name">' + escapeHtml(b.name) + '</h3>' +
      '</div></div>' +
      (b.notice ? '<p class="sg-card__address"><span class="sg-badge sg-badge--notice">' + escapeHtml(b.notice) + '</span></p>' : '') +
      renderAddressHtml(addressInfo, 'sg-card__address') +
      renderContactLinesHtml(contactLines, 'sg-card__meta') +
      (actions.length ? '<div class="sg-card__actions">' + renderActionsHtml(actions) + '</div>' : '');

    return article;
  }

  function renderDirectory(list) {
    var container = document.getElementById('sg-directory');
    container.innerHTML = '';
    list.forEach(function (b) {
      container.appendChild(buildCardEl(b));
    });
  }

  function renderUnlocated(list) {
    var container = document.getElementById('sg-unlocated');
    var emptyEl = document.getElementById('sg-unlocated-empty');
    container.innerHTML = '';
    emptyEl.hidden = list.length !== 0;
    list.forEach(function (b) {
      container.appendChild(buildCardEl(b));
    });
  }

  function bindControls() {
    document.getElementById('sg-filters').addEventListener('click', function (e) {
      var btn = e.target.closest('.sg-catnav__item');
      if (!btn) return;
      state.activeCategory = btn.dataset.category;
      updateFilterButtons();
      renderAll();
    });

    document.getElementById('sg-search').addEventListener('input', function (e) {
      state.searchTerm = e.target.value;
      renderAll();
    });

    ['sg-directory', 'sg-unlocated'].forEach(function (id) {
      var container = document.getElementById(id);

      container.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-map-target]');
        if (!btn) return;
        showOnMap(btn.getAttribute('data-map-target'));
      });

      // Ressalta subtilment el marcador corresponent quan es passa el ratolí
      // o el focus per damunt d'una targeta amb localització.
      container.addEventListener('mouseover', function (e) { handleCardHover(e, true); });
      container.addEventListener('mouseout', function (e) { handleCardHover(e, false); });
      container.addEventListener('focusin', function (e) { handleCardHover(e, true); });
      container.addEventListener('focusout', function (e) { handleCardHover(e, false); });
    });
  }

  function handleCardHover(e, active) {
    var card = e.target.closest('.sg-card[data-biz-id]');
    if (!card) return;
    setMarkerHighlight(card.dataset.bizId, active);
  }

  function setMarkerHighlight(id, active) {
    var entry = state.markers[id];
    if (!entry) return;
    var el = entry.getElement();
    if (el) el.classList.toggle('sg-marker-icon--active', active);
  }

  /* ---------- Mapa (Leaflet + Leaflet.markercluster) ---------- */

  // Marcador de Leaflet: cercle sòlid en el color exacte de categoria amb
  // el mateix glif SVG de categoria en blanc a dins (currentColor: #fff).
  function buildMarkerIcon(category) {
    var color = getCategoryColor(category);
    return L.divIcon({
      className: 'sg-marker-icon',
      html: '<span class="sg-marker-icon__pin" style="background:' + escapeHtml(color) + '">' +
        getCategoryIconSvg(category) + '</span>',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -18]
    });
  }

  function clusterIconCreateFunction(cluster) {
    var count = cluster.getChildCount();
    var size = count < 10 ? 34 : (count < 25 ? 40 : 46);
    return L.divIcon({
      className: 'sg-cluster-icon',
      html: '<span class="sg-cluster-icon__badge" style="width:' + size + 'px;height:' + size + 'px">' + count + '</span>',
      iconSize: [size, size]
    });
  }

  // Construeix les capes base a partir de la configuració centralitzada de
  // js/basemaps.js. Els proveïdors amb clau només s'instancien si la clau
  // corresponent existeix a window.SG_BASEMAP_KEYS — així mai s'afig al
  // selector un proveïdor trencat o pendent de configuració.
  function buildBaseLayers() {
    var config = window.SG_BASEMAPS || { keyless: [], optional: [] };
    var keys = window.SG_BASEMAP_KEYS || {};
    var layers = {}; // etiqueta visible -> L.TileLayer
    var defaultLayer = null;

    (config.keyless || []).forEach(function (def) {
      var layer;
      if (def.type === 'maplibre') {
        // Capa vectorial (OpenFreeMap). Si MapLibre no s'ha carregat, s'omet.
        if (!L.maplibreGL) return;
        layer = L.maplibreGL({ style: def.style, attribution: def.attribution });
      } else {
        layer = L.tileLayer(def.url, def.options);
      }
      layers[def.label] = layer;
      if (!defaultLayer) defaultLayer = layer;
    });

    (config.optional || []).forEach(function (def) {
      var key = keys[def.keyName];
      if (!key) return; // sense clau: no s'instancia ni es mostra al selector
      var layer = L.tileLayer(def.buildUrl(key), def.options);
      layers[def.label + ' (' + def.keyName + ')'] = layer;
    });

    return { layers: layers, defaultLayer: defaultLayer };
  }

  function initMap() {
    var mapEl = document.getElementById('sg-map');
    var noteEl = document.getElementById('sg-map-note');

    if (!window.L) {
      mapEl.hidden = true;
      noteEl.hidden = false;
      noteEl.textContent = 'El mapa no s’ha pogut carregar. Pots consultar totes les activitats al directori de més avall.';
      return;
    }

    var baseLayers = buildBaseLayers();

    state.map = L.map(mapEl, {
      center: MAP_CENTER,
      zoom: MAP_ZOOM,
      layers: baseLayers.defaultLayer ? [baseLayers.defaultLayer] : [],
      scrollWheelZoom: false,
      maxZoom: 19 // necessari per a markercluster amb capes vectorials
    });

    if (Object.keys(baseLayers.layers).length > 1) {
      L.control.layers(baseLayers.layers, null, { position: 'topright', collapsed: true }).addTo(state.map);
    }

    // Clustering conservador: només agrupa punts realment pròxims, deixa de
    // agrupar a partir de zoom 17 i "spiderfeja" els que coincideixen quan
    // s'arriba al zoom màxim de clustering.
    state.markerClusterGroup = L.markerClusterGroup({
      maxClusterRadius: 45,
      disableClusteringAtZoom: 17,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      iconCreateFunction: clusterIconCreateFunction
    });
    state.map.addLayer(state.markerClusterGroup);

    renderMapMarkers(getLocatedFilteredBusinesses());
  }

  function renderMapMarkers(list) {
    if (!state.map || !state.markerClusterGroup) return;

    state.markerClusterGroup.clearLayers();
    state.markers = {};

    // Defensa addicional: encara que `list` ja hauria de contindre només
    // activitats amb localització fixa, mai es mostra un marcador sense
    // coordenades vàlides.
    var validList = list.filter(hasValidCoords);

    validList.forEach(function (b) {
      var marker = L.marker([b.latitude, b.longitude], { icon: buildMarkerIcon(b.category) })
        .bindPopup(buildPopupHtml(b), { maxWidth: 280 });
      marker.on('click', function () { highlightCard(b.id); });
      state.markerClusterGroup.addLayer(marker);
      state.markers[b.id] = marker;
    });

    state.lastVisible = validList;
    fitMapToVisibleMarkers(validList);

    var noteEl = document.getElementById('sg-map-note');
    if (!noteEl) return;

    if (validList.length === 0) {
      noteEl.hidden = false;
      noteEl.textContent = 'Les ubicacions dels comerços són provisionals (pendents de validació per l’Ajuntament). ' +
        'Mentrestant, pots consultar totes les dades al directori de més avall.';
    } else {
      noteEl.hidden = true;
    }
  }

  // Ajusta la vista del mapa al conjunt d'activitats actualment visible:
  // cap punt -> vista general de Sella; un sol punt -> el centra amb un
  // zoom de barri; diversos punts -> encaixa els límits sense passar-se
  // de zoom quan estan molt pròxims entre si.
  function fitMapToVisibleMarkers(list) {
    if (!state.map) return;

    // Sense cap filtre actiu, la vista s'obri centrada al nucli urbà (els
    // punts allunyats, com Finca Seguró, queden fora d'esta vista inicial).
    // En triar una categoria o buscar, el mapa s'ajusta per a mostrar tots
    // els resultats, encara que estiguen fora del poble.
    if (state.activeCategory === 'all' && !state.searchTerm.trim()) {
      // v3: s'encaixen els punts a menys de ~2 km del nucli (queda fora
      // Finca Seguró), perquè cap marcador quede tallat a la vora del mapa.
      var near = list.filter(function (b) {
        return Math.abs(b.latitude - VILLAGE_CENTER[0]) < 0.018 && Math.abs(b.longitude - VILLAGE_CENTER[1]) < 0.022;
      });
      if (near.length > 1) {
        state.map.fitBounds(L.latLngBounds(near.map(function (b) { return [b.latitude, b.longitude]; })),
          { padding: [36, 36], maxZoom: 16, animate: !state.reduceMotion && !!state.villageViewShown });
      } else {
        state.map.setView(VILLAGE_CENTER, 16);
      }
      state.villageViewShown = true;
      return;
    }

    if (list.length === 0) {
      if (state.reduceMotion) {
        state.map.setView(MAP_CENTER, MAP_ZOOM);
      } else {
        state.map.flyTo(MAP_CENTER, MAP_ZOOM);
      }
      return;
    }

    if (list.length === 1) {
      var target = [list[0].latitude, list[0].longitude];
      var zoom = Math.max(state.map.getZoom(), NEIGHBOURHOOD_ZOOM);
      if (state.reduceMotion) {
        state.map.setView(target, zoom);
      } else {
        state.map.flyTo(target, zoom);
      }
      return;
    }

    var bounds = L.latLngBounds(list.map(function (b) { return [b.latitude, b.longitude]; }));
    state.map.fitBounds(bounds, { padding: [48, 48], maxZoom: FIT_BOUNDS_MAX_ZOOM, animate: !state.reduceMotion });
  }

  // El popup porta una franja de capçalera en el color exacte de la
  // categoria (amb el nom de la categoria en text, no només color) i un
  // cos blanc net a sota amb la resta d'informació.
  function buildPopupHtml(b) {
    var addressInfo = getAddressInfo(b, false);
    var actions = getBusinessActions(b, { directions: true });
    var contactLines = getContactLines(b);
    return '<div class="sg-popup" style="--sg-card-accent:' + escapeHtml(getCategoryColor(b.category)) + '">' +
      '<p class="sg-popup__category-bar">' + escapeHtml(getCategoryLabel(b.category)) + '</p>' +
      '<div class="sg-popup__body">' +
      '<h3 class="sg-popup__name">' + escapeHtml(b.name) + '</h3>' +
      (b.notice ? '<p class="sg-popup__address"><span class="sg-badge sg-badge--notice">' + escapeHtml(b.notice) + '</span></p>' : '') +
      renderAddressHtml(addressInfo, 'sg-popup__address') +
      renderContactLinesHtml(contactLines, 'sg-popup__meta') +
      (actions.length ? '<div class="sg-popup__actions">' + renderActionsHtml(actions) + '</div>' : '') +
      '</div></div>';
  }

  function showOnMap(id) {
    var marker = state.markers[id];
    if (!marker || !state.map) return;

    // Mòbil/tauleta: primer es passa a la vista de mapa.
    state.pendingFocus = true;
    if (isNarrow()) setView('map');

    window.requestAnimationFrame(function () {
      state.map.invalidateSize();
      state.markerClusterGroup.zoomToShowLayer(marker, function () {
        marker.openPopup();
        state.pendingFocus = false;
      });
    });
    highlightCard(id, true);
  }

  /* ---------- Maquetació v3 ---------- */

  function isNarrow() { return window.matchMedia('(max-width: 1023px)').matches; }

  function setView(view) {
    var split = document.querySelector('.sg3-split');
    if (!split || split.getAttribute('data-view') === view) return;
    split.setAttribute('data-view', view);
    if (view === 'map' && state.map) {
      window.requestAnimationFrame(function () {
        state.map.invalidateSize();
        if (!state.pendingFocus) fitMapToVisibleMarkers(state.lastVisible || []);
      });
    }
  }

  function highlightCard(id, noScroll) {
    document.querySelectorAll('.sg-card.is-current').forEach(function (c) { c.classList.remove('is-current'); });
    var card = document.getElementById('sg-card-' + id);
    if (!card) return;
    card.classList.add('is-current');
    if (!noScroll && !isNarrow()) {
      card.scrollIntoView({ behavior: state.reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
    }
  }

  function initLayoutV3() {
    var root = document.querySelector('.sg3');
    var bar = document.querySelector('.sg3-bar');
    var toggle = document.getElementById('sg3-toggle');

    // L'alçada real de la barra fixa determina on s'enganxa el mapa.
    function syncBar() {
      if (root && bar) root.style.setProperty('--bar-h', bar.offsetHeight + 'px');
      if (state.map) state.map.invalidateSize();
    }
    syncBar();
    if (window.ResizeObserver && bar) new ResizeObserver(syncBar).observe(bar);
    window.addEventListener('resize', syncBar);

    if (toggle) {
      toggle.addEventListener('click', function () {
        var split = document.querySelector('.sg3-split');
        var next = split.getAttribute('data-view') === 'map' ? 'list' : 'map';
        setView(next);
        var barFixed = bar && getComputedStyle(bar).position === 'sticky';
        var top = split.getBoundingClientRect().top + window.pageYOffset - (barFixed ? bar.offsetHeight : 0);
        // En obrir el mapa, es porta a dalt de la pantalla perquè es veja sencer.
        if (next === 'map' || window.pageYOffset > top) window.scrollTo({ top: top, behavior: 'auto' });
      });
    }
  }
})();
