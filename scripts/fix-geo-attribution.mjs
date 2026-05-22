#!/usr/bin/env node
/**
 * Pre-build step that corrects boundary attributions in the cached world
 * atlas topojson before the runtime map fetches it. Output is written to
 * static/geo/europe-eu-view.json so it is served by the deploy.
 *
 * Today this only fixes one attribution (a peninsula polygon misfiled to a
 * neighbouring sovereign in the upstream Natural Earth dataset). Add more
 * adjustments here if other corrections are needed - one entry per change.
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IN_PATH = path.join(__dirname, 'world-atlas-50m.json');
const OUT_DIR = path.join(__dirname, '..', 'static', 'geo');
const OUT_PATH = path.join(OUT_DIR, 'europe-eu-view.json');

const atlas = JSON.parse(fs.readFileSync(IN_PATH, 'utf-8'));
const geos = atlas.objects.countries.geometries;

// Reassign polygon #98 of the multi-polygon with id '643' to the multi-polygon
// with id '804'. The polygon's bbox is roughly 32.5E-36.6E, 44.4N-46.2N.
const src = geos.find((g) => g.id === '643');
const dst = geos.find((g) => g.id === '804');
if (!src || !dst) {
  throw new Error('fix-geo-attribution: source or destination geometry not found');
}
const POLY_INDEX = 98;
const transferred = src.arcs.splice(POLY_INDEX, 1);
if (transferred.length !== 1) {
  throw new Error(
    `fix-geo-attribution: expected to splice 1 polygon from source, got ${transferred.length}`,
  );
}
dst.arcs.push(...transferred);

fs.mkdirSync(OUT_DIR, {recursive: true});
fs.writeFileSync(OUT_PATH, JSON.stringify(atlas));
const stat = fs.statSync(OUT_PATH);
console.log(`fix-geo-attribution: wrote ${OUT_PATH} (${(stat.size / 1024).toFixed(1)} kB)`);
