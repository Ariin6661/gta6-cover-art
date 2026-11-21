// Shot mode and PNG export for Vice Coast Cover Studio.
//
// The app answers two calls the maker uses to take screenshots:
//   ?shot=editor&photo=<sample>&caption=...&subtitle=...&layout=...&grade=...
// loads that scene and raises window.__shotReady once it is drawn, and
// window.__exportCover('<W>x<H>') renders the cover offscreen and hands
// back a PNG data URL.
import { drawCover } from './cover.js';
import { loadSample } from './photos.js';

export const SIZES = [
  { id: '1080x1080', label: '1080 × 1080', w: 1080, h: 1080 },
  { id: '1080x1350', label: '1080 × 1350', w: 1080, h: 1350 },
  { id: '1920x1080', label: '1920 × 1080', w: 1920, h: 1080 },
];

export function sizeById(id) {
  return SIZES.find((s) => s.id === id) ?? SIZES[0];
}

// Render the cover at an export size and return it as a PNG data URL.
export function exportCover(state, sizeId) {
  const size = sizeById(sizeId);
  const canvas = document.createElement('canvas');
  canvas.width = size.w;
  canvas.height = size.h;
  const ctx = canvas.getContext('2d');
  drawCover(ctx, size.w, size.h, state);
  return canvas.toDataURL('image/png');
}

// Read the ?shot= scene from the URL, apply it to the state, redraw, and
// raise window.__shotReady. Also publishes window.__exportCover for the
// export button and for screenshot scripts.
export async function setupShots(state, redraw) {
  window.__exportCover = (sizeId) => exportCover(state, sizeId);
  const q = new URLSearchParams(window.location.search);
  if (!q.has('shot')) {
    window.__shotReady = true;
    return;
  }
  const photoId = q.get('photo');
  if (photoId) {
    try {
      const img = await loadSample(photoId);
      state.photos[state.panels[state.selected]] = { img, label: photoId };
    } catch {
      // A missing sample leaves the bundled photo in place.
    }
  }
  if (q.get('caption') !== null) state.title = q.get('caption');
  if (q.get('subtitle') !== null) state.subtitle = q.get('subtitle');
  if (q.get('layout')) state.layout = q.get('layout');
  if (q.get('grade')) state.grade = q.get('grade');
  await document.fonts.ready;
  redraw();
  window.__shotReady = true;
}
