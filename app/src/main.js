// Vice Coast editor wiring: pick photos, arrange them in panels, letter
// the caption, pick a grade, and export a PNG. A `?shot=` query sets up a
// fixed scene for a screenshot instead (see shots.js).
import { drawCover, renderCover } from './cover.js';
import { GRADES, GRADE_ORDER } from './grades.js';
import { LAYOUTS, LAYOUT_ORDER } from './layouts.js';
import { loadImage, loadSamplePhotos, SAMPLE_NAMES } from './photos.js';
import { runShot } from './shots.js';

export const EXPORT_SIZES = ['1080x1080', '1080x1350', '1920x1080'];

const state = {
  layout: 'poster',
  grade: 'sunset',
  title: 'VICE COAST',
  subtitle: 'sunset heist',
  badge: 'EST. 2026',
  photos: [null, null, null, null],
  panels: [],
};

let selectedPanel = 0;
let previewSize = '1080x1080';

/** Shorthand for the editor's DOM nodes, looked up once. */
const els = {
  canvas: document.getElementById('preview'),
  status: document.getElementById('status'),
  layoutRow: document.getElementById('layoutRow'),
  gradeRow: document.getElementById('gradeRow'),
  panelList: document.getElementById('panelList'),
  zoom: document.getElementById('zoom'),
  readout: document.getElementById('panelReadout'),
  sampleRow: document.getElementById('sampleRow'),
  sizeRow: document.getElementById('sizeRow'),
};

/** Rebuilds the panel list for the current layout, keeping photo picks where they fit. */
export function resetPanels(force) {
  const count = LAYOUTS[state.layout].slots(100, 100).length;
  const loaded = Math.max(1, state.photos.filter(Boolean).length);
  const kept = state.panels;
  state.panels = Array.from({ length: count }, (_, i) => {
    const old = kept[i];
    if (old && !force && old.photo < state.photos.length) return old;
    return { photo: i % loaded, zoom: 1, dx: 0, dy: 0 };
  });
}

/** Renders the preview at a capped size for speed. */
export function redraw() {
  const [w, h] = previewSize.split('x').map(Number);
  const cap = 900;
  const scale = Math.min(1, cap / Math.max(w, h));
  els.canvas.width = Math.round(w * scale);
  els.canvas.height = Math.round(h * scale);
  drawCover(els.canvas, state);
  highlightSelectedPanel();
}

/** Outlines the selected panel on the preview. */
export function highlightSelectedPanel() {
  const ctx = els.canvas.getContext('2d');
  const slots = LAYOUTS[state.layout].slots(els.canvas.width, els.canvas.height);
  const slot = slots[selectedPanel];
  if (!slot) return;
  ctx.save();
  ctx.translate(slot.x + slot.w / 2, slot.y + slot.h / 2);
  ctx.rotate(slot.rot || 0);
  ctx.translate(-slot.w / 2, -slot.h / 2);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.setLineDash([10, 6]);
  ctx.strokeRect(2, 2, slot.w - 4, slot.h - 4);
  ctx.restore();
}

/** Finds the panel slot under a point in canvas pixels. */
export function panelAt(px, py) {
  const slots = LAYOUTS[state.layout].slots(els.canvas.width, els.canvas.height);
  for (let i = slots.length - 1; i >= 0; i--) {
    const s = slots[i];
    if (px >= s.x && px <= s.x + s.w && py >= s.y && py <= s.y + s.h) return i;
  }
  return -1;
}

/** Converts a pointer event into canvas pixels. */
function eventPoint(e) {
  const r = els.canvas.getBoundingClientRect();
  return {
    x: (e.clientX - r.left) * (els.canvas.width / r.width),
    y: (e.clientY - r.top) * (els.canvas.height / r.height),
  };
}

let drag = null;
els.canvas.addEventListener('pointerdown', (e) => {
  const { x, y } = eventPoint(e);
  const hit = panelAt(x, y);
  if (hit < 0) return;
  selectedPanel = hit;
  drag = { x, y };
  els.canvas.setPointerCapture(e.pointerId);
  redraw();
  syncPanelControls();
});
els.canvas.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const { x, y } = eventPoint(e);
  const slots = LAYOUTS[state.layout].slots(els.canvas.width, els.canvas.height);
  const slot = slots[selectedPanel];
  const panel = state.panels[selectedPanel];
  if (!slot || !panel) return;
  panel.dx = Math.max(-1, Math.min(1, panel.dx + (x - drag.x) / slot.w));
  panel.dy = Math.max(-1, Math.min(1, panel.dy + (y - drag.y) / slot.h));
  drag = { x, y };
  redraw();
});
els.canvas.addEventListener('pointerup', () => { drag = null; });

/** Makes one picker button: `on` marks the active choice. */
function pickButton(label, active, onClick) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'pick';
  b.textContent = label;
  if (active) b.classList.add('on');
  b.addEventListener('click', onClick);
  return b;
}

/** Marks `button` as the active one inside its row. */
function markActive(row, button) {
  row.querySelectorAll('.pick').forEach((x) => x.classList.toggle('on', x === button));
}

/** Builds the layout and grade picker buttons. */
export function buildPickers() {
  for (const key of LAYOUT_ORDER) {
    const b = pickButton(LAYOUTS[key].label, key === state.layout, () => {
      state.layout = key;
      selectedPanel = 0;
      resetPanels();
      markActive(els.layoutRow, b);
      redraw();
      buildPanelList();
    });
    b.title = LAYOUTS[key].blurb;
    els.layoutRow.appendChild(b);
  }
  for (const key of GRADE_ORDER) {
    const b = pickButton(GRADES[key].label, key === state.grade, () => {
      state.grade = key;
      markActive(els.gradeRow, b);
      redraw();
    });
    b.classList.add('swatch');
    b.style.setProperty('--sw', GRADES[key].accent);
    els.gradeRow.appendChild(b);
  }
}

