// B"H
const { isBatchAction } = require('./batch.js');
const { chatgptDescription } = require('./chatgpt.js');
function descriptionFor(kind, name) {
  const base = `Run Awtsmoos ${kind} action ${name}.`;
  if (/^chatgpt/i.test(name)) return chatgptDescription(name);
  if (/^(agent|aiAgent)/i.test(name)) return `${base} AI delegate action; accepts top-level fields and JSON in content/params/body/query/goal.`;
  if (isBatchAction(name)) return `${base} Command-tree/action-batch action; accepts native steps or JSON in content/params/actionsJson/workflow64.`;
  if (/bulkWrite/i.test(name)) return `${base} Bulk complete-file write; accepts writes/files or JSON/XML in content/params/body/query/goal.`;
  if (/^(writeImage|imageWrite|uploadImage)$/i.test(name)) return `${base} Writes generated image from base64/dataUrl.`;
  if (/^postsNeedsWork$/i.test(name)) return `${base} Ask "what needs work on my posts?" — scans every alias the authenticated account owns and reports unfinished work organized alias → series → post: missing translations, missing phrase translations, missing summaries, missing footnotes, missing/broken inline page markers, posts with no alias link, empty alias links, submitted-but-unapproved posts. Accepts alias, limit, heichel, series, gaps, summaryOnly.`;
  if (kind === 'relay') return `${base} ChatGPT relay actions use browser cookies; JSON/Jason relay is separate.`;
  if (/write/i.test(name)) return `${base} Send complete file content only; never a partial patch.`;
  if (kind === 'chrome') return `${base} Uses the authorized local Chrome/DevTools bridge.`;
  return base;
}
module.exports = { descriptionFor };
