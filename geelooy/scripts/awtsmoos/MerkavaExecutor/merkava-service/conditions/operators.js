// B"H
/**
 * @file operators.js
 * @description Pure JSON condition operators for Merkava workflows.
 */

function getPath(source, dotted) {
  const parts = String(dotted || "").split(".").filter(Boolean);
  let cur = source;
  for (const part of parts) {
    if (cur == null) return undefined;
    cur = cur[part];
  }
  return cur;
}

function truthy(value) {
  return !!value;
}

const operators = {
  eq: (a, b) => a === b,
  neq: (a, b) => a !== b,
  gt: (a, b) => Number(a) > Number(b),
  gte: (a, b) => Number(a) >= Number(b),
  lt: (a, b) => Number(a) < Number(b),
  lte: (a, b) => Number(a) <= Number(b),
  and: (...values) => values.every(truthy),
  or: (...values) => values.some(truthy),
  not: value => !truthy(value),
  includes: (a, b) => Array.isArray(a) ? a.includes(b) : String(a || "").includes(String(b)),
  has: (source, path) => getPath(source, path) !== undefined,
  matches: (value, pattern) => new RegExp(String(pattern)).test(String(value || ""))
};

module.exports = { operators, getPath };