/** Builds the per-panel photo pickers (one row per panel). */
export function buildPanelList() {
  els.panelList.innerHTML = '';
  state.panels.forEach((panel, i) => {
    const row = document.createElement('div');
    row.className = 'panel-row';
    if (i === selectedPanel) row.classList.add('on');
    const label = document.createElement('span');
    label.textContent = 'Panel ' + (i + 1);
    const sel = document.createElement('select');
    sel.setAttribute('aria-label', 'Photo for panel ' + (i + 1));
    state.photos.forEach((img, pi) => {
      const opt = document.createElement('option');
      opt.value = pi;
      opt.textContent = img ? 'Photo ' + (pi + 1) : 'Photo ' + (pi + 1) + ' (empty)';
      sel.appendChild(opt);
    });
    sel.value = String(panel.photo);
    sel.addEventListener('change', () => {
      panel.photo = Number(sel.value);
      redraw();
    });
    row.addEventListener('click', (e) => {
      if (e.target === sel) return;
      selectedPanel = i;
      redraw();
      syncPanelControls();
      buildPanelList();
    });
    row.append(label, sel);
    els.panelList.appendChild(row);
  });
}

/** Syncs the zoom slider and panel readout with the selected panel. */
export function syncPanelControls() {
  const panel = state.panels[selectedPanel];
  if (!panel) return;
  els.zoom.value = panel.zoom;
  els.readout.textContent =
    'Panel ' + (selectedPanel + 1) + ' — zoom ' + panel.zoom.toFixed(2) + 'x, drag the photo on the preview to move it';
}

els.zoom.addEventListener('input', (e) => {
  const panel = state.panels[selectedPanel];
  if (!panel) return;
  panel.zoom = Number(e.target.value);
  redraw();
  syncPanelControls();
});
document.getElementById('centerPanel').addEventListener('click', () => {
  const panel = state.panels[selectedPanel];
  if (!panel) return;
  panel.zoom = 1;
  panel.dx = 0;
  panel.dy = 0;
  redraw();
  syncPanelControls();
});
document.getElementById('fillAll').addEventListener('click', () => {
  const panel = state.panels[selectedPanel];
  if (!panel) return;
  for (const p of state.panels) p.photo = panel.photo;
  redraw();
  buildPanelList();
});

/** Loads an image into the first empty photo slot (or slot 0 when full). */
function slotPhoto(img) {
  const empty = state.photos.findIndex((p) => !p);
  state.photos[empty < 0 ? 0 : empty] = img;
}

document.getElementById('upload').addEventListener('change', async (e) => {
  const files = [...e.target.files].slice(0, 4);
  for (const file of files) {
    slotPhoto(await loadImage(URL.createObjectURL(file)));
  }
  resetPanels();
  redraw();
  buildPanelList();
  els.status.textContent = files.length + ' photo' + (files.length === 1 ? '' : 's') +
    ' loaded — pick a panel, then drag and zoom.';
});

for (const name of SAMPLE_NAMES) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'pick';
  b.textContent = name.replace(/-/g, ' ');
  b.addEventListener('click', async () => {
    const [img] = await loadSamplePhotos([name]);
    if (!img) return;
    slotPhoto(img);
    resetPanels();
    redraw();
    buildPanelList();
  });
  els.sampleRow.appendChild(b);
}

for (const [id, key] of [['title', 'title'], ['subtitle', 'subtitle'], ['badge', 'badge']]) {
  document.getElementById(id).addEventListener('input', (e) => {
    state[key] = e.target.value;
    redraw();
  });
}

for (const size of EXPORT_SIZES) {
  const b = pickButton(size.replace('x', ' × '), size === previewSize, () => {
    previewSize = size;
    markActive(els.sizeRow, b);
    redraw();
  });
  els.sizeRow.appendChild(b);
}

document.getElementById('export').addEventListener('click', async () => {
  const dataUrl = await exportCover(previewSize);
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = 'vice-coast-' + previewSize + '.png';
  a.click();
  els.status.textContent = 'Saved vice-coast-' + previewSize + '.png';
});

/** Renders the cover at `size` and returns it as a PNG data URL. */
export async function exportCover(size) {
  await document.fonts.ready;
  const out = renderCover(state, size);
  return out.toDataURL('image/png');
}
window.__exportCover = exportCover;
window.__viceCoast = { state, redraw, resetPanels };

async function boot() {
  buildPickers();
  resetPanels();
  buildPanelList();
  syncPanelControls();
  const query = new URLSearchParams(location.search);
  const shot = query.get('shot');
  if (shot) {
    await runShot(shot, query, (scene) => {
      state.photos = [...scene.photos, null, null, null, null].slice(0, 4);
      state.title = scene.title;
      state.subtitle = scene.subtitle;
      state.layout = scene.layout;
      state.grade = scene.grade;
      document.getElementById('title').value = state.title;
      document.getElementById('subtitle').value = state.subtitle;
      const size = query.get('size');
      if (size && EXPORT_SIZES.includes(size)) previewSize = size;
      resetPanels(true);
      selectedPanel = 0;
      redraw();
      buildPanelList();
    });
  } else {
    const samples = await loadSamplePhotos(['ariin-gta', 'wiwid-gta']);
    state.photos = [...samples, null, null].slice(0, 4);
    resetPanels(true);
    redraw();
    buildPanelList();
  }
}

boot();
