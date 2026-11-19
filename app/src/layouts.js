// Cover layouts. Each layout is a function of the cover size (W, H) that
// returns its photo slots and its title zone, all in pixels.
//
// A slot is a rectangle plus a tilt in radians and a frame width in pixels;
// the title zone is where the big caption and the script subtitle sit.
// Every number below is computed from W and H, so a layout scales to any
// export size without changing its look.

// One photo slot: x/y/w/h in pixels, rot in radians, frame in pixels.
function slot(x, y, w, h, rot, frame) {
  return { x, y, w, h, rot, frame };
}

// A title zone; `extra` carries layout-specific flags such as block/band.
function zone(x, y, w, h, align, extra) {
  return { x, y, w, h, align, ...(extra || {}) };
}

// The gap between panels, as a share of the cover width.
function gapFor(W) {
  return Math.round(W * 0.012);
}

export const LAYOUTS = {
  poster: {
    label: 'Poster',
    blurb: 'Hero photo over three panels',
    slots(W, H) {
      const gap = gapFor(W);
      const heroH = Math.round(H * 0.58);
      const stripH = H - heroH - gap;
      const third = (W - gap * 2) / 3;
      const stripY = heroH + gap;
      return [
        slot(0, 0, W, heroH, 0, gap),
        slot(0, stripY, third, stripH, 0, gap),
        slot(third + gap, stripY, third, stripH, 0, gap),
        slot((third + gap) * 2, stripY, third, stripH, 0, gap),
      ];
    },
    titleZone(W, H) {
      return zone(W * 0.05, H * 0.50, W * 0.90, H * 0.16, 'left');
    },
  },

  grid9: {
    label: 'Nine Panel',
    blurb: 'Eight photos around a title block',
    slots(W, H) {
      const gap = gapFor(W);
      const cw = (W - gap * 2) / 3;
      const ch = (H - gap * 2) / 3;
      const cells = [];
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          if (r === 1 && c === 1) continue; // the middle cell is the title block
          cells.push(slot(c * (cw + gap), r * (ch + gap), cw, ch, 0, gap));
        }
      }
      return cells;
    },
    titleZone(W, H) {
      const gap = gapFor(W);
      const cw = (W - gap * 2) / 3;
      const ch = (H - gap * 2) / 3;
      return zone(cw + gap, ch + gap, cw, ch, 'center', { block: true });
    },
  },

  fullbleed: {
    label: 'Full Bleed',
    blurb: 'One photo, title band below',
    slots(W, H) {
      return [slot(0, 0, W, H, 0, 0)];
    },
    titleZone(W, H) {
      return zone(W * 0.05, H * 0.74, W * 0.90, H * 0.20, 'left', { band: true });
    },
  },

  tilted: {
    label: 'Tilted Snaps',
    blurb: 'Three snapshots on a sunset sky',
    slots(W, H) {
      const frame = Math.round(W * 0.014);
      const pw = W * 0.42;
      const ph = H * 0.42;
      return [
        slot(W * 0.04, H * 0.30, pw, ph, -0.10, frame),
        slot(W * 0.31, H * 0.40, pw, ph, 0.05, frame),
        slot(W * 0.55, H * 0.28, pw, ph, 0.12, frame),
      ];
    },
    titleZone(W, H) {
      return zone(W * 0.05, H * 0.04, W * 0.90, H * 0.20, 'center');
    },
  },
};

/** The layouts in menu order. */
export const LAYOUT_ORDER = ['poster', 'grid9', 'fullbleed', 'tilted'];
