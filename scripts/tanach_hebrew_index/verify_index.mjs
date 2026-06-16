// B"H
/**
 * @file verify_index.mjs
 * @chapter The Gates Are Tested By The Words They Promise To Open
 * @description Verifies required Tanach Hebrew search behavior against the
 * separate AwtsmoosDB index file.
 */

import { searchTanachHebrew } from "./search_tanach_hebrew.mjs";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function firstHit(query) {
  const result = searchTanachHebrew(query, { limit: 10 });
  return { result, rows: result.exact.length ? result.exact : result.phrase };
}

const bereishis = firstHit("בראשית");
assert(bereishis.rows.some(r => r.book === "bereishis" && r.chapter === 1 && r.verse === 1),
  "search בראשית must find bereishis 1:1");

const elokim = firstHit("אלהים");
assert(elokim.rows.length > 1, "search אלהים must find multiple refs");

const yudPlain = firstHit("יהוה");
const yudMarked = firstHit("יְהֹוָה");
assert(yudPlain.rows.length > 0, "search יהוה must find refs");
assert(yudMarked.rows.length > 0, "search יְהֹוָה must normalize and find refs");

const empty = firstHit("מילהשאינהקיימתבכללתנך");
assert(empty.rows.length === 0, "non-existent token should return clean empty");

console.log(JSON.stringify({
  ok: true,
  checks: {
    bereishis: bereishis.rows.length,
    elokim: elokim.rows.length,
    yudPlain: yudPlain.rows.length,
    yudMarked: yudMarked.rows.length,
    empty: empty.rows.length
  }
}, null, 2));
