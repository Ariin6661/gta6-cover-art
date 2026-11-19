// Vice Coast cover painting: photo panels in a layout, a sunset or neon
// grade washed over each one, and big caption lettering on top. One
// renderer serves both the live preview and the exported PNG, so what
// you see is exactly what you save.
import { GRADES } from './grades.js';
import { LAYOUTS } from './layouts.js';

/** A small xorshift generator: cheap, deterministic, same dots every render. */
export function makeRng(seed) {
  let s = (seed >>> 0) || 0x9e3779b9;
  return function next() {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
}

/** Paints `img` so it covers `rect`, then zooms and pans it by fractions of the rect. */
export function drawFittedPhoto(ctx, img, rect, zoom, dx, dy) {
  const cover = Math.max(rect.w / img.naturalWidth, rect.h / img.naturalHeight);
  const scale = cover * Math.max(0.2, zoom);
  const w = img.naturalWidth * scale;
  const h = img.naturalHeight * scale;
  const x = rect.x + (rect.w - w) / 2 + dx * rect.w;
  const y = rect.y + (rect.h - h) / 2 + dy * rect.h;
  ctx.drawImage(img, x, y, w, h);
}

/** Washes one photo panel with its grade: warm tint, vertical gradient, vignette. */
export function gradePanel(ctx, rect, grade) {
  ctx.save();
  ctx.globalCompositeOperation = 'soft-light';
  ctx.fillStyle = grade.wash;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  const wash = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
  wash.addColorStop(0, grade.top);
  wash.addColorStop(1, grade.bottom);
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = wash;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.restore();
  const shade = ctx.createRadialGradient(
    rect.x + rect.w / 2, rect.y + rect.h / 2, Math.min(rect.w, rect.h) * 0.35,
    rect.x + rect.w / 2, rect.y + rect.h / 2, Math.max(rect.w, rect.h) * 0.75,
  );
  shade.addColorStop(0, 'rgba(0, 0, 0, 0)');
  shade.addColorStop(1, 'rgba(0, 0, 0, ' + grade.vignette + ')');
  ctx.fillStyle = shade;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
}

/** Shrinks the font until `text` fits `maxWidth`, starting at `start` px. Returns the size. */
export function fitFont(ctx, text, family, start, maxWidth) {
  let size = start;
  const set = (px) => { ctx.font = px + 'px ' + family; };
  set(size);
  while (size > 10 && ctx.measureText(text).width > maxWidth) {
    size = Math.max(10, Math.floor(size / 1.06));
    set(size);
  }
  return size;
}

/** Fills a title block's sunset gradient and speckles it with light dots. */
function paintBlockBackdrop(ctx, zone) {
  const g = ctx.createLinearGradient(zone.x, zone.y, zone.x, zone.y + zone.h);
  g.addColorStop(0, '#ff7a3d');
  g.addColorStop(0.55, '#e83e8c');
  g.addColorStop(1, '#5b2a86');
  ctx.fillStyle = g;
  ctx.fillRect(zone.x, zone.y, zone.w, zone.h);
  const rand = makeRng(77);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.20)';
  for (let y = zone.y + 8; y < zone.y + zone.h - 4; y += 14) {
    for (let x = zone.x + 8; x < zone.x + zone.w - 4; x += 14) {
      if (rand() < 0.45) continue;
      ctx.beginPath();
      ctx.arc(x, y, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

/** Shades the bottom band a layout's title sits on. */
function paintBandShade(ctx, zone, W) {
  const g = ctx.createLinearGradient(0, zone.y, 0, zone.y + zone.h);
  g.addColorStop(0, 'rgba(10, 5, 20, 0)');
  g.addColorStop(1, 'rgba(10, 5, 20, 0.82)');
  ctx.fillStyle = g;
  ctx.fillRect(0, zone.y, W, zone.h);
}

/** Paints the title, subtitle and badge inside a layout's title zone. */
export function drawTitleBlock(ctx, zone, W, H, state, grade) {
  const title = (state.title || 'VICE COAST').trim().toUpperCase();
  const sub = (state.subtitle || '').trim();
  const badge = (state.badge || '').trim();
  if (zone.block) paintBlockBackdrop(ctx, zone);
  else if (zone.band) paintBandShade(ctx, zone, W);
  const align = zone.align || 'left';
  const tx = align === 'center' ? zone.x + zone.w / 2 : zone.x;
  const titleSize = fitFont(ctx, title, 'Anton, "Arial Black", sans-serif', Math.round(H * 0.115), zone.w);
  const baseline = zone.y + titleSize * 0.95;
  ctx.textAlign = align;
  ctx.font = titleSize + 'px Anton, "Arial Black", sans-serif';
  ctx.lineJoin = 'round';
  ctx.lineWidth = Math.max(3, titleSize * 0.09);
  ctx.strokeStyle = '#14061f';
  ctx.strokeText(title, tx, baseline);
  ctx.shadowColor = grade.titleShadow;
  ctx.shadowBlur = titleSize * 0.28;
  ctx.shadowOffsetY = titleSize * 0.04;
  ctx.fillStyle = '#ffffff';
  ctx.fillText(title, tx, baseline);
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  if (sub) {
    const subSize = fitFont(ctx, sub, 'Pacifico, cursive', Math.round(H * 0.048), zone.w);
    ctx.font = subSize + 'px Pacifico, cursive';
    ctx.fillStyle = grade.accent;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = subSize * 0.3;
    ctx.fillText(sub, tx, baseline + subSize * 1.25);
    ctx.shadowBlur = 0;
  }
  if (!badge) return;
  const bSize = Math.round(H * 0.026);
  ctx.font = 'bold ' + bSize + 'px "Arial Black", sans-serif';
  const bw = ctx.measureText(badge).width + bSize * 1.6;
  let bx = W - bw - W * 0.03;
  let by = H * 0.03;
  if (zone.block) {
    bx = tx - bw / 2;
    by = baseline + Math.round(H * 0.048) * 2.15;
  }
  ctx.fillStyle = grade.accent;
  ctx.fillRect(bx, by, bw, bSize * 1.7);
  ctx.fillStyle = '#14061f';
  ctx.textAlign = 'left';
  ctx.fillText(badge, bx + bSize * 0.8, by + bSize * 1.25);
}

/** Paints one photo slot: white frame, the photo (graded) or an empty placeholder. */
function paintSlot(ctx, slot, panel, img, grade) {
  ctx.save();
  ctx.translate(slot.x + slot.w / 2, slot.y + slot.h / 2);
  ctx.rotate(slot.rot || 0);
  ctx.translate(-slot.w / 2, -slot.h / 2);
  const inner = { x: slot.frame, y: slot.frame, w: slot.w - slot.frame * 2, h: slot.h - slot.frame * 2 };
  if (slot.frame > 0) {
    ctx.fillStyle = '#fdf6ec';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = slot.frame * 1.6;
    ctx.shadowOffsetY = slot.frame * 0.5;
    ctx.fillRect(0, 0, slot.w, slot.h);
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
  }
  ctx.save();
  ctx.beginPath();
  ctx.rect(inner.x, inner.y, inner.w, inner.h);
  ctx.clip();
  if (img) {
    drawFittedPhoto(ctx, img, inner, panel.zoom, panel.dx, panel.dy);
    gradePanel(ctx, inner, grade);
  } else {
    const g = ctx.createLinearGradient(inner.x, inner.y, inner.x, inner.y + inner.h);
    g.addColorStop(0, '#3a1c5c');
    g.addColorStop(1, '#12081f');
    ctx.fillStyle = g;
    ctx.fillRect(inner.x, inner.y, inner.w, inner.h);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.font = 'bold ' + Math.round(inner.h * 0.09) + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ADD A PHOTO', inner.x + inner.w / 2, inner.y + inner.h / 2);
  }
  ctx.restore();
  ctx.restore();
}

/** The sunset sky behind the tilted snapshots: orange-pink gradient and a low sun. */
function paintSunsetSky(ctx, W, H) {
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#2b1055');
  sky.addColorStop(0.45, '#e83e8c');
  sky.addColorStop(0.75, '#ff7a3d');
  sky.addColorStop(1, '#ffd194');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(255, 209, 148, 0.9)';
  ctx.beginPath();
  ctx.arc(W * 0.78, H * 0.20, H * 0.09, 0, Math.PI * 2);
  ctx.fill();
}

/** Draws the whole cover for `state` onto `canvas` at its own size. */
export function drawCover(canvas, state) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const layout = LAYOUTS[state.layout] || LAYOUTS.poster;
  const grade = GRADES[state.grade] || GRADES.sunset;
  ctx.fillStyle = '#160a24';
  ctx.fillRect(0, 0, W, H);
  if (state.layout === 'tilted') paintSunsetSky(ctx, W, H);
  const slots = layout.slots(W, H);
  const loaded = Math.max(1, state.photos.filter(Boolean).length);
  slots.forEach((slot, i) => {
    const panel = state.panels[i] || { photo: i % loaded, zoom: 1, dx: 0, dy: 0 };
    paintSlot(ctx, slot, panel, state.photos[panel.photo] || null, grade);
  });
  drawTitleBlock(ctx, layout.titleZone(W, H), W, H, state, grade);
  grainCover(ctx, W, H, 1337);
  return canvas;
}

/** Renders `state` at `size` ("1080x1080" etc.) into a fresh canvas. */
export function renderCover(state, size) {
  const parts = size.split('x');
  const canvas = document.createElement('canvas');
  canvas.width = Number(parts[0]);
  canvas.height = Number(parts[1]);
  return drawCover(canvas, state);
}

/** Sprinkles deterministic film grain over the whole cover. */
export function grainCover(ctx, W, H, seed) {
  const rand = makeRng(seed);
  const dots = Math.round((W * H) / 900);
  ctx.save();
  for (let i = dots; i > 0; i--) {
    ctx.fillStyle = rand() > 0.5 ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.06)';
    ctx.fillRect(rand() * W, rand() * H, 1.6, 1.6);
  }
  ctx.restore();
}
