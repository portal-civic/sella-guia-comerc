/*
 * Font de dades de la guia de Sella.
 *
 * Les dades es mantenen en un full de càlcul de Google (pestanya «Dades»)
 * publicat com a CSV. La web el llig en carregar-se, de manera que els
 * canvis que fa l'Ajuntament al full apareixen sols (Google pot tardar uns
 * 5 minuts a refrescar el CSV publicat).
 *
 * Si el full no es pot llegir (sense connexió amb Google, enllaç canviat,
 * capçaleres esborrades...), s'usa la còpia de seguretat data/comercos.json.
 *
 * Per a canviar de full: substituïu SHEET_CSV_URL per l'enllaç nou
 * (Fitxer → Compartir → Publicar al web → pestanya «Dades» → CSV).
 */
(function () {
  'use strict';

  var SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTi4X7nWibVluVWPBMSGjvPyC0DzFhHLjWPqJcwQK9rBe96SDGu8OkEwi4DcfLOGNUr8f1MFdu9Yt5X/pub?gid=72272835&single=true&output=csv';

  // Etiquetes de categoria del full -> id intern de la web.
  var CATEGORIES = [
    { id: 'alimentacio', label: 'Alimentació i productes locals' },
    { id: 'construccio', label: 'Construcció, fontaneria i electricitat' },
    { id: 'serveis', label: 'Serveis a les persones i empreses' },
    { id: 'allotjaments', label: 'Hostaleria i allotjaments' },
    { id: 'oci', label: 'Oci i esports' },
    { id: 'restauracio', label: 'Restauració' },
    { id: 'altres', label: 'Altres comerços' }
  ];

  function norm(s) {
    return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '')
      .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  }

  // Analitzador CSV (RFC 4180): cometes, comes i salts de línia dins de camps.
  function parseCsv(text) {
    var rows = [], row = [], field = '', i = 0, q = false, c;
    text = String(text).replace(/^﻿/, '');
    while (i < text.length) {
      c = text[i];
      if (q) {
        if (c === '"') {
          if (text[i + 1] === '"') { field += '"'; i += 2; continue; }
          q = false; i++; continue;
        }
        field += c; i++; continue;
      }
      if (c === '"') { q = true; i++; continue; }
      if (c === ',') { row.push(field); field = ''; i++; continue; }
      if (c === '\r') { i++; continue; }
      if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; i++; continue; }
      field += c; i++;
    }
    if (field !== '' || row.length) { row.push(field); rows.push(row); }
    return rows;
  }

  // «38.6085877, -0.2713208» (Google Maps). També accepta «38,6085877; -0,2713208».
  function parseCoords(v) {
    v = String(v || '').trim();
    if (!v) return null;
    var parts = v.indexOf(';') !== -1 ? v.split(';') : v.match(/-?\d+(?:\.\d+)?/g);
    if (!parts || parts.length < 2) return null;
    var lat = parseFloat(String(parts[0]).replace(',', '.'));
    var lon = parseFloat(String(parts[1]).replace(',', '.'));
    if (!isFinite(lat) || !isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;
    return [lat, lon];
  }

  function yes(v) { return /^(si|s|yes|y|1|x)$/.test(norm(v)); }
  function no(v) { return /^(no|n|0)$/.test(norm(v)); }

  function rowsToData(rows) {
    if (!rows.length) throw new Error('Full buit');
    var header = rows[0].map(norm);
    function col(name) { return header.indexOf(norm(name)); }
    var C = {
      id: col('ID'), show: col('Mostrar a la web'), name: col('Nom'), cat: col('Categoria'),
      local: col('Té local obert al públic'), address: col('Adreça'), phone: col('Telèfon'),
      email: col('Correu'), web: col('Web'), insta: col('Instagram'), coords: col('Coordenades'), notice: col('Avís'), photo: col('Foto')
    };
    if (C.name < 0 || C.cat < 0) throw new Error('Falten les columnes «Nom» o «Categoria» al full');

    var catByLabel = {};
    CATEGORIES.forEach(function (c) { catByLabel[norm(c.label)] = c.id; catByLabel[norm(c.id)] = c.id; });

    var businesses = [];
    rows.slice(1).forEach(function (r, i) {
      function get(k) { return C[k] >= 0 ? String(r[C[k]] || '').trim() : ''; }
      var name = get('name');
      if (!name) return;                       // fila buida
      if (C.show >= 0 && no(get('show'))) return; // marcada «No»: no es mostra
      var cat = catByLabel[norm(get('cat'))] || 'altres';
      var fixed = C.local >= 0 ? yes(get('local')) : !!get('address');
      var ll = fixed ? parseCoords(get('coords')) : null;
      businesses.push({
        id: get('id') || ('fila-' + (i + 2)),
        name: name,
        category: cat,
        address: fixed ? (get('address') || null) : null,
        location_type: fixed ? 'fixed_public_location' : 'no_fixed_public_location',
        phone: get('phone') || null,
        email: get('email') || null,
        website: get('web') || null,
        instagram: get('insta') ? get('insta').replace(/^@/, '') : null,
        latitude: ll ? ll[0] : null,
        longitude: ll ? ll[1] : null,
        notice: get('notice') || null,
        photo: /^https?:\/\//i.test(get('photo')) ? get('photo') : null
      });
    });
    if (!businesses.length) throw new Error('El full no té cap activitat visible');
    return { meta: { source: 'google-sheet' }, categories: CATEGORIES, businesses: businesses };
  }

  function fromSheet() {
    return fetch(SHEET_CSV_URL, { cache: 'no-store' }).then(function (res) {
      if (!res.ok) throw new Error('Full de Google: HTTP ' + res.status);
      return res.text();
    }).then(function (t) { return rowsToData(parseCsv(t)); });
  }

  function fromBackup(url) {
    return fetch(url).then(function (res) {
      if (!res.ok) throw new Error('Còpia de seguretat: HTTP ' + res.status);
      return res.json();
    });
  }

  // Ús: window.SG_loadData('data/comercos.json') -> Promise de { categories, businesses }
  window.SG_loadData = function (backupUrl) {
    return fromSheet().catch(function (err) {
      if (window.console && console.warn) console.warn('Guia Sella: no s’ha pogut llegir el full, s’usa la còpia de seguretat.', err);
      return fromBackup(backupUrl);
    });
  };

  // Exposat per a proves.
  window.SG_parseSheetCsv = function (text) { return rowsToData(parseCsv(text)); };
})();
