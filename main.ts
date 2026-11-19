// Vice Coast Cover Studio: the program that hands the entry in (Node 22,
// standard library only). It copies the app's static files and the
// screenshots from beside this file into /output, then writes
// /output/dossier.json with the vendored make.fun library — the summary
// the judge reads. Outside the grader's container, MAKEFUN_OUTPUT_DIR
// stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

/** Copies a directory tree, refusing symlinks so the gate's app_files row passes. */
function copyDir(from, to) {
  mkdirSync(to, { recursive: true });
  for (const name of readdirSync(from)) {
    const src = join(from, name);
    const dst = join(to, name);
    const info = statSync(src);
    if (info.isSymbolicLink()) throw new Error('symlink refused: ' + src);
    if (info.isDirectory()) copyDir(src, dst);
    else cpSync(src, dst);
  }
}

mkdirSync(outDir, { recursive: true });
copyDir(join(repoRoot, 'app'), join(outDir, 'app'));
const shotsDir = join(repoRoot, 'screenshots');
if (existsSync(shotsDir)) copyDir(shotsDir, join(outDir, 'screenshots'));

// The gate's caps: text_max_bytes is the only one that shapes the
// dossier's bytes; the rest refuse an entry the scorer would refuse
// anyway (more than 4 screenshots or one over 256 KiB; more than 993
// files or 48 MiB under app/, or an app/ path over 1000 bytes).
const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);
