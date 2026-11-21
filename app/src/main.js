// Vice Coast Cover Studio — editor wiring.
//
// main.js owns the editor state (four photo slots, which slot each panel
// shows, each panel's framing, the layout, grade, texts and export size),
// builds the controls from the grades/layouts/samples tables, draws the
// live preview, and handles dragging, zooming and exporting.
import { drawCover } from './cover.js';
import { GRADES } from './grades.js';
import { LAYOUTS } from './layouts.js';
import { SAMPLES, loadSample, fileToImage, makePhoto, makeView, centreView } from './photos.js';
import { SIZES, sizeById, exportCover, setupShots } from './shots.js';
import { zonesFor } from './layouts.js';

const PREVIEW = 900;
const DARK = '#160a24';

const state = {
  photos: [],
  panels: [0, 1, 2, 3],
  views: [makeView(), makeView(), makeView(), makeView()],
  selected: 0,
  layout: 'poster',
  grade: 'sunset',
  title: 'VICE COAST',
  subtitle: 'sunset heist',
  badge: 'EST. 2026',
  size: '1080x1080',
};

const canvas = document.querySelector('#preview');
const ctx = canvas.getContext('2d');
const statusEl = document.querySelector('#status');
const readoutEl = document.querySelector('#panelReadout');
const zoomEl = document.querySelector('#zoom');

function say(text) {
  statusEl.textContent = text;
}

function showPanel() {
  const view = state.views[state.selected];
  readoutEl.textContent = `Panel ${state.selected + 1} — zoom ${view.zoom.toFixed(2)}x, drag the photo on the preview to move it`;
  zoomEl.value = String(view.zoom);
}

// Draw the cover into the square preview, fitted with dark bars.
function drawPreview() {
  const size = sizeById(state.size);
  const scale = Math.min(PREVIEW / size.w, PREVIEW / size.h);
  const dw = size.w * scale;
  const dh = size.h * scale;
  ctx.fillStyle = DARK;
  ctx.fillRect(0, 0, PREVIEW, PREVIEW);
  ctx.save();
  ctx.translate((PREVIEW - dw) / 2, (PREVIEW - dh) / 2);
  ctx.scale(scale, scale);
  drawCover(ctx, size.w, size.h, state);
  ctx.restore();
}

function redraw() {
  drawPreview();
  showPanel();
}

// Build the sample chips: one button per bundled photo.
function buildSamples() {
  const row = document.querySelector('#sampleRow');
  SAMPLES.forEach((sample) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = sample.label;
    btn.addEventListener('click', async () => {
      try {
        const img = await loadSample(sample.id);
        state.photos[state.panels[state.selected]] = makePhoto(img, sample.label);
        redraw();
        say(`Sample ${sample.label} in Panel ${state.selected + 1}`);
      } catch {
        say(`Could not load ${sample.label}`);
      }
    });
    row.appendChild(btn);
  });
}

// Build the four panel rows: a label and a select of Photo 1–4.
function buildPanels() {
  const list = document.querySelector('#panelList');
  for (let i = 0; i < 4; i += 1) {
    const row = document.createElement('div');
    row.className = 'panel-row';
    const label = document.createElement('span');
    label.textContent = `Panel ${i + 1}`;
    const select = document.createElement('select');
    select.setAttribute('aria-label', `Photo for Panel ${i + 1}`);
    for (let s = 0; s < 4; s += 1) {
      const opt = document.createElement('option');
      opt.value = String(s);
      opt.textContent = `Photo ${s + 1}`;
      select.appendChild(opt);
    }
    select.value = String(state.panels[i]);
    select.addEventListener('change', () => {
      state.panels[i] = Number(select.value);
      redraw();
    });
    row.append(label, select);
    list.appendChild(row);
  }
}

function syncPanels() {
  document.querySelectorAll('#panelList select').forEach((select, i) => {
    select.value = String(state.panels[i]);
  });
}

// Re-mark the toggle buttons from the state, for when shot mode changes
// the layout, grade or size after the controls were built.
function syncToggles() {
  const rows = [
    ['#layoutRow', state.layout],
    ['#gradeRow', state.grade],
    ['#sizeRow', state.size],
  ];
  for (const [selector, current] of rows) {
    document.querySelectorAll(`${selector} button`).forEach((btn) => {
      btn.classList.toggle('on', btn.dataset.id === current);
    });
  }
}

// One row of toggle buttons from a table: layouts, grades or sizes.
function buildToggles(rowId, items, current, onPick, dotOf) {
  const row = document.querySelector(rowId);
  items.forEach((item) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.dataset.id = item.id;
    if (dotOf) {
      const dot = document.createElement('span');
      dot.className = 'dot';
      dot.style.background = dotOf(item);
      btn.append(dot, document.createTextNode(item.label));
    } else {
      btn.textContent = item.label;
    }
    if (item.id === current()) btn.classList.add('on');
    btn.addEventListener('click', () => {
      onPick(item.id);
      row.querySelectorAll('button').forEach((b) => b.classList.remove('on'));
      btn.classList.add('on');
      redraw();
    });
    row.appendChild(btn);
  });
}

