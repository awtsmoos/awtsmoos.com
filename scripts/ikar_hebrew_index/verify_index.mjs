// B"H
/**
 * @file verify_index.mjs
 * @chapter The Larger Heichel Index Answers Its First Questions
 */

import { searchIkarHebrew } from "./search_ikar_hebrew.mjs";

function assert(condition, message) { if (!condition) throw new Error(message); }
function rowsFor(query) {
  const result = searchIkarHebrew(query, { limit: 20 });
  return result.exact.length ? result.exact : result.phrase;
}

const checks = {
  mishnahStyle: rowsFor("מאימתי"),
  common: rowsFor("אמר"),
  chassidusStyle: rowsFor("אור"),
  empty: rowsFor("מילהשאינהקיימתבכללהיכל")
};

assert(checks.mishnahStyle.length > 0, "מאימתי should find ikar material");
assert(checks.common.length > 0, "אמר should find ikar material");
assert(checks.chassidusStyle.length > 0, "אור should find ikar material");
assert(checks.empty.length === 0, "nonsense token should return empty");

console.log(JSON.stringify({
  ok: true,
  checks: Object.fromEntries(Object.entries(checks).map(([key, rows]) => [key, rows.length])),
  samples: Object.fromEntries(Object.entries(checks).map(([key, rows]) => [key, rows[0] || null]))
}, null, 2));
