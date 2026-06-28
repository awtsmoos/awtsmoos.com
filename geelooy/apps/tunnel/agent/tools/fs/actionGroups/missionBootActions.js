// B"H
const Boot = require('../mission/boot/index.js');
function buildMissionBootActions(ctx, buildActions) { const { config, payload } = ctx; return { async missionBootResume() { return Boot.resume(config, payload, buildActions); } }; }
module.exports = { buildMissionBootActions };
