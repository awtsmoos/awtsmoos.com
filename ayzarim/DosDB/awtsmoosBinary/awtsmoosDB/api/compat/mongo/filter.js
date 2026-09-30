// B"H — MongoDB filter matching for the AwtsmoosDB compat layer.
// Supports field equality, dot-notation paths, and operators:
// $eq $ne $gt $gte $lt $lte $in $nin $exists $regex $and $or $nor
'use strict';
const { ObjectId } = require('./objectid');

function getPath(obj, path) {
  const parts = String(path).split('.');
  let cur = obj;
  for (let i = 0; i < parts.length; i++) {
    if (cur === null || cur === undefined) return undefined;
    cur = cur[parts[i]];
  }
  return cur;
}

function hasPath(obj, path) {
  const parts = String(path).split('.');
  let cur = obj;
  for (let i = 0; i < parts.length; i++) {
    if (cur === null || cur === undefined || !(parts[i] in Object(cur))) return false;
    cur = cur[parts[i]];
  }
  return true;
}

function deepEqual(a, b) {
  if (a === b) return true;
  if (a instanceof ObjectId || b instanceof ObjectId) {
    return a instanceof ObjectId && b instanceof ObjectId && a.equals(b);
  }
  if (a instanceof Date || b instanceof Date) {
    return a instanceof Date && b instanceof Date && a.getTime() === b.getTime();
  }
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (!deepEqual(a[i], b[i])) return false;
    return true;
  }
  const ka = Object.keys(a), kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  for (let i = 0; i < ka.length; i++) {
    if (!Object.prototype.hasOwnProperty.call(b, ka[i])) return false;
    if (!deepEqual(a[ka[i]], b[ka[i]])) return false;
  }
  return true;
}

// BSON-ish type rank for cross-type $gt/$lt comparisons.
function typeRank(v) {
  if (v === null || v === undefined) return 0;
  if (typeof v === 'number') return 1;
  if (typeof v === 'string') return 2;
  if (typeof v === 'object') {
    if (v instanceof ObjectId) return 3;
    if (v instanceof Date) return 4;
    if (Array.isArray(v)) return 6;
    return 5;
  }
  if (typeof v === 'boolean') return 7;
  return 8;
}

function compareValues(a, b) {
  const ra = typeRank(a), rb = typeRank(b);
  if (ra !== rb) return ra < rb ? -1 : 1;
  if (typeof a === 'number' && typeof b === 'number') {
    return a < b ? -1 : a > b ? 1 : 0;
  }
  if (typeof a === 'string' && typeof b === 'string') {
    return a < b ? -1 : a > b ? 1 : 0;
  }
  if (a instanceof ObjectId && b instanceof ObjectId) {
    const x = a.toHexString(), y = b.toHexString();
    return x < y ? -1 : x > y ? 1 : 0;
  }
  if (a instanceof Date && b instanceof Date) {
    const x = a.getTime(), y = b.getTime();
    return x < y ? -1 : x > y ? 1 : 0;
  }
  if (typeof a === 'boolean' && typeof b === 'boolean') {
    return a === b ? 0 : a ? 1 : -1;
  }
  return 0;
}

function isOperatorObject(o) {
  if (o === null || typeof o !== 'object' || Array.isArray(o)) return false;
  if (o instanceof ObjectId || o instanceof Date || o instanceof RegExp) return false;
  const ks = Object.keys(o);
  return ks.length > 0 && ks.every(k => k[0] === '$');
}

function matchOperator(fieldVal, exists, op, operand) {
  switch (op) {
    case '$eq': return deepEqual(fieldVal, operand);
    case '$ne': return !deepEqual(fieldVal, operand);
    case '$gt': return exists && compareValues(fieldVal, operand) > 0;
    case '$gte': return exists && compareValues(fieldVal, operand) >= 0;
    case '$lt': return exists && compareValues(fieldVal, operand) < 0;
    case '$lte': return exists && compareValues(fieldVal, operand) <= 0;
    case '$in': {
      if (!Array.isArray(operand)) throw new Error('$in requires an array');
      if (Array.isArray(fieldVal)) {
        return fieldVal.some(el => operand.some(o => deepEqual(el, o)));
      }
      return operand.some(o => deepEqual(fieldVal, o));
    }
    case '$nin': {
      if (!Array.isArray(operand)) throw new Error('$nin requires an array');
      if (Array.isArray(fieldVal)) {
        return !fieldVal.some(el => operand.some(o => deepEqual(el, o)));
      }
      return !operand.some(o => deepEqual(fieldVal, o));
    }
    case '$exists': return exists === !!operand;
    case '$regex': {
      if (!exists) return false;
      const re = operand instanceof RegExp ? operand : new RegExp(operand);
      return typeof fieldVal === 'string' && re.test(fieldVal);
    }
    default: throw new Error('Unsupported query operator: ' + op);
  }
}

function matchesFilter(doc, filter) {
  if (!filter || typeof filter !== 'object') throw new Error('filter must be an object');
  const keys = Object.keys(filter);
  if (keys.length === 0) return true;
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i], cond = filter[key];
    if (key === '$and') {
      if (!Array.isArray(cond)) throw new Error('$and requires an array');
      if (!cond.every(sub => matchesFilter(doc, sub))) return false;
      continue;
    }
    if (key === '$or') {
      if (!Array.isArray(cond)) throw new Error('$or requires an array');
      if (!cond.some(sub => matchesFilter(doc, sub))) return false;
      continue;
    }
    if (key === '$nor') {
      if (!Array.isArray(cond)) throw new Error('$nor requires an array');
      if (cond.some(sub => matchesFilter(doc, sub))) return false;
      continue;
    }
    if (key[0] === '$') throw new Error('Unsupported top-level operator: ' + key);
    const fv = getPath(doc, key);
    const exists = hasPath(doc, key);
    if (isOperatorObject(cond)) {
      const ops = Object.keys(cond);
      for (let j = 0; j < ops.length; j++) {
        if (!matchOperator(fv, exists, ops[j], cond[ops[j]])) return false;
      }
    } else {
      // Plain equality: also matches array fields containing the value (real MongoDB behavior).
      if (Array.isArray(fv)) {
        if (!fv.some(el => deepEqual(el, cond))) return false;
      } else if (!deepEqual(fv, cond)) {
        return false;
      }
    }
  }
  return true;
}

module.exports = { matchesFilter, getPath, hasPath, deepEqual, compareValues, typeRank };