function buildControls() {
  buildSamples();
  buildPanels();
  document.querySelector('#fillAll').addEventListener('click', () => {
    const slot = state.panels[state.selected];
    state.panels = state.panels.map(() => slot);
    syncPanels();
    redraw();
    say(`Photo ${slot + 1} in every panel`);
  });
  buildToggles('#layoutRow', LAYOUTS, () => state.layout, (id) => { state.layout = id; });
  buildToggles('#gradeRow', GRADES, () => state.grade, (id) => { state.grade = id; }, (g) => g.dot);
  buildToggles('#sizeRow', SIZES, () => state.size, (id) => { state.size = id; });
}

// Caption inputs, zoom slider, centre button, upload and export.
function bindEditor() {
  const titleInput = document.querySelector('#title');
  const subtitleInput = document.querySelector('#subtitle');
  const badgeInput = document.querySelector('#badge');
  titleInput.addEventListener('input', () => { state.title = titleInput.value; redraw(); });
  subtitleInput.addEventListener('input', () => { state.subtitle = subtitleInput.value; redraw(); });
  badgeInput.addEventListener('input', () => { state.badge = badgeInput.value; redraw(); });
  zoomEl.addEventListener('input', () => {
    state.views[state.selected].zoom = Number(zoomEl.value);
    redraw();
  });
  document.querySelector('#centerPanel').addEventListener('click', () => {
    centreView(state.views[state.selected]);
    redraw();
    say(`Panel ${state.selected + 1} centred`);
  });
  document.querySelector('#upload').addEventListener('change', async (event) => {
    const files = [...event.target.files];
    let slot = state.panels[state.selected];
    for (const file of files) {
      try {
        const img = await fileToImage(file);
        state.photos[slot] = makePhoto(img, file.name);
        slot = (slot + 1) % 4;
      } catch {
        say(`Could not read ${file.name}`);
      }
    }
    event.target.value = '';
    redraw();
    say(`Loaded ${files.length} photo${files.length === 1 ? '' : 's'}`);
  });
  document.querySelector('#export').addEventListener('click', () => {
    const url = exportCover(state, state.size);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vice-coast-${state.size}.png`;
    link.click();
    say(`Saved vice-coast-${state.size}.png`);
  });
}

// Map a point on the preview canvas back to cover coordinates.
function toCover(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const px = ((clientX - rect.left) / rect.width) * PREVIEW;
  const py = ((clientY - rect.top) / rect.height) * PREVIEW;
  const size = sizeById(state.size);
  const scale = Math.min(PREVIEW / size.w, PREVIEW / size.h);
  const dx = (PREVIEW - size.w * scale) / 2;
  const dy = (PREVIEW - size.h * scale) / 2;
  return { cx: (px - dx) / scale, cy: (py - dy) / scale };
}

// Find which panel zone a point lands in, if any.
function panelAt(clientX, clientY) {
  const { cx, cy } = toCover(clientX, clientY);
  const size = sizeById(state.size);
  const zones = zonesFor(state.layout, size.w, size.h);
  const hit = zones.panels.findIndex((p) => cx >= p.x && cx <= p.x + p.w && cy >= p.y && cy <= p.y + p.h);
  return hit < 0 ? null : { panel: zones.panels[hit].panel, cx, cy };
}

function bindCanvas() {
  let drag = null;
  canvas.addEventListener('pointerdown', (event) => {
    const hit = panelAt(event.clientX, event.clientY);
    if (!hit) return;
    state.selected = hit.panel;
    canvas.setPointerCapture(event.pointerId);
    drag = { x: hit.cx, y: hit.cy, view: state.views[hit.panel] };
    redraw();
  });
  canvas.addEventListener('pointermove', (event) => {
    if (!drag) return;
    const { cx, cy } = toCover(event.clientX, event.clientY);
    drag.view.ox += cx - drag.x;
    drag.view.oy += cy - drag.y;
    drag.x = cx;
    drag.y = cy;
    redraw();
  });
  const endDrag = () => { drag = null; };
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);
  canvas.addEventListener('wheel', (event) => {
    event.preventDefault();
    const view = state.views[state.selected];
    view.zoom = Math.min(4, Math.max(0.5, view.zoom * (event.deltaY < 0 ? 1.1 : 1 / 1.1)));
    redraw();
  }, { passive: false });
}

// Keep the caption inputs in step with the state (shot mode changes it).
function syncInputs() {
  document.querySelector('#title').value = state.title;
  document.querySelector('#subtitle').value = state.subtitle;
  document.querySelector('#badge').value = state.badge;
}

async function init() {
  for (let i = 0; i < SAMPLES.length; i += 1) {
    const img = await loadSample(SAMPLES[i].id);
    state.photos[i] = makePhoto(img, SAMPLES[i].label);
  }
  buildControls();
  bindEditor();
  bindCanvas();
  try {
    await Promise.all([
      document.fonts.load('400 100px Anton'),
      document.fonts.load('400 100px Pacifico'),
    ]);
  } catch {
    // The canvas falls back to system fonts if the files fail to load.
  }
  redraw();
  await setupShots(state, redraw);
  syncInputs();
  syncToggles();
  redraw();
}

init();
