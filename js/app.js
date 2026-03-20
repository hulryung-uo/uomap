// UO Map - Main Application
(function () {
  'use strict';

  // ─── State ─────────────────────────────────────────────
  let map;
  let currentFacet = 'trammel';
  let mapImageLayer = null;
  let layerGroups = {};
  let vendorMarkers = {};
  let contextMenuCoords = null;
  let editingVendorId = null;

  // ─── Constants ─────────────────────────────────────────
  const STORAGE_KEY = 'uo_map_vendors';
  const LAYER_VISIBILITY_KEY = 'uo_map_layers';

  // ─── Initialize ────────────────────────────────────────
  function init() {
    initMap();
    initSidebar();
    initLayerControls();
    initSearch();
    initVendorForm();
    initContextMenu();
    initZoomControls();
    loadFacet(currentFacet);
  }

  // ─── Region Switching ─────────────────────────────────
  function buildRegionButtons(facet) {
    const container = document.getElementById('region-buttons');
    const label = document.getElementById('region-label');
    container.innerHTML = '';

    if (!facet.regions) {
      label.style.display = 'none';
      return;
    }

    label.style.display = '';

    Object.entries(facet.regions).forEach(([regionId, region]) => {
      const btn = document.createElement('button');
      btn.className = 'region-btn' + (regionId === 'all' ? ' active' : '');
      btn.textContent = region.name;
      btn.dataset.region = regionId;
      btn.addEventListener('click', () => {
        container.querySelectorAll('.region-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        flyToRegion(region);
      });
      container.appendChild(btn);
    });
  }

  function flyToRegion(region) {
    const bounds = [
      [-region.y1, region.x1],
      [-region.y2, region.x2]
    ];
    map.flyToBounds(bounds, { padding: [20, 20], duration: 0.6 });
  }

  // ─── Map Setup ─────────────────────────────────────────
  function initMap() {
    map = L.map('map', {
      crs: L.CRS.Simple,
      minZoom: -3,
      maxZoom: 3,
      zoomSnap: 0.5,
      zoomDelta: 0.5,
      wheelPxPerZoomLevel: 120,
      zoomControl: false,
      attributionControl: false,
      fadeAnimation: true,
      zoomAnimation: true,
      markerZoomAnimation: true
    });

    // Coordinate display on mouse move
    map.on('mousemove', function (e) {
      const x = Math.round(e.latlng.lng);
      const y = Math.round(-e.latlng.lat);
      document.getElementById('coords-display').textContent = `X: ${x}   Y: ${y}`;
    });

    // Close context menu on click
    map.on('click', hideContextMenu);
    map.on('movestart', hideContextMenu);

    // Toggle label visibility based on zoom
    map.on('zoomend', function () {
      const zoom = map.getZoom();
      document.getElementById('map').classList.toggle('show-labels', zoom >= 0);
    });
  }

  // ─── Load Facet ────────────────────────────────────────
  function loadFacet(facetId) {
    currentFacet = facetId;
    const facet = UO_MAPS[facetId];
    if (!facet) return;

    // Clear existing layers
    Object.values(layerGroups).forEach(lg => {
      if (map.hasLayer(lg)) map.removeLayer(lg);
    });
    layerGroups = {};

    if (mapImageLayer) {
      map.removeLayer(mapImageLayer);
      mapImageLayer = null;
    }

    // Set bounds: top-left [0, 0] => lat=0, lng=0; bottom-right => lat=-height, lng=width
    const bounds = [[0, 0], [-facet.height, facet.width]];
    map.setMaxBounds([[-facet.height - 500, -500], [500, facet.width + 500]]);

    // Try to load map image
    const imgPath = `images/map_${facetId}.png`;
    const img = new Image();
    img.onload = function () {
      mapImageLayer = L.imageOverlay(imgPath, bounds).addTo(map);
      mapImageLayer.bringToBack();
      document.getElementById('setup-overlay').classList.remove('active');
    };
    img.onerror = function () {
      // Try jpg
      const jpgPath = `images/map_${facetId}.jpg`;
      const img2 = new Image();
      img2.onload = function () {
        mapImageLayer = L.imageOverlay(jpgPath, bounds).addTo(map);
        mapImageLayer.bringToBack();
        document.getElementById('setup-overlay').classList.remove('active');
      };
      img2.onerror = function () {
        // No map image found - show grid background
        addGridBackground(facet);
        document.getElementById('setup-overlay').classList.add('active');
      };
      img2.src = jpgPath;
    };
    img.src = imgPath;

    // Fit view to map bounds
    map.fitBounds(bounds, { padding: [20, 20] });

    // Build region buttons
    buildRegionButtons(facet);

    // Load POI layers
    loadPOIs(facetId);

    // Load vendors
    loadVendorMarkers();

    // Update layer control counts
    updateLayerCounts();
  }

  // ─── Grid Background ──────────────────────────────────
  function addGridBackground(facet) {
    // Create a subtle grid using polylines
    const gridLayer = L.layerGroup();
    const gridStyle = {
      color: 'rgba(255, 255, 255, 0.03)',
      weight: 1
    };
    const majorGridStyle = {
      color: 'rgba(255, 255, 255, 0.06)',
      weight: 1
    };

    const step = 256;
    for (let x = 0; x <= facet.width; x += step) {
      const style = x % 1024 === 0 ? majorGridStyle : gridStyle;
      L.polyline([[0, x], [-facet.height, x]], style).addTo(gridLayer);
    }
    for (let y = 0; y <= facet.height; y += step) {
      const style = y % 1024 === 0 ? majorGridStyle : gridStyle;
      L.polyline([[-y, 0], [-y, facet.width]], style).addTo(gridLayer);
    }

    gridLayer.addTo(map);
  }

  // ─── Load POIs ─────────────────────────────────────────
  function loadPOIs(facetId) {
    const pois = POI_DATA[facetId];
    if (!pois) return;

    const savedVisibility = getLayerVisibility();

    Object.entries(POI_CATEGORIES).forEach(([catId, cat]) => {
      if (catId === 'vendor') return; // vendors handled separately

      const items = pois[catId] || [];
      const lg = L.layerGroup();

      items.forEach(poi => {
        const marker = createPOIMarker(poi, catId, cat);
        marker.addTo(lg);
      });

      layerGroups[catId] = lg;

      if (savedVisibility[catId] !== false) {
        lg.addTo(map);
      }
    });
  }

  // ─── Create POI Marker ─────────────────────────────────
  function createPOIMarker(poi, catId, cat) {
    const latlng = [-poi.y, poi.x];

    const markerHtml = `
      <div class="custom-marker marker-${catId}">
        <span class="marker-label">${poi.name}</span>
        <div class="marker-dot" style="background: ${cat.markerColor}; --glow-color: ${cat.markerColor}40;"></div>
      </div>
    `;

    const icon = L.divIcon({
      html: markerHtml,
      className: '',
      iconSize: [16, 16],
      iconAnchor: [8, 8],
      popupAnchor: [0, -16]
    });

    const marker = L.marker(latlng, { icon: icon });

    const popupContent = `
      <div class="popup-content">
        <div class="popup-title">
          ${poi.name}
          <span class="popup-category" style="background: ${cat.markerColor}20; color: ${cat.color}">${cat.name}</span>
        </div>
        <div class="popup-desc">${poi.desc || ''}</div>
        <div class="popup-coords">X: ${poi.x} &nbsp; Y: ${poi.y}</div>
      </div>
    `;

    marker.bindPopup(popupContent, {
      maxWidth: 280,
      closeButton: false,
      offset: [0, -4]
    });

    return marker;
  }

  // ─── Vendor System ─────────────────────────────────────
  function getVendors() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      const all = data ? JSON.parse(data) : {};
      return all[currentFacet] || [];
    } catch {
      return [];
    }
  }

  function saveVendors(vendors) {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      const all = data ? JSON.parse(data) : {};
      all[currentFacet] = vendors;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    } catch (e) {
      console.error('Failed to save vendors:', e);
    }
  }

  function loadVendorMarkers() {
    // Clear existing vendor markers
    if (layerGroups.vendor) {
      if (map.hasLayer(layerGroups.vendor)) map.removeLayer(layerGroups.vendor);
    }
    vendorMarkers = {};

    const lg = L.layerGroup();
    const vendors = getVendors();

    vendors.forEach(v => {
      const marker = createVendorMarker(v);
      marker.addTo(lg);
      vendorMarkers[v.id] = marker;
    });

    layerGroups.vendor = lg;

    const savedVisibility = getLayerVisibility();
    if (savedVisibility.vendor !== false) {
      lg.addTo(map);
    }

    renderVendorList();
    updateLayerCounts();
  }

  function createVendorMarker(vendor) {
    const cat = POI_CATEGORIES.vendor;
    const latlng = [-vendor.y, vendor.x];
    const typeName = VENDOR_TYPES.find(t => t.value === vendor.type)?.label || vendor.type;

    const markerHtml = `
      <div class="custom-marker marker-vendor">
        <span class="marker-label">${vendor.name}</span>
        <div class="marker-dot" style="background: ${cat.markerColor}; --glow-color: ${cat.markerColor}60;"></div>
      </div>
    `;

    const icon = L.divIcon({
      html: markerHtml,
      className: '',
      iconSize: [16, 16],
      iconAnchor: [8, 8],
      popupAnchor: [0, -16]
    });

    const marker = L.marker(latlng, { icon: icon });

    const itemsHtml = vendor.items ? `<div class="popup-desc" style="margin-top:6px"><strong>Items:</strong> ${escapeHtml(vendor.items)}</div>` : '';
    const notesHtml = vendor.notes ? `<div class="popup-desc"><strong>Notes:</strong> ${escapeHtml(vendor.notes)}</div>` : '';

    const popupContent = `
      <div class="popup-content">
        <div class="popup-title">
          ${escapeHtml(vendor.name)}
          <span class="popup-category" style="background: ${cat.markerColor}20; color: ${cat.color}">${typeName}</span>
        </div>
        ${itemsHtml}
        ${notesHtml}
        <div class="popup-coords">X: ${vendor.x} &nbsp; Y: ${vendor.y}</div>
        <div class="popup-actions">
          <button class="btn btn-sm btn-primary" onclick="window.__uomap.editVendor('${vendor.id}')">
            <i class="fa-solid fa-pen"></i> Edit
          </button>
          <button class="btn btn-sm btn-danger" onclick="window.__uomap.deleteVendor('${vendor.id}')">
            <i class="fa-solid fa-trash"></i> Delete
          </button>
        </div>
      </div>
    `;

    marker.bindPopup(popupContent, {
      maxWidth: 280,
      closeButton: false,
      offset: [0, -4]
    });

    return marker;
  }

  function addVendor(vendorData) {
    const vendors = getVendors();
    const vendor = {
      id: 'v_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8),
      ...vendorData
    };
    vendors.push(vendor);
    saveVendors(vendors);
    loadVendorMarkers();
    showToast('Vendor added');
    return vendor;
  }

  function updateVendor(id, vendorData) {
    const vendors = getVendors();
    const idx = vendors.findIndex(v => v.id === id);
    if (idx === -1) return;
    vendors[idx] = { ...vendors[idx], ...vendorData };
    saveVendors(vendors);
    loadVendorMarkers();
    showToast('Vendor updated');
  }

  function deleteVendor(id) {
    const vendors = getVendors().filter(v => v.id !== id);
    saveVendors(vendors);
    map.closePopup();
    loadVendorMarkers();
    showToast('Vendor deleted');
  }

  function editVendor(id) {
    const vendor = getVendors().find(v => v.id === id);
    if (!vendor) return;
    map.closePopup();
    openVendorModal(vendor);
  }

  // Expose for popup onclick
  window.__uomap = { editVendor, deleteVendor };

  function renderVendorList() {
    const list = document.getElementById('vendor-list');
    const vendors = getVendors();

    if (vendors.length === 0) {
      list.innerHTML = `
        <div class="vendor-empty">
          No vendors added yet.<br>
          Right-click on the map or use the Add button.
        </div>
      `;
      return;
    }

    list.innerHTML = vendors.map(v => {
      const typeName = VENDOR_TYPES.find(t => t.value === v.type)?.label || v.type;
      return `
        <div class="vendor-item" data-vendor-id="${v.id}">
          <div class="vendor-item-header">
            <span class="vendor-item-name">${escapeHtml(v.name)}</span>
            <span class="vendor-item-type">${typeName}</span>
          </div>
          <div class="vendor-item-coords">X: ${v.x} &nbsp; Y: ${v.y}</div>
        </div>
      `;
    }).join('');

    // Click to fly to vendor
    list.querySelectorAll('.vendor-item').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.dataset.vendorId;
        const vendor = getVendors().find(v => v.id === id);
        if (vendor) {
          map.flyTo([-vendor.y, vendor.x], 1, { duration: 0.5 });
          setTimeout(() => {
            if (vendorMarkers[id]) vendorMarkers[id].openPopup();
          }, 600);
        }
      });
    });
  }

  // ─── Vendor Modal ──────────────────────────────────────
  function initVendorForm() {
    // Populate vendor type dropdown
    const typeSelect = document.getElementById('vendor-type');
    VENDOR_TYPES.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t.value;
      opt.textContent = t.label;
      typeSelect.appendChild(opt);
    });

    // Add vendor button
    document.getElementById('btn-add-vendor').addEventListener('click', () => {
      openVendorModal();
    });

    // Save
    document.getElementById('btn-save-vendor').addEventListener('click', (e) => {
      e.preventDefault();
      saveVendorForm();
    });

    // Cancel
    document.getElementById('btn-cancel-vendor').addEventListener('click', closeVendorModal);
    document.getElementById('modal-close').addEventListener('click', closeVendorModal);

    // Delete
    document.getElementById('btn-delete-vendor').addEventListener('click', () => {
      if (editingVendorId && confirm('Delete this vendor?')) {
        deleteVendor(editingVendorId);
        closeVendorModal();
      }
    });

    // Close modal on overlay click
    document.getElementById('vendor-modal').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) closeVendorModal();
    });

    // Import/Export
    document.getElementById('btn-export-vendor').addEventListener('click', exportVendors);
    document.getElementById('btn-import-vendor').addEventListener('click', () => {
      document.getElementById('import-file').click();
    });
    document.getElementById('import-file').addEventListener('change', importVendors);
  }

  function openVendorModal(vendor) {
    editingVendorId = vendor ? vendor.id : null;

    document.getElementById('modal-title').textContent = vendor ? 'Edit Vendor' : 'Add Vendor';
    document.getElementById('vendor-id').value = vendor ? vendor.id : '';
    document.getElementById('vendor-name').value = vendor ? vendor.name : '';
    document.getElementById('vendor-type').value = vendor ? vendor.type : 'misc';
    document.getElementById('vendor-x').value = vendor ? vendor.x : (contextMenuCoords ? contextMenuCoords.x : '');
    document.getElementById('vendor-y').value = vendor ? vendor.y : (contextMenuCoords ? contextMenuCoords.y : '');
    document.getElementById('vendor-items').value = vendor ? (vendor.items || '') : '';
    document.getElementById('vendor-notes').value = vendor ? (vendor.notes || '') : '';
    document.getElementById('btn-delete-vendor').style.display = vendor ? 'inline-flex' : 'none';

    document.getElementById('vendor-modal').classList.add('active');
    contextMenuCoords = null;

    setTimeout(() => document.getElementById('vendor-name').focus(), 100);
  }

  function closeVendorModal() {
    document.getElementById('vendor-modal').classList.remove('active');
    editingVendorId = null;
    contextMenuCoords = null;
  }

  function saveVendorForm() {
    const name = document.getElementById('vendor-name').value.trim();
    const type = document.getElementById('vendor-type').value;
    const x = parseInt(document.getElementById('vendor-x').value);
    const y = parseInt(document.getElementById('vendor-y').value);
    const items = document.getElementById('vendor-items').value.trim();
    const notes = document.getElementById('vendor-notes').value.trim();

    if (!name || isNaN(x) || isNaN(y)) {
      showToast('Please fill in name and coordinates');
      return;
    }

    const data = { name, type, x, y, items, notes };

    if (editingVendorId) {
      updateVendor(editingVendorId, data);
    } else {
      addVendor(data);
    }

    closeVendorModal();
  }

  function exportVendors() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      const all = data ? JSON.parse(data) : {};
      const blob = new Blob([JSON.stringify(all, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'uo_vendors.json';
      a.click();
      URL.revokeObjectURL(url);
      showToast('Vendors exported');
    } catch (e) {
      showToast('Export failed');
    }
  }

  function importVendors(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (ev) {
      try {
        const imported = JSON.parse(ev.target.result);
        // Merge with existing
        const existing = localStorage.getItem(STORAGE_KEY);
        const all = existing ? JSON.parse(existing) : {};

        Object.entries(imported).forEach(([facet, vendors]) => {
          if (Array.isArray(vendors)) {
            if (!all[facet]) all[facet] = [];
            // Add only new vendors (by id)
            const existingIds = new Set(all[facet].map(v => v.id));
            vendors.forEach(v => {
              if (!existingIds.has(v.id)) {
                all[facet].push(v);
              }
            });
          }
        });

        localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
        loadVendorMarkers();
        showToast('Vendors imported');
      } catch (err) {
        showToast('Invalid file format');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  // ─── Layer Controls ────────────────────────────────────
  function initLayerControls() {
    const container = document.getElementById('layer-controls');
    const savedVisibility = getLayerVisibility();

    Object.entries(POI_CATEGORIES).forEach(([catId, cat]) => {
      const checked = savedVisibility[catId] !== false;
      const item = document.createElement('label');
      item.className = 'layer-item';
      item.innerHTML = `
        <input type="checkbox" data-layer="${catId}" ${checked ? 'checked' : ''}>
        <span class="layer-toggle"></span>
        <span class="layer-icon" style="background: ${cat.markerColor}"></span>
        <span class="layer-name">${cat.name}</span>
        <span class="layer-count" data-count="${catId}">0</span>
      `;
      container.appendChild(item);

      item.querySelector('input').addEventListener('change', function () {
        toggleLayer(catId, this.checked);
      });
    });
  }

  function toggleLayer(catId, visible) {
    const lg = layerGroups[catId];
    if (!lg) return;

    if (visible) {
      lg.addTo(map);
    } else {
      map.removeLayer(lg);
    }

    const vis = getLayerVisibility();
    vis[catId] = visible;
    localStorage.setItem(LAYER_VISIBILITY_KEY, JSON.stringify(vis));
  }

  function getLayerVisibility() {
    try {
      const data = localStorage.getItem(LAYER_VISIBILITY_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  function updateLayerCounts() {
    Object.entries(layerGroups).forEach(([catId, lg]) => {
      const count = lg.getLayers().length;
      const el = document.querySelector(`[data-count="${catId}"]`);
      if (el) el.textContent = count;
    });
  }

  // ─── Sidebar ───────────────────────────────────────────
  function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggle = document.getElementById('sidebar-toggle');

    // Start collapsed
    sidebar.classList.add('collapsed');

    toggle.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
      const icon = toggle.querySelector('i');
      if (sidebar.classList.contains('collapsed')) {
        icon.className = 'fa-solid fa-chevron-right';
      } else {
        icon.className = 'fa-solid fa-chevron-left';
      }
    });

    // Map selector
    document.getElementById('map-select').addEventListener('change', function () {
      loadFacet(this.value);
    });
  }

  // ─── Search ────────────────────────────────────────────
  function initSearch() {
    const input = document.getElementById('search');
    const results = document.getElementById('search-results');
    let debounceTimer;

    input.addEventListener('input', function () {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        performSearch(this.value.trim());
      }, 150);
    });

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        this.value = '';
        results.classList.remove('active');
        results.innerHTML = '';
      }
    });
  }

  function performSearch(query) {
    const results = document.getElementById('search-results');

    if (!query || query.length < 2) {
      results.classList.remove('active');
      results.innerHTML = '';
      return;
    }

    const lowerQuery = query.toLowerCase();
    const matches = [];

    // Search POIs
    const pois = POI_DATA[currentFacet];
    if (pois) {
      Object.entries(pois).forEach(([catId, items]) => {
        const cat = POI_CATEGORIES[catId];
        items.forEach(poi => {
          if (poi.name.toLowerCase().includes(lowerQuery)) {
            matches.push({ ...poi, category: catId, categoryName: cat.name, color: cat.markerColor });
          }
        });
      });
    }

    // Search vendors
    getVendors().forEach(v => {
      if (v.name.toLowerCase().includes(lowerQuery) ||
          (v.items && v.items.toLowerCase().includes(lowerQuery))) {
        const cat = POI_CATEGORIES.vendor;
        matches.push({ ...v, category: 'vendor', categoryName: cat.name, color: cat.markerColor });
      }
    });

    if (matches.length === 0) {
      results.innerHTML = '<div class="search-result-item"><span class="result-name" style="color: var(--text-muted)">No results found</span></div>';
      results.classList.add('active');
      return;
    }

    results.innerHTML = matches.slice(0, 20).map(m => `
      <div class="search-result-item" data-x="${m.x}" data-y="${m.y}">
        <span class="result-icon" style="background: ${m.color}"></span>
        <span class="result-name">${escapeHtml(m.name)}</span>
        <span class="result-category">${m.categoryName}</span>
      </div>
    `).join('');

    results.classList.add('active');

    results.querySelectorAll('.search-result-item').forEach(el => {
      el.addEventListener('click', () => {
        const x = parseInt(el.dataset.x);
        const y = parseInt(el.dataset.y);
        if (!isNaN(x) && !isNaN(y)) {
          map.flyTo([-y, x], 1, { duration: 0.5 });
          results.classList.remove('active');
          document.getElementById('search').value = '';
        }
      });
    });
  }

  // ─── Context Menu ──────────────────────────────────────
  function initContextMenu() {
    const menu = document.getElementById('context-menu');

    map.on('contextmenu', function (e) {
      e.originalEvent.preventDefault();
      const x = Math.round(e.latlng.lng);
      const y = Math.round(-e.latlng.lat);
      contextMenuCoords = { x, y };

      menu.style.left = e.originalEvent.pageX + 'px';
      menu.style.top = e.originalEvent.pageY + 'px';
      menu.classList.add('active');
    });

    document.getElementById('ctx-add-vendor').addEventListener('click', () => {
      hideContextMenu();
      openVendorModal();
    });

    document.getElementById('ctx-copy-coords').addEventListener('click', () => {
      if (contextMenuCoords) {
        const text = `${contextMenuCoords.x}, ${contextMenuCoords.y}`;
        navigator.clipboard.writeText(text).then(() => {
          showToast(`Copied: ${text}`);
        }).catch(() => {
          showToast(`X: ${contextMenuCoords.x}, Y: ${contextMenuCoords.y}`);
        });
      }
      hideContextMenu();
    });

    // Close on click elsewhere
    document.addEventListener('click', (e) => {
      if (!menu.contains(e.target)) hideContextMenu();
    });
  }

  function hideContextMenu() {
    document.getElementById('context-menu').classList.remove('active');
  }

  // ─── Zoom Controls ────────────────────────────────────
  function initZoomControls() {
    document.getElementById('zoom-in').addEventListener('click', () => map.zoomIn(0.5));
    document.getElementById('zoom-out').addEventListener('click', () => map.zoomOut(0.5));

    // Isometric toggle
    const isoBtn = document.getElementById('toggle-iso');
    isoBtn.addEventListener('click', () => {
      const mapEl = document.getElementById('map');
      const isIso = mapEl.classList.toggle('isometric');
      isoBtn.classList.toggle('active', isIso);
      // Force Leaflet to recalculate sizes after transform
      setTimeout(() => map.invalidateSize(), 50);
    });
  }

  // ─── Toast ─────────────────────────────────────────────
  function showToast(message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fa-solid fa-circle-check" style="color: var(--success)"></i> ${escapeHtml(message)}`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  // ─── Utils ─────────────────────────────────────────────
  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ─── Start ─────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', init);
})();
