#!/usr/bin/env node
/**
 * Prose linter for the EUDI Wallet Tracker.
 *
 * Enforces two house rules:
 *   1. No em dash (U+2014) anywhere in tracked prose. Use a comma, semicolon,
 *      colon, or sentence break instead.
 *   2. British English spelling in user-visible copy, with a narrow allow list
 *      for standards terminology (e.g. "Authorization", "Authorize" in OAuth /
 *      HTTP header contexts).
 *
 * Scans .md, .mdx, .ts, .tsx, .json. Skips node_modules, build, .docusaurus,
 * .git, and CSS where "color" / "center" are keywords.
 *
 * Run: npm run lint:prose
 */

import {readdir, readFile, stat} from 'node:fs/promises';
import {join, relative, extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {dirname} from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');

const SCAN_EXTS = new Set(['.md', '.mdx', '.ts', '.tsx', '.json']);
const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  '.docusaurus',
  'build',
  '.next',
  'dist',
  '.cache',
]);

const SKIP_FILES = new Set([
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
]);

// Words on the right are standards terminology kept in American spelling.
// Anything in this set is allowed verbatim regardless of British-English rules.
const ALLOW = new Set([
  'Authorization',
  'authorization',
  'Authorize',
  'authorize',
  'authorized',
  'authorizing',
  'authorizes',
  'Organization', // when part of a standards / API identifier
  'organization',
  'OrganizationWallet',
  'organizationName', // package.json key in docusaurus config
  'Color', // when part of CSS / API identifier
  'color',
  'colorMode',
  'backgroundColor',
  'Center',
  'center',
  'License', // SPDX identifiers
  'license',
  'licenses',
  'analyze', // when part of identifier like analyze-bundle scripts
  'dialog', // ARIA / W3C role and HTML <dialog> element
  'Dialog',
]);

// Map of American spelling => British replacement. Only used to detect.
// Matching is whole-word, case-insensitive on the lookup, case-preserving in
// the suggested replacement.
const RULES = [
  ['behavior', 'behaviour'],
  ['behaviors', 'behaviours'],
  ['behavioral', 'behavioural'],
  ['favor', 'favour'],
  ['favorite', 'favourite'],
  ['favorites', 'favourites'],
  ['flavor', 'flavour'],
  ['honor', 'honour'],
  ['labor', 'labour'],
  ['neighbor', 'neighbour'],
  ['rumor', 'rumour'],
  ['valor', 'valour'],
  ['vapor', 'vapour'],
  ['analyze', 'analyse'],
  ['analyzed', 'analysed'],
  ['analyzes', 'analyses'],
  ['analyzing', 'analysing'],
  ['catalog', 'catalogue'],
  ['cataloged', 'catalogued'],
  ['dialog', 'dialogue'],
  ['organize', 'organise'],
  ['organized', 'organised'],
  ['organizes', 'organises'],
  ['organizing', 'organising'],
  ['organization', 'organisation'],
  ['organizations', 'organisations'],
  ['organizational', 'organisational'],
  ['realize', 'realise'],
  ['realized', 'realised'],
  ['realizes', 'realises'],
  ['realizing', 'realising'],
  ['recognize', 'recognise'],
  ['recognized', 'recognised'],
  ['standardize', 'standardise'],
  ['standardized', 'standardised'],
  ['standardizing', 'standardising'],
  ['standardization', 'standardisation'],
  ['minimize', 'minimise'],
  ['maximize', 'maximise'],
  ['utilize', 'utilise'],
  ['authorize', 'authorise'],
  ['license', 'licence'], // noun; verb stays
  ['offense', 'offence'],
  ['defense', 'defence'],
  ['pretense', 'pretence'],
  ['meter', 'metre'],
  ['liter', 'litre'],
  ['fiber', 'fibre'],
  ['center', 'centre'],
  ['theater', 'theatre'],
  ['traveling', 'travelling'],
  ['traveler', 'traveller'],
  ['canceled', 'cancelled'],
  ['canceling', 'cancelling'],
  ['modeling', 'modelling'],
  ['fueled', 'fuelled'],
  ['fueling', 'fuelling'],
];

// Map for fast lookup: lowercase American -> British.
const AMERICAN = new Map(RULES.map(([a, b]) => [a, b]));

// Words too ambiguous in code to flag. Only enforced in prose files (.md/.mdx).
const PROSE_ONLY = new Set([
  'license',
  'centered',
  'center',
  'colored',
  'color',
  'colors',
]);

async function walk(dir, out = []) {
  const entries = await readdir(dir, {withFileTypes: true});
  for (const e of entries) {
    if (SKIP_DIRS.has(e.name)) continue;
    if (e.name.startsWith('.') && e.name !== '.github') continue;
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      await walk(full, out);
    } else if (SCAN_EXTS.has(extname(e.name)) && !SKIP_FILES.has(e.name)) {
      out.push(full);
    }
  }
  return out;
}

function scanEmDashes(text, file) {
  const findings = [];
  const lines = text.split(/\r?\n/);
  lines.forEach((line, i) => {
    const idx = line.indexOf('—');
    if (idx !== -1) {
      findings.push({
        file,
        line: i + 1,
        col: idx + 1,
        rule: 'no-em-dash',
        message:
          'Em dash (U+2014) is not allowed. Use a comma, colon, semicolon, or two sentences instead.',
        snippet: line.trim().slice(0, 120),
      });
    }
  });
  return findings;
}

function scanBritishEnglish(text, file) {
  const findings = [];
  const isProse =
    extname(file) === '.md' || extname(file) === '.mdx';
  const lines = text.split(/\r?\n/);
  lines.forEach((line, i) => {
    // Skip code fences inside markdown (rough; OK for our purposes).
    if (/^\s{0,3}```/.test(line)) return;
    // Skip URLs / paths.
    const cleaned = line
      .replace(/https?:\/\/\S+/g, '')
      .replace(/`[^`]*`/g, '');
    const wordRe = /\b([A-Za-z]+)\b/g;
    let m;
    while ((m = wordRe.exec(cleaned))) {
      const w = m[1];
      if (ALLOW.has(w)) continue;
      const lower = w.toLowerCase();
      if (!AMERICAN.has(lower)) continue;
      if (!isProse && PROSE_ONLY.has(lower)) continue;
      findings.push({
        file,
        line: i + 1,
        col: m.index + 1,
        rule: 'british-english',
        message: `Use British English: "${w}" → "${AMERICAN.get(lower)}".`,
        snippet: line.trim().slice(0, 120),
      });
    }
  });
  return findings;
}

async function main() {
  const files = await walk(ROOT);
  const all = [];
  for (const f of files) {
    const text = await readFile(f, 'utf8');
    all.push(...scanEmDashes(text, f));
    all.push(...scanBritishEnglish(text, f));
  }
  if (all.length === 0) {
    console.log('Prose lint: clean. No em dashes, no American spellings.');
    return;
  }
  for (const f of all) {
    const rel = relative(ROOT, f.file);
    console.log(`${rel}:${f.line}:${f.col}  [${f.rule}]  ${f.message}`);
    if (f.snippet) console.log(`    ${f.snippet}`);
  }
  console.error(`\nProse lint: ${all.length} finding(s).`);
  process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
