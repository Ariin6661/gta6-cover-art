// Fixed scenes for screenshots: ?shot=editor shows the editor with a
// sample photo loaded; ?shot=cover shows the cover alone at the page's
// size. The query picks the photo, layout, grade and words, and
// window.__shotReady is set once the scene has painted.
import { loadSamplePhotos } from './photos.js';

/** The scene's query values, with the defaults the screenshots use. */
function sceneFromQuery(query) {
  return {
    photo: query.get('photo') ?? 'ariin-gta',
    title: query.get('caption') ?? 'VICE COAST',
    subtitle: query.get('subtitle') ?? 'sunset heist',
    layout: query.get('layout') ?? 'poster',
    grade: query.get('grade') ?? 'sunset',
  };
}

/** Loads the scene's photos, hands it to the editor, and flags readiness. */
export async function runShot(shot, query, setup) {
  const scene = sceneFromQuery(query);
  if (shot === 'cover') document.body.classList.add('shot-cover');
  const photos = await loadSamplePhotos([scene.photo, 'wiwid-gta', 'boulevard', 'pier']);
  setup({ photos, title: scene.title, subtitle: scene.subtitle, layout: scene.layout, grade: scene.grade });
  await document.fonts.ready;
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}
