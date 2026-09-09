/*
 * Configuració centralitzada de bases cartogràfiques per a la guia de Sella.
 * Cada entrada descriu una capa ràster compatible amb Leaflet (L.tileLayer).
 *
 * — window.SG_BASEMAPS.keyless: proveïdors que funcionen sense cap clau.
 *   S'han comprovat manualment (petició real d'una tessel·la sobre Sella)
 *   abans d'afegir-los; els que no responien correctament (o mostraven un
 *   avís "API key required" incrustat a la imatge, com CARTO sense compte)
 *   no s'inclouen ací.
 *
 * — window.SG_BASEMAPS.optional: proveïdors que requereixen una clau/token.
 *   NO s'ha de posar cap clau real en aquest fitxer versionat. Les claus
 *   s'han de proporcionar via window.SG_BASEMAP_KEYS (per exemple, generant
 *   eixe objecte des d'una plantilla de servidor exclosa del control de
 *   versions). Si una clau no existeix, la capa corresponent simplement no
 *   s'afig al mapa ni al selector de capes — mai es mostra com a opció
 *   trencada.
 *
 * Afegir/traure un proveïdor és tan senzill com editar aquests arrays.
 */
(function () {
  'use strict';

  var OSM_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors';
  var IGN_ATTR = '&copy; <a href="https://www.ign.es" target="_blank" rel="noopener">Instituto Geográfico Nacional de España</a> (CC BY 4.0)';

  window.SG_BASEMAPS = {

    // Provats manualment (petició de tessel·la real sobre Sella, 38.6089,
    // -0.2734): responen 200 amb contingut d'imatge vàlid i cobertura útil.
    keyless: [
      {
        id: 'osm',
        label: 'OpenStreetMap',
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        options: { subdomains: 'abc', maxZoom: 19, attribution: OSM_ATTR }
      },
      {
        id: 'osmfr',
        label: 'OpenStreetMap França',
        url: 'https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png',
        options: { subdomains: 'abc', maxZoom: 20, attribution: OSM_ATTR + ', tiles courtesy of <a href="http://www.openstreetmap.fr/" target="_blank" rel="noopener">OSM France</a>' }
      },
      {
        id: 'hot',
        label: 'OpenStreetMap Humanitari (HOT)',
        // Nota: l'amfitrió sense subdomini (tile.openstreetmap.fr/hot) no
        // respon (404); cal usar el patró amb subdomini tile-{s}.
        url: 'https://tile-{s}.openstreetmap.fr/hot/{z}/{x}/{y}.png',
        options: { subdomains: 'abc', maxZoom: 20, attribution: OSM_ATTR + ', style by <a href="https://www.hotosm.org/" target="_blank" rel="noopener">Humanitarian OSM Team</a>' }
      },
      {
        id: 'cyclosm',
        label: 'CyclOSM',
        // Comprovat: respon 200 fins a zoom 14 sobre Sella però 404 de
        // manera consistent (repetit, no transitori) a partir de zoom 15 —
        // el seu servidor no renderitza sota demanda per a aquesta zona a
        // zooms alts. Es limita maxNativeZoom perquè Leaflet amplie la
        // darrera tessel·la vàlida en lloc de mostrar una tessel·la trencada.
        url: 'https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png',
        options: { subdomains: 'abc', maxNativeZoom: 14, maxZoom: 19, attribution: OSM_ATTR + ', style by <a href="https://www.cyclosm.org" target="_blank" rel="noopener">CyclOSM</a>' }
      },
      {
        id: 'opentopomap',
        label: 'OpenTopoMap',
        url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
        options: { subdomains: 'abc', maxZoom: 17, attribution: OSM_ATTR + ', SRTM | style: &copy; <a href="https://opentopomap.org" target="_blank" rel="noopener">OpenTopoMap</a> (CC-BY-SA)' }
      },
      {
        id: 'topplus-color',
        label: 'TopPlusOpen · Color',
        // BKG (Alemanya): cobertura global amb detall reduït fora d'Alemanya.
        // Comprovat: tessel·les vàlides fins a zoom ~16 sobre Sella; a partir
        // de zoom 17 retorna una tessel·la buida repetida, per això es limita
        // maxNativeZoom i es permet a Leaflet ampliar-la en lloc de trencar-se.
        url: 'https://sgx.geodatenzentrum.de/wmts_topplus_open/tile/1.0.0/web/default/WEBMERCATOR/{z}/{y}/{x}.png',
        options: { maxNativeZoom: 16, maxZoom: 19, attribution: '&copy; <a href="https://www.bkg.bund.de" target="_blank" rel="noopener">GeoBasis-DE / BKG</a>, dl-de/by-2-0' }
      },
      {
        id: 'topplus-grey',
        label: 'TopPlusOpen · Gris',
        url: 'https://sgx.geodatenzentrum.de/wmts_topplus_open/tile/1.0.0/web_grau/default/WEBMERCATOR/{z}/{y}/{x}.png',
        options: { maxNativeZoom: 16, maxZoom: 19, attribution: '&copy; <a href="https://www.bkg.bund.de" target="_blank" rel="noopener">GeoBasis-DE / BKG</a>, dl-de/by-2-0' }
      },
      {
        id: 'topplus-light',
        label: 'TopPlusOpen · Clar',
        url: 'https://sgx.geodatenzentrum.de/wmts_topplus_open/tile/1.0.0/web_light/default/WEBMERCATOR/{z}/{y}/{x}.png',
        options: { maxNativeZoom: 16, maxZoom: 19, attribution: '&copy; <a href="https://www.bkg.bund.de" target="_blank" rel="noopener">GeoBasis-DE / BKG</a>, dl-de/by-2-0' }
      },
      {
        id: 'topplus-lightgrey',
        label: 'TopPlusOpen · Gris clar',
        url: 'https://sgx.geodatenzentrum.de/wmts_topplus_open/tile/1.0.0/web_light_grau/default/WEBMERCATOR/{z}/{y}/{x}.png',
        options: { maxNativeZoom: 16, maxZoom: 19, attribution: '&copy; <a href="https://www.bkg.bund.de" target="_blank" rel="noopener">GeoBasis-DE / BKG</a>, dl-de/by-2-0' }
      },
      {
        id: 'arcgis-street',
        label: 'ArcGIS · Carrers',
        // server.arcgisonline.com: servei públic d'Esri sense token. Es
        // classifica ací (i no amb els proveïdors amb clau) perquè s'ha
        // comprovat que respon 200 amb imatge vàlida sense credencials;
        // convé revisar igualment les condicions d'ús d'Esri abans de
        // producció (vore informe final).
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
        options: { maxZoom: 19, attribution: 'Tiles &copy; Esri — Source: Esri, HERE, Garmin, USGS, Intermap, INCREMENT P, NRCan, Esri Japan, METI, Esri China (Hong Kong), Esri Korea, Esri (Thailand), NGCC, &copy; OpenStreetMap contributors, GIS User Community' }
      },
      {
        id: 'arcgis-topo',
        label: 'ArcGIS · Topogràfic',
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
        options: { maxZoom: 19, attribution: 'Tiles &copy; Esri — Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, MapmyIndia, &copy; OpenStreetMap contributors, GIS User Community' }
      },
      {
        id: 'arcgis-imagery',
        label: 'ArcGIS · Satèl·lit',
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        options: { maxZoom: 19, attribution: 'Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community' }
      },

      // ---- PROVES TEMPORALS: capes oficials IGN/CNIG (Espanya) ----
      // WMTS oficial de l'IGN (servicios.idee.es / www.ign.es), servit amb
      // el tilematrixset GoogleMapsCompatible (EPSG:3857) perquè funcione
      // directament amb L.tileLayer com qualsevol altra capa XYZ. Llicència
      // CC BY 4.0 (scne.es), sense clau ni condicions d'ús restrictives
      // (confirmat via GetCapabilities: "No se aplican condiciones").
      //
      // maxNativeZoom fixat a partir d'inspecció visual real de tessel·les
      // sobre Sella (no del límit declarat a GetCapabilities, que en els 3
      // casos arriba fins a TileMatrix 20 encara que el detall genuí no hi
      // arribe sempre): vore comentaris a cada capa.
      {
        id: 'ign-base',
        label: 'IGN Base',
        // Comprovat visualment a z14/16/17/18/19/20: detall genuí i nou a
        // cada nivell (apareixen noms de carrer i numeració de portal que
        // no es veuen als zooms anteriors), sense senyals de difuminat ni
        // ampliació — és un mapa renderitzat, no una imatge de resolució
        // fixa. Es fixa maxNativeZoom al límit declarat (20) perquè la
        // comprovació visual no ha mostrat cap degradació.
        url: 'https://www.ign.es/wmts/ign-base?service=WMTS&request=GetTile&version=1.0.0&layer=IGNBaseTodo&style=default&format=image/png&tilematrixset=GoogleMapsCompatible&TileMatrix={z}&TileRow={y}&TileCol={x}',
        options: { maxNativeZoom: 20, maxZoom: 20, attribution: IGN_ATTR }
      },
      {
        id: 'ign-mtn',
        label: 'IGN Raster',
        // Mapa Topogràfic Nacional ràster (layer=MTN; "mapa-raster" com a
        // nom de capa NO existeix — GetCapabilities confirma que l'únic
        // identificador vàlid és "MTN"). Comprovat visualment: nítid i amb
        // detall real fins a z17 (corbes de nivell, cotes, Castell de
        // Santa Bàrbara llegible); a z18/19/20 la mateixa tessel·la es
        // torna clarament borrosa/ampliada (vores toves, cap etiqueta
        // nova) — mateix patró que TopPlusOpen. maxNativeZoom es limita a
        // 17 perquè Leaflet amplie eixa darrera tessel·la nítida en lloc
        // de servir directament les versions borroses del servidor.
        url: 'https://www.ign.es/wmts/mapa-raster?service=WMTS&request=GetTile&version=1.0.0&layer=MTN&style=default&format=image/jpeg&tilematrixset=GoogleMapsCompatible&TileMatrix={z}&TileRow={y}&TileCol={x}',
        options: { maxNativeZoom: 17, maxZoom: 20, attribution: IGN_ATTR }
      },
      {
        id: 'pnoa',
        label: 'PNOA Ortofoto',
        // Ortofoto PNOA Màxima Actualitat (layer=OI.OrthoimageCoverage).
        // Comprovada visualment: nítida i amb detall real (cotxes
        // individuals, teules de teulada) fins a z19; a z20 s'aprecia una
        // suavitat/pixelat lleuger propi d'arribar a la resolució nativa
        // del sòl (GSD) de l'ortofoto. maxNativeZoom es fixa a 19.
        url: 'https://www.ign.es/wmts/pnoa-ma?service=WMTS&request=GetTile&version=1.0.0&layer=OI.OrthoimageCoverage&style=default&format=image/jpeg&tilematrixset=GoogleMapsCompatible&TileMatrix={z}&TileRow={y}&TileCol={x}',
        options: { maxNativeZoom: 19, maxZoom: 21, attribution: IGN_ATTR }
      }
    ],

    // Investigats i exclosos deliberadament (documentat per a l'informe):
    //  - "OpenStreetMap CAT / Catalan": no s'ha trobat cap servidor de
    //    tessel·les ràster públic i actiu amb aquest nom. A més, els
    //    portals cartogràfics oficials catalans (ICGC) cobreixen Catalunya
    //    i no Sella (Alacant, Comunitat Valenciana), així que encara que
    //    existiren no serien útils ací.
    //  - CARTO (light_all) sense compte: la tessel·la respon HTTP 200 però
    //    la imatge porta incrustat l'avís "API key required"; per això es
    //    mou a la llista `optional` (requereix clau) i no s'usa mai per
    //    defecte.

    // Requereixen clau/token. NO instal·leu cap secret ací: ompliu
    // window.SG_BASEMAP_KEYS (per exemple des d'una inclusió de servidor no
    // versionada) abans de carregar aquest fitxer. Si la clau no existeix,
    // la capa no s'afig ni al mapa ni al selector.
    optional: [
      {
        id: 'carto-positron',
        label: 'CARTO Positron',
        keyName: 'carto',
        buildUrl: function (key) { return 'https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}{r}.png?api_key=' + encodeURIComponent(key); },
        options: { subdomains: 'abcd', maxZoom: 20, attribution: OSM_ATTR + ' &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener">CARTO</a>' }
      },
      {
        id: 'carto-voyager',
        label: 'CARTO Voyager',
        keyName: 'carto',
        buildUrl: function (key) { return 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?api_key=' + encodeURIComponent(key); },
        options: { subdomains: 'abcd', maxZoom: 20, attribution: OSM_ATTR + ' &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener">CARTO</a>' }
      },
      {
        id: 'carto-darkmatter',
        label: 'CARTO Dark Matter',
        keyName: 'carto',
        buildUrl: function (key) { return 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png?api_key=' + encodeURIComponent(key); },
        options: { subdomains: 'abcd', maxZoom: 20, attribution: OSM_ATTR + ' &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener">CARTO</a>' }
      },
      {
        id: 'stadia-alidade-smooth',
        label: 'Stadia · Alidade Smooth',
        keyName: 'stadia',
        buildUrl: function (key) { return 'https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png?api_key=' + encodeURIComponent(key); },
        options: { maxZoom: 20, attribution: '&copy; <a href="https://stadiamaps.com/" target="_blank" rel="noopener">Stadia Maps</a>, ' + OSM_ATTR }
      },
      {
        id: 'stadia-alidade-smooth-dark',
        label: 'Stadia · Alidade Smooth Dark',
        keyName: 'stadia',
        buildUrl: function (key) { return 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png?api_key=' + encodeURIComponent(key); },
        options: { maxZoom: 20, attribution: '&copy; <a href="https://stadiamaps.com/" target="_blank" rel="noopener">Stadia Maps</a>, ' + OSM_ATTR }
      },
      {
        id: 'stadia-osm-bright',
        label: 'Stadia · OSM Bright',
        keyName: 'stadia',
        buildUrl: function (key) { return 'https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png?api_key=' + encodeURIComponent(key); },
        options: { maxZoom: 20, attribution: '&copy; <a href="https://stadiamaps.com/" target="_blank" rel="noopener">Stadia Maps</a>, ' + OSM_ATTR }
      },
      {
        id: 'stadia-stamen-terrain',
        label: 'Stadia · Stamen Terrain',
        keyName: 'stadia',
        buildUrl: function (key) { return 'https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}{r}.png?api_key=' + encodeURIComponent(key); },
        options: { maxZoom: 18, attribution: '&copy; <a href="https://stadiamaps.com/" target="_blank" rel="noopener">Stadia Maps</a>, &copy; <a href="https://stamen.com/" target="_blank" rel="noopener">Stamen Design</a>, ' + OSM_ATTR }
      },
      {
        id: 'stadia-stamen-toner',
        label: 'Stadia · Stamen Toner',
        keyName: 'stadia',
        buildUrl: function (key) { return 'https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}{r}.png?api_key=' + encodeURIComponent(key); },
        options: { maxZoom: 20, attribution: '&copy; <a href="https://stadiamaps.com/" target="_blank" rel="noopener">Stadia Maps</a>, &copy; <a href="https://stamen.com/" target="_blank" rel="noopener">Stamen Design</a>, ' + OSM_ATTR }
      },
      {
        id: 'stadia-stamen-watercolor',
        label: 'Stadia · Stamen Watercolor',
        keyName: 'stadia',
        buildUrl: function (key) { return 'https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg?api_key=' + encodeURIComponent(key); },
        options: { maxZoom: 16, attribution: '&copy; <a href="https://stadiamaps.com/" target="_blank" rel="noopener">Stadia Maps</a>, &copy; <a href="https://stamen.com/" target="_blank" rel="noopener">Stamen Design</a>, ' + OSM_ATTR }
      },
      {
        id: 'jawg-streets',
        label: 'Jawg · Streets',
        keyName: 'jawg',
        buildUrl: function (key) { return 'https://{s}.tile.jawg.io/jawg-streets/{z}/{x}/{y}{r}.png?access-token=' + encodeURIComponent(key); },
        options: { subdomains: 'abcd', maxZoom: 22, attribution: '&copy; <a href="https://www.jawg.io" target="_blank" rel="noopener">Jawg</a>, ' + OSM_ATTR }
      },
      {
        id: 'jawg-light',
        label: 'Jawg · Light',
        keyName: 'jawg',
        buildUrl: function (key) { return 'https://{s}.tile.jawg.io/jawg-light/{z}/{x}/{y}{r}.png?access-token=' + encodeURIComponent(key); },
        options: { subdomains: 'abcd', maxZoom: 22, attribution: '&copy; <a href="https://www.jawg.io" target="_blank" rel="noopener">Jawg</a>, ' + OSM_ATTR }
      },
      {
        id: 'jawg-dark',
        label: 'Jawg · Dark',
        keyName: 'jawg',
        buildUrl: function (key) { return 'https://{s}.tile.jawg.io/jawg-dark/{z}/{x}/{y}{r}.png?access-token=' + encodeURIComponent(key); },
        options: { subdomains: 'abcd', maxZoom: 22, attribution: '&copy; <a href="https://www.jawg.io" target="_blank" rel="noopener">Jawg</a>, ' + OSM_ATTR }
      },
      {
        id: 'jawg-terrain',
        label: 'Jawg · Terrain',
        keyName: 'jawg',
        buildUrl: function (key) { return 'https://{s}.tile.jawg.io/jawg-terrain/{z}/{x}/{y}{r}.png?access-token=' + encodeURIComponent(key); },
        options: { subdomains: 'abcd', maxZoom: 22, attribution: '&copy; <a href="https://www.jawg.io" target="_blank" rel="noopener">Jawg</a>, ' + OSM_ATTR }
      },
      {
        id: 'jawg-lagoon',
        label: 'Jawg · Lagoon',
        keyName: 'jawg',
        buildUrl: function (key) { return 'https://{s}.tile.jawg.io/jawg-lagoon/{z}/{x}/{y}{r}.png?access-token=' + encodeURIComponent(key); },
        options: { subdomains: 'abcd', maxZoom: 22, attribution: '&copy; <a href="https://www.jawg.io" target="_blank" rel="noopener">Jawg</a>, ' + OSM_ATTR }
      },
      {
        id: 'maptiler-streets',
        label: 'MapTiler · Streets',
        keyName: 'maptiler',
        buildUrl: function (key) { return 'https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=' + encodeURIComponent(key); },
        options: { maxZoom: 20, attribution: '&copy; <a href="https://www.maptiler.com/copyright/" target="_blank" rel="noopener">MapTiler</a>, ' + OSM_ATTR }
      },
      {
        id: 'maptiler-basic',
        label: 'MapTiler · Basic',
        keyName: 'maptiler',
        buildUrl: function (key) { return 'https://api.maptiler.com/maps/basic/{z}/{x}/{y}.png?key=' + encodeURIComponent(key); },
        options: { maxZoom: 20, attribution: '&copy; <a href="https://www.maptiler.com/copyright/" target="_blank" rel="noopener">MapTiler</a>, ' + OSM_ATTR }
      },
      {
        id: 'maptiler-outdoor',
        label: 'MapTiler · Outdoor',
        keyName: 'maptiler',
        buildUrl: function (key) { return 'https://api.maptiler.com/maps/outdoor/{z}/{x}/{y}.png?key=' + encodeURIComponent(key); },
        options: { maxZoom: 20, attribution: '&copy; <a href="https://www.maptiler.com/copyright/" target="_blank" rel="noopener">MapTiler</a>, ' + OSM_ATTR }
      },
      {
        id: 'maptiler-satellite',
        label: 'MapTiler · Satèl·lit',
        keyName: 'maptiler',
        buildUrl: function (key) { return 'https://api.maptiler.com/tiles/satellite-v2/{z}/{x}/{y}.jpg?key=' + encodeURIComponent(key); },
        options: { maxZoom: 20, attribution: '&copy; <a href="https://www.maptiler.com/copyright/" target="_blank" rel="noopener">MapTiler</a>' }
      },
      {
        id: 'mapbox-streets',
        label: 'Mapbox · Streets',
        keyName: 'mapbox',
        buildUrl: function (key) { return 'https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/{z}/{x}/{y}?access_token=' + encodeURIComponent(key); },
        options: { maxZoom: 22, attribution: '&copy; <a href="https://www.mapbox.com/about/maps/" target="_blank" rel="noopener">Mapbox</a>, ' + OSM_ATTR }
      },
      {
        id: 'mapbox-outdoors',
        label: 'Mapbox · Outdoors',
        keyName: 'mapbox',
        buildUrl: function (key) { return 'https://api.mapbox.com/styles/v1/mapbox/outdoors-v12/tiles/{z}/{x}/{y}?access_token=' + encodeURIComponent(key); },
        options: { maxZoom: 22, attribution: '&copy; <a href="https://www.mapbox.com/about/maps/" target="_blank" rel="noopener">Mapbox</a>, ' + OSM_ATTR }
      },
      {
        id: 'mapbox-satellite',
        label: 'Mapbox · Satèl·lit',
        keyName: 'mapbox',
        buildUrl: function (key) { return 'https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/tiles/{z}/{x}/{y}?access_token=' + encodeURIComponent(key); },
        options: { maxZoom: 22, attribution: '&copy; <a href="https://www.mapbox.com/about/maps/" target="_blank" rel="noopener">Mapbox</a>' }
      },
      {
        id: 'thunderforest-opencyclemap',
        label: 'Thunderforest · OpenCycleMap',
        keyName: 'thunderforest',
        buildUrl: function (key) { return 'https://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=' + encodeURIComponent(key); },
        options: { subdomains: 'abc', maxZoom: 22, attribution: '&copy; <a href="https://www.thunderforest.com/" target="_blank" rel="noopener">Thunderforest</a>, ' + OSM_ATTR }
      },
      {
        id: 'thunderforest-transport',
        label: 'Thunderforest · Transport',
        keyName: 'thunderforest',
        buildUrl: function (key) { return 'https://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=' + encodeURIComponent(key); },
        options: { subdomains: 'abc', maxZoom: 22, attribution: '&copy; <a href="https://www.thunderforest.com/" target="_blank" rel="noopener">Thunderforest</a>, ' + OSM_ATTR }
      },
      {
        id: 'thunderforest-landscape',
        label: 'Thunderforest · Landscape',
        keyName: 'thunderforest',
        buildUrl: function (key) { return 'https://{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png?apikey=' + encodeURIComponent(key); },
        options: { subdomains: 'abc', maxZoom: 22, attribution: '&copy; <a href="https://www.thunderforest.com/" target="_blank" rel="noopener">Thunderforest</a>, ' + OSM_ATTR }
      },
      {
        id: 'thunderforest-outdoors',
        label: 'Thunderforest · Outdoors',
        keyName: 'thunderforest',
        buildUrl: function (key) { return 'https://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey=' + encodeURIComponent(key); },
        options: { subdomains: 'abc', maxZoom: 22, attribution: '&copy; <a href="https://www.thunderforest.com/" target="_blank" rel="noopener">Thunderforest</a>, ' + OSM_ATTR }
      }
    ]
  };

  // Claus/tokens opcionals. Buit per defecte: NO poseu cap secret real en
  // aquest fitxer versionat. Per a activar un proveïdor amb clau, definiu
  // aquest objecte ABANS que s'execute js/app.js — per exemple carregant-lo
  // des d'una plantilla de servidor no versionada, o assignant-lo en un
  // <script> inline generat en desplegament (mai amb el valor en Git).
  window.SG_BASEMAP_KEYS = window.SG_BASEMAP_KEYS || {
    carto: '',
    stadia: '',
    jawg: '',
    maptiler: '',
    mapbox: '',
    thunderforest: ''
  };
})();
