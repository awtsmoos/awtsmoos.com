// B"H — MongoDB update operators for the AwtsmoosDB compat layer.
// Supports $set $inc $unset $push ($each) $addToSet $pop $mul, plus
// replacement-style updates (no $ keys -> replace document, keep _id).
'use strict';
const { ObjectId } = require('./objectid');
const { getPath, deepEqual } = require('./filter');

function cloneVal(v) {
  if (v === null || v === undefined) return v;
  const t = typeof v;
  if (t !== 'object') return v;
  if (v instanceof ObjectId) return new ObjectId(v.toHexString());
  if (v instanceof Date) return new Date(v.getTime());
  if (Array.isArray(v)) {
    const out = new Array(v.length);
    for (let i = 0; i < v.length; i++) out[i] = cloneVal(v[i]);
    return out;
  }
  const out = {};
  const ks = Object.keys(v);
  for (let i = 0; i < ks.length; i++) out[ks[i]] = cloneVal(v[ks[i]]);
  return out;
}

function setPath(obj, path, val) {
  const parts = String(path).split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (cur[p] === null || typeof cur[p] !== 'object') cur[p] = {};
    cur = cur[p];
  }
  cur[parts[parts.length - 1]] = val;
}

function deletePath(obj, path) {
  const parts = String(path).split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (cur[p] === null || typeof cur[p] !== 'object') return;
    cur = cur[p];
  }
  delete cur[parts[parts.length - 1]];
}

function applyUpdate(doc, update) {
  if (!update || typeof update !== 'object' || Array.isArray(update)) {
    throw new Error('update must be an object');
  }
  const keys = Object.keys(update);
  if (keys.length === 0) throw new Error('update must not be empty');
  const isOperator = keys.some(k => k[0] === '$');

  if (!isOperator) {
    // Replacement update: keep the original _id.
    const nd = {};
    for (let i = 0; i < keys.length; i++) nd[keys[i]] = cloneVal(update[keys[i]]);
    nd._id = doc._id;
    return { doc: nd, modified: !deepEqual(nd, doc) };
  }

  const out = cloneVal(doc);
  let modified = false;

  const touch = () => { modified = true; };

  for (let i = 0; i < keys.length; i++) {
    const op = keys[i], spec = update[op];
    if (op === '$set') {
      const fields = Object.keys(spec);
      for (let j = 0; j < fields.length; j++) {
        const p = fields[j];
        if (!deepEqual(getPath(out, p), spec[p])) { setPath(out, p, cloneVal(spec[p])); touch(); }
      }
    } else if (op === '$inc') {
      const fields = Object.keys(spec);
      for (let j = 0; j < fields.length; j++) {
        const p = fields[j], cur = getPath(out, p);
        const nv = (typeof cur === 'number' ? cur : 0) + spec[p];
        if (!deepEqual(cur, nv)) { setPath(out, p, nv); touch(); }
      }
    } else if (op === '$unset') {
      const fields = Object.keys(spec);
      for (let j = 0; j < fields.length; j++) {
        const parts = String(fields[j]).split('.');
        let cur = out, ok = true;
        for (let k = 0; k < parts.length - 1; k++) {
          if (cur[parts[k]] === null || typeof cur[parts[k]] !== 'object') { ok = false; break; }
          cur = cur[parts[k]];
        }
        if (ok && Object.prototype.hasOwnProperty.call(cur, parts[parts.length - 1])) {
          delete cur[parts[parts.length - 1]];
          touch();
        }
      }
    } else if (op === '$push') {
      const fields = Object.keys(spec);
      for (let j = 0; j < fields.length; j++) {
        const p = fields[j], cur = getPath(out, p);
        const arr = Array.isArray(cur) ? cur.slice() : [];
        const val = spec[p];
        if (val !== null && typeof val === 'object' && !Array.isArray(val) && val.$each && Array.isArray(val.$each)) {
          for (let k = 0; k < val.$each.length; k++) arr.push(cloneVal(val.$each[k]));
        } else {
          arr.push(cloneVal(val));
        }
        setPath(out, p, arr);
        touch();
      }
    } else if (op === '$addToSet') {
      const fields = Object.keys(spec);
      for (let j = 0; j < fields.length; j++) {
        const p = fields[j], cur = getPath(out, p);
        const arr = Array.isArray(cur) ? cur.slice() : [];
        const vals = (spec[p] !== null && typeof spec[p] === 'object' && !Array.isArray(spec[p]) &&
          spec[p].$each && Array.isArray(spec[p].$each)) ? spec[p].$each : [spec[p]];
        let changed = !Array.isArray(cur);
        for (let k = 0; k < vals.length; k++) {
          if (!arr.some(el => deepEqual(el, vals[k]))) { arr.push(cloneVal(vals[k])); changed = true; }
        }
        if (changed) { setPath(out, p, arr); touch(); }
      }
    } else if (op === '$pop') {
      const fields = Object.keys(spec);
      for (let j = 0; j < fields.length; j++) {
        const p = fields[j], cur = getPath(out, p);
        if (Array.isArray(cur) && cur.length > 0) {
          const arr = cur.slice();
          if (spec[p] === -1) arr.shift(); else arr.pop();
          setPath(out, p, arr);
          touch();
        }
      }
    } else if (op === '$mul') {
      const fields = Object.keys(spec);
      for (let j = 0; j < fields.length; j++) {
        const p = fields[j], cur = getPath(out, p);
        const nv = (typeof cur === 'number' ? cur : 0) * spec[p];
        if (!deepEqual(cur, nv)) { setPath(out, p, nv); touch(); }
      }
    } else {
      throw new Error('Unsupported update operator: ' + op);
    }
  }
  return { doc: out, modified };
}

module.exports = { applyUpdate, cloneVal, setPath, deletePath, getPath };
