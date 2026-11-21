// Vice Coast Cover Studio — entry program.
//
// Copies app/ and screenshots/ from this repository into the output
// directory and writes dossier.json there with buildDossier from the
// kit's library, so the scorer can check the entry. Outside the grader,
// MAKEFUN_OUTPUT_DIR stands in for /output.
import { buildDossier } from './vendor/makefun-app.ts';
import { copyFileSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// The bounty's caps: the dossier text cap, the screenshot caps, and the
// app caps from the gate section of RULES.txt.
const CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 48 * 1024 * 1024,
  app_path_max_bytes: 1000,
};

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Copy a directory tree, entries in name order so the copy is stable.
// Returns how many files were copied.
function copyTree(srcDir: string, destDir: string): number {
  mkdirSync(destDir, { recursive: true });
  let copied = 0;
  const names = readdirSync(srcDir).sort();
  for (const name of names) {
    const src = join(srcDir, name);
    const dest = join(destDir, name);
    if (statSync(src).isDirectory()) {
      copied += copyTree(src, dest);
    } else {
      copyFileSync(src, dest);
      copied += 1;
    }
  }
  return copied;
}

// Clear what a previous run left behind, copy the entry in, and write
// the dossier the scorer compares byte for byte.
function handIn(): void {
  mkdirSync(outDir, { recursive: true });
  for (const name of ['app', 'screenshots', 'dossier.json']) {
    rmSync(join(outDir, name), { recursive: true, force: true });
  }
  copyTree(join(repoRoot, 'app'), join(outDir, 'app'));
  const shotCount = copyTree(join(repoRoot, 'screenshots'), join(outDir, 'screenshots'));
  const dossier = buildDossier(outDir, CAPS);
  if (dossier.length > 1.5 * 1024 * 1024) {
    throw new Error(`dossier too large: ${dossier.length} bytes (cap 1.5 MiB)`);
  }
  writeFileSync(join(outDir, 'dossier.json'), dossier);
  console.log(`handed in ${dossier.length} byte dossier (${shotCount} screenshots) to ${outDir}`);
}

handIn();
