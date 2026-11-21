// Cover renderer for Vice Coast Cover Studio.
//
// drawCover paints one cover onto a canvas context at any size: the
// backdrop, the photo panels with their frames and grade wash, then the
// title, subtitle and badge. Everything is drawn from the state object
// main.js keeps: photos, panels, views, layout, grade and the three texts.
import { gradeById } from './grades.js';
import { zonesFor } from './layouts.js';
import { coverRect } from './photos.js';

const CREAM = '#f6ead6';
const GUTTER = '#1b1030';
const TITLE_FACE = 'Anton, "Arial Narrow", sans-serif';
const SCRIPT_FACE = 'Pacifico, cursive';

// Shrink a title until it fits its maximum width, then return the size.
function fitSize(ctx, text, size, maxW, face) {
  let s = size;
  ctx.font = `400 ${s}px ${face}`;
  while (s > 12 && ctx.measureText(text).width > maxW) {
    s = Math.floor(s * 0.94);
    ctx.font = `400 ${s}px ${face}`;
  }
  return s;
}

// The sky behind Tilted Snaps: a vertical gradient with a pale sun.
function paintSky(ctx, W, H, grade, sun) {
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  const stops = grade.sky;
  stops.forEach((c, i) => sky.addColorStop(i / (stops.length - 1), c));
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);
  if (sun) {
    ctx.fillStyle = '#ffe9b0';
    ctx.beginPath();
    ctx.arc(sun.x, sun.y, sun.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

// The dotted pattern inside the Nine Panel title cell.
function paintDots(ctx, cell, grade) {
  ctx.save();
  ctx.fillStyle = grade.accent;
  ctx.globalAlpha = 0.16;
  const step = Math.max(14, Math.round(cell.w / 24));
  for (let y = cell.y + step; y < cell.y + cell.h; y += step) {
    for (let x = cell.x + step; x < cell.x + cell.w; x += step) {
      ctx.beginPath();
      ctx.arc(x, y, Math.max(2, step * 0.09), 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

// One photo panel: the picture cover-fitted with its panel's framing,
// the grade wash over it, and the frame around it.
function paintPanel(ctx, panel, photo, view, grade, W) {
  const rim = Math.round(0.006 * W);
  ctx.save();
  if (panel.tilt) {
    ctx.translate(panel.x + panel.w / 2, panel.y + panel.h / 2);
    ctx.rotate((panel.tilt * Math.PI) / 180);
    ctx.translate(-panel.w / 2, -panel.h / 2);
  }
  if (panel.frame === 'polaroid') {
    ctx.fillStyle = '#fdf8ec';
    ctx.shadowColor = 'rgba(20, 8, 32, 0.45)';
    ctx.shadowBlur = Math.round(0.02 * W);
    ctx.shadowOffsetY = Math.round(0.008 * W);
    ctx.fillRect(panel.x, panel.y, panel.w, panel.h);
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
  } else if (panel.frame === 'cream') {
    ctx.fillStyle = CREAM;
    ctx.fillRect(panel.x, panel.y, panel.w, panel.h);
  }
  const inner = panel.frame === 'polaroid'
    ? { x: rim, y: rim, w: panel.w - 2 * rim, h: panel.h - rim - Math.round(0.045 * panel.h) }
    : panel.frame === 'cream'
      ? { x: rim, y: rim, w: panel.w - 2 * rim, h: panel.h - 2 * rim }
      : { x: 0, y: 0, w: panel.w, h: panel.h };
  ctx.save();
  ctx.beginPath();
  ctx.rect(panel.x + inner.x, panel.y + inner.y, inner.w, inner.h);
  ctx.clip();
  const r = coverRect(photo.img, inner.w, inner.h, view.zoom, view.ox, view.oy);
  ctx.drawImage(photo.img, panel.x + inner.x + r.dx, panel.y + inner.y + r.dy, r.dw, r.dh);
  if (grade.wash) {
    ctx.globalCompositeOperation = grade.washBlend;
    ctx.globalAlpha = grade.washAlpha;
    ctx.fillStyle = grade.wash;
    ctx.fillRect(panel.x + inner.x, panel.y + inner.y, inner.w, inner.h);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }
  ctx.restore();
  ctx.restore();
}

// The badge: a solid accent chip with dark bold lettering. spot.align
// says where spot.x sits: 'right' puts the chip's right edge there,
// 'center' centres the chip on it, anything else starts the chip there.
function paintBadge(ctx, spot, text, grade) {
  if (!text) return;
  ctx.font = `400 ${spot.size}px ${TITLE_FACE}`;
  const tw = ctx.measureText(text).width;
  const padX = Math.round(spot.size * 0.7);
  const padY = Math.round(spot.size * 0.45);
  const bw = tw + 2 * padX;
  const bh = spot.size + 2 * padY;
  const bx = spot.align === 'right' ? spot.x - bw : spot.align === 'center' ? spot.x - bw / 2 : spot.x;
  ctx.fillStyle = grade.accent;
  ctx.fillRect(bx, spot.y, bw, bh);
  ctx.fillStyle = grade.ink;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, bx + padX, spot.y + bh / 2 + 1);
}

// The big title and the script subtitle under it.
function paintLettering(ctx, titleZone, subtitleZone, title, subtitle, grade) {
  if (title) {
    const size = fitSize(ctx, title, titleZone.size, titleZone.maxW, TITLE_FACE);
    ctx.font = `400 ${size}px ${TITLE_FACE}`;
    ctx.textAlign = titleZone.align ?? 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.shadowColor = grade.accent;
    ctx.shadowBlur = Math.round(size * 0.22);
    ctx.lineJoin = 'round';
    ctx.strokeStyle = grade.edge;
    ctx.lineWidth = Math.max(2, Math.round(size * 0.09));
    ctx.strokeText(title, titleZone.x, titleZone.baseline);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(title, titleZone.x, titleZone.baseline);
    ctx.textAlign = 'left';
  }
  if (subtitle) {
    const size = fitSize(ctx, subtitle, subtitleZone.size, subtitleZone.maxW, SCRIPT_FACE);
    ctx.font = `400 ${size}px ${SCRIPT_FACE}`;
    ctx.textAlign = subtitleZone.align ?? 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.shadowColor = 'rgba(20, 8, 32, 0.6)';
    ctx.shadowBlur = Math.round(size * 0.18);
    ctx.fillStyle = grade.accent;
    ctx.fillText(subtitle, subtitleZone.x, subtitleZone.baseline);
    ctx.shadowBlur = 0;
    ctx.textAlign = 'left';
  }
}

// Paint one whole cover. state holds photos (slots), panels (slot per
// user panel), views (framing per user panel), layout, grade and the
// three texts. A zone panel names its user panel; the photo it shows is
// the slot that panel picks.
export function drawCover(ctx, W, H, state) {
  const grade = gradeById(state.grade);
  const zones = zonesFor(state.layout, W, H);
  ctx.save();
  ctx.clearRect(0, 0, W, H);
  if (zones.backdrop === 'sky') {
    paintSky(ctx, W, H, grade, zones.sun);
  } else if (zones.backdrop === 'cream') {
    ctx.fillStyle = CREAM;
    ctx.fillRect(0, 0, W, H);
    const m = Math.round(0.012 * W);
    ctx.fillStyle = GUTTER;
    ctx.fillRect(m, m, W - 2 * m, H - 2 * m);
  }
  if (zones.titleCell) {
    const cell = zones.titleCell;
    const grad = ctx.createLinearGradient(0, cell.y, 0, cell.y + cell.h);
    grad.addColorStop(0, grade.accent);
    grad.addColorStop(1, '#7b2fbe');
    ctx.fillStyle = grad;
    ctx.fillRect(cell.x, cell.y, cell.w, cell.h);
    paintDots(ctx, cell, grade);
  }
  zones.panels.forEach((panel) => {
    const slot = state.panels[panel.panel] ?? 0;
    const photo = state.photos[slot] ?? state.photos[0];
    if (!photo) return;
    paintPanel(ctx, panel, photo, state.views[panel.panel], grade, W);
  });
  if (zones.band) {
    const band = ctx.createLinearGradient(0, zones.band.from * H, 0, zones.band.to * H);
    band.addColorStop(0, 'rgba(20, 8, 32, 0)');
    band.addColorStop(1, 'rgba(20, 8, 32, 0.88)');
    ctx.fillStyle = band;
    ctx.fillRect(0, zones.band.from * H, W, (zones.band.to - zones.band.from) * H);
  }
  paintLettering(ctx, zones.title, zones.subtitle, state.title, state.subtitle, grade);
  paintBadge(ctx, zones.badge, state.badge, grade);
  ctx.restore();
}
