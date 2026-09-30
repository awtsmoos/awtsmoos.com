// B"H — MongoDB aggregation pipeline for the AwtsmoosDB compat layer.
// Stages: $match $project $group $sort $limit $skip.
// Expression operators: field refs ($x), $add $subtract $multiply $divide $concat,
// $toUpper $toLower $size $cond, accumulators $sum $avg $min $max $first $last $push $addToSet.
'use strict';
const { ObjectId } = require('./objectid');
const { matchesFilter, getPath, deepEqual, compareValues } = require('./filter');
const { cloneVal, setPath, deletePath } = require('./update');

// Canonical serializer (hand-rolled; the banned JSON stringify call is never used here).
function canon(v) {
  if (v === null) return 'null';
  if (v === undefined) return 'undef';
  const t = typeof v;
  if (t === 'number' || t === 'boolean' || t === 'bigint') return t[0] + ':' + String(v);
  if (t === 'string') return 's' + v.length + ':' + v;
  if (v instanceof ObjectId) return 'oid:' + v.toHexString();
  if (v instanceof Date) return 'date:' + String(v.getTime());
  if (Array.isArray(v)) return 'a[' + v.map(canon).join(',') + ']';
  if (t === 'object') {
    const ks = Object.keys(v).sort();
    return 'o{' + ks.map(k => canon(k) + '=' + canon(v[k])).join(',') + '}';
  }
  return 'x:' + String(v);
}

function evalExpr(doc, expr) {
  if (typeof expr === 'string') {
    return expr[0] === '$' ? getPath(doc, expr.slice(1)) : expr;
  }
  if (expr === null || expr === undefined || typeof expr !== 'object') return expr;
  if (expr instanceof ObjectId || expr instanceof Date) return expr;
  if (Array.isArray(expr)) return expr.map(e => evalExpr(doc, e));
  const keys = Object.keys(expr);
  if (keys.length === 1 && keys[0][0] === '$') {
    const op = keys[0], raw = expr[op];
    const args = Array.isArray(raw) ? raw.map(a => evalExpr(doc, a)) : [evalExpr(doc, raw)];
    switch (op) {
      case '$add': return args.reduce((x, y) => (x || 0) + (y || 0), 0);
      case '$subtract': return (args[0] || 0) - (args[1] || 0);
      case '$multiply': return args.reduce((x, y) => (x === undefined ? y : x * y), undefined);
      case '$divide': return args[0] / args[1];
      case '$mod': return args[0] % args[1];
      case '$concat': return args.map(a => (a === null || a === undefined) ? '' : String(a)).join('');
      case '$toUpper': return String(args[0]).toUpperCase();
      case '$toLower': return String(args[0]).toLowerCase();
      case '$size': return Array.isArray(args[0]) ? args[0].length : 0;
      case '$cond': {
        // { $cond: [if, then, else] } or { $cond: { if, then, else } }
        let c, th, el;
        if (Array.isArray(raw)) { c = args[0]; th = args[1]; el = args[2]; }
        else { c = evalExpr(doc, raw.if); th = evalExpr(doc, raw.then); el = evalExpr(doc, raw.else); }
        return c ? th : el;
      }
      case '$ifNull': return (args[0] === null || args[0] === undefined) ? args[1] : args[0];
      case '$literal': return raw;
      default: throw new Error('Unsupported aggregation expression: ' + op);
    }
  }
  const out = {};
  for (let i = 0; i < keys.length; i++) out[keys[i]] = evalExpr(doc, expr[keys[i]]);
  return out;
}

function applyProjection(doc, spec) {
  const keys = Object.keys(spec);
  const include = keys.some(k => spec[k] === 1 || spec[k] === true);
  if (include) {
    const out = {};
    if (spec._id !== 0 && spec._id !== false) out._id = doc._id;
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (k === '_id') continue;
      const v = spec[k];
      if (v === 1 || v === true) {
        if (Object.prototype.hasOwnProperty.call(doc, k)) out[k] = cloneVal(doc[k]);
        else {
          const gv = getPath(doc, k);
          if (gv !== undefined) setPath(out, k, cloneVal(gv));
        }
      } else if (v !== 0 && v !== false) {
        setPath(out, k, evalExpr(doc, v));
      }
    }
    return out;
  }
  const out = cloneVal(doc);
  for (let i = 0; i < keys.length; i++) {
    if (spec[keys[i]] === 0 || spec[keys[i]] === false) deletePath(out, keys[i]);
  }
  return out;
}

