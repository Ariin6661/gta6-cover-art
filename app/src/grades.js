// Vice Coast colour grades. A grade is a treatment laid over a photo panel:
// a warm wash (soft-light), a two-stop overlay gradient, a vignette
// strength, and the colours used for the title text and its shadow.
//
// Every grade is built by makeGrade so the seven fields stay in the same
// order; the values below are the whole look of the app.
function makeGrade(label, wash, top, bottom, vignette, accent, titleShadow) {
  return { label, wash, top, bottom, vignette, accent, titleShadow };
}

export const GRADES = {
  // Warm orange dusk, pink at the bottom of the frame.
  sunset: makeGrade(
    'Sunset',
    'rgba(255, 110, 60, 0.20)',
    'rgba(255, 190, 90, 0.10)',
    'rgba(190, 30, 110, 0.42)',
    0.34,
    '#ff5e8a',
    '#ff2e88',
  ),

  // Cool cyan wash with a magenta-purple base: night on the strip.
  neon: makeGrade(
    'Neon Night',
    'rgba(40, 220, 220, 0.16)',
    'rgba(30, 220, 200, 0.12)',
    'rgba(150, 20, 180, 0.46)',
    0.40,
    '#2ee6d6',
    '#00e5ff',
  ),

  // Honey light, the hour before the sun drops.
  golden: makeGrade(
    'Golden Hour',
    'rgba(255, 180, 60, 0.26)',
    'rgba(255, 210, 120, 0.14)',
    'rgba(140, 60, 10, 0.38)',
    0.30,
    '#ffb347',
    '#ff9d00',
  ),

  // Purple haze, deepest vignette of the colour grades.
  violet: makeGrade(
    'Vice Violet',
    'rgba(150, 90, 255, 0.20)',
    'rgba(190, 120, 255, 0.12)',
    'rgba(90, 10, 140, 0.48)',
    0.38,
    '#c77dff',
    '#a100f2',
  ),

  // Near-monochrome: a faint grey wash and a heavy dark base.
  noir: makeGrade(
    'Noir',
    'rgba(200, 200, 210, 0.10)',
    'rgba(220, 220, 230, 0.06)',
    'rgba(5, 5, 15, 0.55)',
    0.48,
    '#e8e8f0',
    '#444455',
  ),
};

/** The grades in menu order. */
export const GRADE_ORDER = ['sunset', 'neon', 'golden', 'violet', 'noir'];
