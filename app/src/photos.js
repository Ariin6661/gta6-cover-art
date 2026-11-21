// Photos for Vice Coast Cover Studio: the four bundled samples, loading
// pictures from disk or from an upload, and the cover-fit math that draws
// a photo into a panel with pan and zoom.
export const SAMPLES = [
  { id: 'ariin-gta', label: 'ariin gta', file: 'samples/ariin-gta.webp' },
  { id: 'wiwid-gta', label: 'wiwid gta', file: 'samples/wiwid-gta.webp' },
  { id: 'boulevard', label: 'boulevard', file: 'samples/boulevard.jpg' },
  { id: 'pier', label: 'pier', file: 'samples/pier.jpg' },
];

// Look a sample up by id; anything unknown falls back to the first one.
export function sampleById(id) {
  return SAMPLES.find((s) => s.id === id) ?? SAMPLES[0];
}

// Load an image from a URL or data URL. Rejects when it cannot be read.
export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('cannot load ' + src));
    img.src = src;
  });
}

// Load one of the bundled samples.
export function loadSample(id) {
  return loadImage(sampleById(id).file);
}

// Read a user-uploaded file into an image.
export function fileToImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      loadImage(String(reader.result)).then(resolve, reject);
    };
    reader.onerror = () => reject(new Error('cannot read ' + file.name));
    reader.readAsDataURL(file);
  });
}

// A photo slot: the picture and its name. Framing (zoom and pan) lives
// per panel, not per slot, so two panels sharing one photo frame it
// independently.
export function makePhoto(img, label) {
  return { img, label };
}

// A panel's framing of its photo: zoom and pan offsets.
export function makeView() {
  return { zoom: 1, ox: 0, oy: 0 };
}

// Where a photo lands inside a box when it covers the box: the photo is
// scaled to cover, centred, then shifted by the pan offsets and grown by
// the zoom. Returns the destination rectangle for drawImage.
export function coverRect(img, boxW, boxH, zoom, ox, oy) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const scale = Math.max(boxW / iw, boxH / ih) * zoom;
  const dw = iw * scale;
  const dh = ih * scale;
  return {
    dx: (boxW - dw) / 2 + ox,
    dy: (boxH - dh) / 2 + oy,
    dw,
    dh,
  };
}

// Reset a panel's framing to the plain centred fit.
export function centreView(view) {
  view.zoom = 1;
  view.ox = 0;
  view.oy = 0;
}
