// Photo loading: from a file the user picks, or from the app's own samples.
//
// The samples live next to the app under samples/ and are loaded over the
// same origin, so the app never reaches the network for its demo photos.
const SAMPLE_PATHS = new Map([
  ['ariin-gta', 'samples/ariin-gta.webp'],
  ['wiwid-gta', 'samples/wiwid-gta.webp'],
  ['boulevard', 'samples/boulevard.jpg'],
  ['pier', 'samples/pier.jpg'],
]);

/** Loads an image from a URL, resolving once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', () => resolve(img), { once: true });
    img.addEventListener(
      'error',
      () => reject(new Error(`could not load ${url}`)),
      { once: true },
    );
    img.src = url;
  });
}

/** Loads one named sample, or undefined for an unknown name. */
async function loadOne(name) {
  const url = SAMPLE_PATHS.get(name);
  if (!url) return undefined;
  try {
    return await loadImage(url);
  } catch {
    return null; // a sample that fails to load leaves an empty slot
  }
}

/** Loads the named samples in order, skipping any that fail. */
export async function loadSamplePhotos(names) {
  const out = [];
  for (const name of names) {
    const img = await loadOne(name);
    if (img !== undefined) out.push(img);
  }
  return out;
}

/** The sample names the editor offers as one-click demos. */
export const SAMPLE_NAMES = [...SAMPLE_PATHS.keys()];
