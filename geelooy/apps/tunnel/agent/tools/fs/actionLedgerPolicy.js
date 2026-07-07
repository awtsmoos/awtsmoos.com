// B"H
const SKIP = new Set([
  'agentSelfTest','agentVersionSkewCheck','payloadEcho','actionSchemaTrace','awtsmoosMyDevice','tunnelLivenessTimeline',
  'commandStatus','commandWait','commandJobOutputPage','commandOutputPage','commandPoll','commandJobStatus',
  'list','tree','stat','read','readLines','readManyLines','readBytes','read64','md','findFiles','fileHashes'
]);
function retention() { return { maxEntries:500, maxAgeMs:7 * 24 * 60 * 60 * 1000 }; }
function shouldSkip(action) { return SKIP.has(String(action || '')); }
module.exports = { SKIP, retention, shouldSkip };
