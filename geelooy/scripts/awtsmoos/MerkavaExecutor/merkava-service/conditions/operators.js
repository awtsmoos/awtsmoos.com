// B"H

export const operators = {
  eq: (a, b) => a === b,
  ne: (a, b) => a !== b,
  gt: (a, b) => a > b,
  gte: (a, b) => a >= b,
  lt: (a, b) => a < b,
  lte: (a, b) => a <= b,
  includes: (a, b) => Array.isArray(a) ? a.includes(b) : String(a || "").includes(String(b || ""))
};

export function getPath(target, path) {
  return String(path || "")
    .split(".")
    .filter(Boolean)
    .reduce((acc, key) => acc?.[key], target);
}
