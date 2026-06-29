// B"H
const DEFAULT_READS = ['README.md', 'package.json', 'geelooy/apps/tunnel/agent/manifest.txt'];
const DEFAULT_GREPS = ['missionBootResume', 'missionNext8Plan', 'releaseCourt'];
function enabled(payload = {}) { return payload.harvestEvidence !== false && payload.harvestEvidence !== 'false'; }
module.exports = { DEFAULT_READS, DEFAULT_GREPS, enabled };