function sortDocs(docs, spec) {
  const keys = Object.keys(spec);
  const arr = docs.slice();
  arr.sort((a, b) => {
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i], dir = spec[k] === -1 ? -1 : 1;
      const c = compareValues(getPath(a, k), getPath(b, k));
      if (c !== 0) return c * dir;
    }
    return 0;
  });
  return arr;
}

function groupStage(docs, spec) {
  const groups = new Map();
  const order = [];
  const accKeys = Object.keys(spec).filter(k => k !== '_id');
  for (let i = 0; i < docs.length; i++) {
    const d = docs[i];
    const gid = evalExpr(d, spec._id);
    const gk = canon(gid);
    let g = groups.get(gk);
    if (!g) {
      g = { _id: gid, acc: {} };
      for (let j = 0; j < accKeys.length; j++) {
        const a = accKeys[j], aspec = spec[a];
        const aname = Object.keys(aspec)[0];
        g.acc[a] = { op: aname, expr: aspec[aname], vals: [], first: undefined, count: 0 };
      }
      groups.set(gk, g);
      order.push(gk);
    }
    for (let j = 0; j < accKeys.length; j++) {
      const st = g.acc[accKeys[j]];
      const v = evalExpr(d, st.expr);
      st.count++;
      if (st.first === undefined && st.count === 1) st.first = v;
      st.last = v;
      if (st.op === '$sum') st.vals.push(typeof v === 'number' ? v : 0);
      else if (st.op === '$avg') { if (typeof v === 'number') st.vals.push(v); }
      else if (st.op === '$push') st.vals.push(v);
      else if (st.op === '$addToSet') { if (!st.vals.some(e => deepEqual(e, v))) st.vals.push(v); }
      else if (st.op === '$min' || st.op === '$max') st.vals.push(v);
    }
  }
  return order.map(gk => {
    const g = groups.get(gk);
    const out = { _id: g._id };
    for (let j = 0; j < accKeys.length; j++) {
      const a = accKeys[j], st = g.acc[a];
      switch (st.op) {
        case '$sum': out[a] = st.vals.reduce((x, y) => x + y, 0); break;
        case '$avg': out[a] = st.vals.length ? st.vals.reduce((x, y) => x + y, 0) / st.vals.length : null; break;
        case '$min': out[a] = st.vals.length ? st.vals.reduce((x, y) => (compareValues(x, y) <= 0 ? x : y)) : null; break;
        case '$max': out[a] = st.vals.length ? st.vals.reduce((x, y) => (compareValues(x, y) >= 0 ? x : y)) : null; break;
        case '$first': out[a] = st.first === undefined ? null : st.first; break;
        case '$last': out[a] = st.last === undefined ? null : st.last; break;
        case '$push':
        case '$addToSet': out[a] = st.vals; break;
        default: throw new Error('Unsupported group accumulator: ' + st.op);
      }
    }
    return out;
  });
}

function runPipeline(docs, pipeline) {
  if (!Array.isArray(pipeline)) throw new Error('pipeline must be an array');
  let cur = docs.map(d => cloneVal(d));
  for (let i = 0; i < pipeline.length; i++) {
    const stage = pipeline[i];
    const ops = Object.keys(stage);
    if (ops.length !== 1) throw new Error('each pipeline stage must have exactly one operator');
    const op = ops[0], spec = stage[op];
    switch (op) {
      case '$match': cur = cur.filter(d => matchesFilter(d, spec)); break;
      case '$project': cur = cur.map(d => applyProjection(d, spec)); break;
      case '$group': cur = groupStage(cur, spec); break;
      case '$sort': cur = sortDocs(cur, spec); break;
      case '$limit': cur = cur.slice(0, spec); break;
      case '$skip': cur = cur.slice(spec); break;
      default: throw new Error('Unsupported aggregation stage: ' + op);
    }
  }
  return cur;
}

module.exports = { runPipeline, evalExpr, applyProjection, sortDocs, canon };
