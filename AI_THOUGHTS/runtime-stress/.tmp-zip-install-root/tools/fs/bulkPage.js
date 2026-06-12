// B"H
/**
 * @file bulkPage.js
 * @description
 * Chapter 356: The Page Was Not A Wall.
 * The Awtsmoos lets a huge reading become ordered waves: each page names its
 * limits, its next cursor, and the exact command-shape that continues the same
 * voyage without pretending the ocean fit inside one cup.
 */

function positiveInt(value, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.floor(n);
}

function nonNegativeInt(value, fallback = 0) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return fallback;
  return Math.floor(n);
}

function requestedInfinity(value) {
  return [true, "all", "none", "nolimit", "noLimit", "unlimited", "infinity", "∞", "0", "-1"].includes(value);
}

function parseLimit(value, fallback) {
  if (requestedInfinity(value)) return Infinity;
  if (value === undefined || value === null || value === "") return fallback;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : fallback;
}

function pageState(payload = {}, total = 0) {
  const pageSize = positiveInt(payload.pageSize || payload.maxFiles, Math.max(1, total || 1));
  const page = positiveInt(payload.page, 1);
  const cursor = nonNegativeInt(payload.cursor ?? payload.offset ?? ((page - 1) * pageSize));
  const end = Math.min(total, cursor + pageSize);
  return { page, pageSize, cursor, end, hasNext: end < total, nextCursor: end < total ? end : null };
}

function describePage(kind, state, limits = {}) {
  const maxBytes = limits.maxBytes === Infinity ? "unlimited" : limits.maxBytes;
  const totalMaxBytes = limits.totalMaxBytes === Infinity ? "unlimited" : limits.totalMaxBytes;
  return [
    `This is one page of the ${kind}.`,
    `page=${state.page}, cursor=${state.cursor}, returnedFilesMax=${state.pageSize}.`,
    `maxBytesPerFile=${maxBytes}, maxCharsPerFile=${limits.maxChars}, totalMaxBytes=${totalMaxBytes}, maxDepth=${limits.maxDepth}.`,
    state.hasNext ? `Send the nextPagePayload to continue at cursor ${state.nextCursor}.` : "No next page remains."
  ].join(" ");
}

function nextPagePayload(payload = {}, action, state) {
  if (!state.hasNext) return null;
  return { ...payload, action, page: state.page + 1, cursor: state.nextCursor, pageSize: state.pageSize, maxFiles: state.pageSize };
}

module.exports = { positiveInt, parseLimit, pageState, describePage, nextPagePayload };
