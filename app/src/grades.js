// Colour grades for Vice Coast Cover Studio.
//
// A grade is one look for the whole cover: the accent colour paints the
// title edge, the subtitle and the badge; a translucent wash tints every
// photo; and the sky gradient behind the Tilted Snaps layout follows the
// same mood. Noir is the plain one: no wash, white accents, grey sky.
export const GRADES = [
  {
    id: 'sunset',
    label: 'Sunset',
    dot: '#ff2e7e',
    accent: '#ff2e7e',
    edge: '#4a1030',
    ink: '#20102a',
    wash: '#ff5e8a',
    washAlpha: 0.2,
    washBlend: 'overlay',
    sky: ['#5b2a86', '#c2277e', '#f08a3c', '#f7e3b8'],
  },
  {
    id: 'neon',
    label: 'Neon Night',
    dot: '#17e6c8',
    accent: '#12d9b8',
    edge: '#062a33',
    ink: '#06251f',
    wash: '#19e3c2',
    washAlpha: 0.2,
    washBlend: 'overlay',
    sky: ['#0d1b4c', '#3b2a7a', '#0e7f8c', '#17e6c8'],
  },
  {
    id: 'golden',
    label: 'Golden Hour',
    dot: '#f7b731',
    accent: '#f0a020',
    edge: '#4a2c05',
    ink: '#2a1a05',
    wash: '#ffb52e',
    washAlpha: 0.2,
    washBlend: 'overlay',
    sky: ['#7a3b12', '#c96a1e', '#f7b731', '#ffe9a8'],
  },
  {
    id: 'violet',
    label: 'Vice Violet',
    dot: '#a55eff',
    accent: '#a55eff',
    edge: '#2a1150',
    ink: '#1d0b33',
    wash: '#9a5cff',
    washAlpha: 0.22,
    washBlend: 'overlay',
    sky: ['#2a1150', '#6b2fb8', '#b06bff', '#e3c8ff'],
  },
  {
    id: 'noir',
    label: 'Noir',
    dot: '#f2f2f2',
    accent: '#ffffff',
    edge: '#16101f',
    ink: '#16101f',
    wash: null,
    washAlpha: 0,
    washBlend: 'overlay',
    sky: ['#3a3a44', '#6d6d78', '#9a9aa2', '#e8e8ea'],
  },
];

// Look a grade up by id; anything unknown falls back to the first grade.
export function gradeById(id) {
  return GRADES.find((g) => g.id === id) ?? GRADES[0];
}

// The colour of the dot shown on a grade button.
export function gradeDot(id) {
  return gradeById(id).dot;
}
