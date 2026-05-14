#!/usr/bin/env node
/**
 * Lightweight schema check for data/eudi-status.json.
 * Keeps zero npm dependencies. Add Ajv if richer validation is needed later.
 */

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.join(__dirname, '..', 'data', 'eudi-status.json');

const VALID_STATUS = new Set([
  'Launched in production',
  'Public pilot live',
  'Closed pilot or LSP only',
  'Notified eID, no wallet yet',
  'No public plan',
  'Unknown',
]);

const VALID_LSP = new Set([
  'POTENTIAL',
  'EWC',
  'NOBID',
  'DC4EU',
  'WE BUILD',
  'APTITUDE',
]);

const VALID_LOA = new Set(['low', 'substantial', 'high']);
const VALID_GROUP = new Set(['EU', 'EEA', 'Other']);
const VALID_PRIVATE_ROLE = new Set([
  'Wallet Provider',
  'Issuer',
  'Relying Party',
  'QTSP',
  'Verifier',
  'Conformance',
  'LSP partner',
  'Open-source contributor',
  'Other',
]);

const errors = [];
const data = JSON.parse(fs.readFileSync(DATA, 'utf-8'));

if (!Array.isArray(data.countries) || data.countries.length === 0) {
  errors.push('countries[] missing or empty');
}

const seenIso = new Set();

for (const c of data.countries ?? []) {
  const tag = `[${c?.name ?? '?'}]`;
  if (!c.name) errors.push(`${tag} name missing`);
  if (!/^[A-Z]{2}$/.test(c.isoAlpha2 || '')) errors.push(`${tag} bad isoAlpha2`);
  if (!/^\d{3}$/.test(c.isoNumeric || '')) errors.push(`${tag} bad isoNumeric`);
  if (seenIso.has(c.isoAlpha2)) errors.push(`${tag} duplicate isoAlpha2 ${c.isoAlpha2}`);
  seenIso.add(c.isoAlpha2);
  if (!VALID_STATUS.has(c.status)) errors.push(`${tag} bad status: ${c.status}`);
  if (c.assuranceLevel && !VALID_LOA.has(c.assuranceLevel)) errors.push(`${tag} bad assuranceLevel: ${c.assuranceLevel}`);
  if (c.group && !VALID_GROUP.has(c.group)) errors.push(`${tag} bad group: ${c.group}`);
  for (const l of c.lspParticipation ?? []) {
    if (!VALID_LSP.has(l)) errors.push(`${tag} unknown LSP: ${l}`);
  }
  if (!Array.isArray(c.sources) || c.sources.length === 0) {
    errors.push(`${tag} at least one source required`);
  } else {
    for (const s of c.sources) {
      if (!s.url) errors.push(`${tag} source missing url`);
      if (!s.title) errors.push(`${tag} source missing title`);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(s.date || '')) errors.push(`${tag} source date must be YYYY-MM-DD: ${s.date}`);
    }
  }
  if (c.igrantActivity != null) {
    const ig = c.igrantActivity;
    if (typeof ig !== 'object' || Array.isArray(ig)) {
      errors.push(`${tag} igrantActivity must be an object`);
    } else {
      if (!ig.summary) errors.push(`${tag} igrantActivity missing summary`);
      if (ig.url && !/^https?:\/\//.test(ig.url)) {
        errors.push(`${tag} igrantActivity url must start with http(s)`);
      }
      if (ig.since && !/^\d{4}-\d{2}-\d{2}$/.test(ig.since)) {
        errors.push(`${tag} igrantActivity since must be YYYY-MM-DD: ${ig.since}`);
      }
      if (ig.lsps != null && !Array.isArray(ig.lsps)) {
        errors.push(`${tag} igrantActivity lsps must be an array`);
      }
      for (const l of ig.lsps ?? []) {
        if (!VALID_LSP.has(l)) errors.push(`${tag} igrantActivity unknown LSP: ${l}`);
      }
    }
  }
  if (c.privateActivity != null) {
    if (!Array.isArray(c.privateActivity)) {
      errors.push(`${tag} privateActivity must be an array`);
    } else {
      for (const p of c.privateActivity) {
        if (!p.company) errors.push(`${tag} privateActivity entry missing company`);
        if (!p.role) errors.push(`${tag} privateActivity ${p.company ?? '?'} missing role`);
        if (p.role && !VALID_PRIVATE_ROLE.has(p.role)) {
          errors.push(`${tag} privateActivity ${p.company ?? '?'} unknown role: ${p.role}`);
        }
        if (p.hqCountry && !/^[A-Z]{2}$/.test(p.hqCountry)) {
          errors.push(`${tag} privateActivity ${p.company ?? '?'} hqCountry must be ISO alpha-2`);
        }
        if (p.date && !/^\d{4}-\d{2}-\d{2}$/.test(p.date)) {
          errors.push(`${tag} privateActivity ${p.company ?? '?'} date must be YYYY-MM-DD: ${p.date}`);
        }
      }
    }
  }
}

if (errors.length) {
  console.error('Data validation failed:');
  for (const e of errors) console.error('  ' + e);
  process.exit(1);
}

console.log(`OK: ${data.countries.length} countries validated.`);
