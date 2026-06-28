// B"H
const DEFAULT_GOAL = 'Autonomous Awtsmoos tunnel mission: inspect, improve, verify, repeat better, and do not release until court allows.';
function enabled(payload = {}) { return payload.autoMission === true || payload.autoMission === 'true' || process.env.AWTSMOOS_AUTO_MISSION === '1'; }
function goal(payload = {}) { return payload.goal || process.env.AWTSMOOS_AUTO_MISSION_GOAL || DEFAULT_GOAL; }
function runtimeMs(payload = {}) { return Number(payload.minimumRuntimeMs ?? process.env.AWTSMOOS_AUTO_MISSION_RUNTIME_MS ?? 3600000); }
module.exports = { DEFAULT_GOAL, enabled, goal, runtimeMs };
