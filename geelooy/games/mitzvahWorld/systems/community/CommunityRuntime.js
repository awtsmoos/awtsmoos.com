// B"H
/** @file CommunityRuntime.js @description Jewish living-world layer: learning, chesed, Shabbos, holidays, scholars. */
export function createCommunityRuntime(memory = globalThis.__MITZVAH_WORLD_MEMORY__) {
  const events = [];
  function add(kind, text, data = {}) { const e = { kind, text, ...data, at:Date.now() }; events.push(e); memory?.record?.(`community-${kind}`, e); return e; }
  const learning = text => add('learning', text || 'A beis midrash learning schedule begins.');
  const chesed = text => add('chesed', text || 'A chesed need opens in the village.', { reputation:1 });
  const shabbos = text => add('shabbos-prep', text || 'Families prepare candles, food, and peace.');
  const holiday = text => add('holiday-prep', text || 'The village prepares for a coming moed.');
  const scholar = text => add('traveling-scholar', text || 'A traveling scholar enters the story web.');
  function report() { return { events:events.length, kinds:[...new Set(events.map(e => e.kind))] }; }
  return { add, learning, chesed, shabbos, holiday, scholar, report, events };
}
export default createCommunityRuntime;
