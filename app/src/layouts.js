// Cover layouts for Vice Coast Cover Studio.
//
// Each layout is a function of the cover size (W, H) that returns the
// zones to draw: the photo panels (each with the slot it shows, its frame
// and any tilt), where the title, subtitle and badge go, and what fills
// the background behind it all. All sizes are fractions of W or H, so one
// layout works at 1080x1080, 1080x1350 and 1920x1080 alike.
function frame(W, H) {
  return {
    outer: Math.round(0.012 * W),
    gap: Math.round(0.009 * W),
    rim: Math.round(0.006 * W),
  };
}

function titleBlock(x, baseline, size, maxW) {
  return { x, baseline, size, maxW };
}

function badgeSpot(x, y, size, align) {
  return { x, y, size, align: align ?? 'right' };
}

const posterZones = (W, H) => {
  const { outer: m, gap: g } = frame(W, H);
  const heroH = Math.round(0.56 * H);
  const rowY = m + heroH + g;
  const rowH = H - m - rowY;
  const cellW = Math.round((W - 2 * m - 2 * g) / 3);
  const titleSize = Math.round(0.088 * W);
  return {
    backdrop: 'cream',
    panels: [
      { x: m, y: m, w: W - 2 * m, h: heroH, panel: 0, frame: 'cream', tilt: 0 },
      { x: m, y: rowY, w: cellW, h: rowH, panel: 1, frame: 'cream', tilt: 0 },
      { x: m + cellW + g, y: rowY, w: cellW, h: rowH, panel: 2, frame: 'cream', tilt: 0 },
      { x: m + 2 * (cellW + g), y: rowY, w: cellW, h: rowH, panel: 3, frame: 'cream', tilt: 0 },
    ],
    title: titleBlock(m + Math.round(0.015 * W), m + heroH + Math.round(titleSize * 0.28), titleSize, W - 2 * m),
    subtitle: titleBlock(m + Math.round(0.03 * W), m + heroH + Math.round(titleSize * 0.28) + Math.round(0.048 * W), Math.round(0.03 * W), W - 2 * m),
    badge: badgeSpot(W - m - Math.round(0.015 * W), m + Math.round(0.015 * W), Math.round(0.02 * H)),
  };
};

const nineZones = (W, H) => {
  const { outer: m, gap: g } = frame(W, H);
  const cellW = Math.round((W - 2 * m - 2 * g) / 3);
  const cellH = Math.round((H - 2 * m - 2 * g) / 3);
  const slots = [0, 1, 2, 3, -1, 0, 1, 2, 3];
  const panels = [];
  for (let i = 0; i < 9; i += 1) {
    if (slots[i] < 0) continue;
    panels.push({
      x: m + (i % 3) * (cellW + g),
      y: m + Math.floor(i / 3) * (cellH + g),
      w: cellW,
      h: cellH,
      panel: slots[i],
      frame: 'cream',
      tilt: 0,
    });
  }
  const titleSize = Math.round(0.062 * W);
  const centreX = m + cellW + g + Math.round(cellW / 2);
  return {
    backdrop: 'cream',
    panels,
    title: { x: centreX, baseline: m + cellH + g + Math.round(cellH * 0.42), size: titleSize, maxW: cellW, align: 'center' },
    subtitle: { x: centreX, baseline: m + cellH + g + Math.round(cellH * 0.62), size: Math.round(0.026 * W), maxW: cellW, align: 'center' },
    badge: badgeSpot(centreX, m + cellH + g + Math.round(cellH * 0.72), Math.round(0.016 * H), 'center'),
    titleCell: { x: m + cellW + g, y: m + cellH + g, w: cellW, h: cellH },
  };
};

const bleedZones = (W, H) => {
  const titleSize = Math.round(0.095 * W);
  return {
    backdrop: 'photo',
    panels: [{ x: 0, y: 0, w: W, h: H, panel: 0, frame: 'none', tilt: 0 }],
    title: titleBlock(Math.round(0.05 * W), Math.round(0.86 * H), titleSize, Math.round(0.9 * W)),
    subtitle: titleBlock(Math.round(0.055 * W), Math.round(0.935 * H), Math.round(0.032 * W), Math.round(0.9 * W)),
    badge: badgeSpot(W - Math.round(0.05 * W), Math.round(0.04 * H), Math.round(0.02 * H)),
    band: { from: 0.68, to: 1 },
  };
};

const tiltedZones = (W, H) => {
  const titleSize = Math.round(0.075 * W);
  return {
    backdrop: 'sky',
    panels: [
      { x: Math.round(0.055 * W), y: Math.round(0.3 * H), w: Math.round(0.52 * W), h: Math.round(0.45 * H), panel: 0, frame: 'polaroid', tilt: -4 },
      { x: Math.round(0.34 * W), y: Math.round(0.4 * H), w: Math.round(0.52 * W), h: Math.round(0.46 * H), panel: 1, frame: 'polaroid', tilt: 2 },
      { x: Math.round(0.6 * W), y: Math.round(0.24 * H), w: Math.round(0.37 * W), h: Math.round(0.48 * H), panel: 2, frame: 'polaroid', tilt: 5 },
    ],
    title: { x: Math.round(0.5 * W), baseline: Math.round(0.115 * H), size: titleSize, maxW: Math.round(0.9 * W), align: 'center' },
    subtitle: { x: Math.round(0.5 * W), baseline: Math.round(0.115 * H) + Math.round(0.055 * W), size: Math.round(0.032 * W), maxW: Math.round(0.9 * W), align: 'center' },
    badge: badgeSpot(W - Math.round(0.05 * W), Math.round(0.04 * H), Math.round(0.02 * H)),
    sun: { x: Math.round(0.78 * W), y: Math.round(0.19 * H), r: Math.round(0.085 * W) },
  };
};

export const LAYOUTS = [
  { id: 'poster', label: 'Poster', zones: posterZones },
  { id: 'nine', label: 'Nine Panel', zones: nineZones },
  { id: 'bleed', label: 'Full Bleed', zones: bleedZones },
  { id: 'tilted', label: 'Tilted Snaps', zones: tiltedZones },
];

// Look a layout up by id; anything unknown falls back to the poster.
export function layoutById(id) {
  return LAYOUTS.find((l) => l.id === id) ?? LAYOUTS[0];
}

// The zones of a layout at a given cover size.
export function zonesFor(id, W, H) {
  return layoutById(id).zones(W, H);
}
