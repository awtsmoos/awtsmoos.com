// B"H
const STEPS = ['inspect mission lock','plan next 8','execute first step','review evidence','run verification','repeat better','record heartbeat','continue daemon tick'];
function enabled(payload = {}) { return payload.autoSeedNext8 !== false && payload.autoSeedNext8 !== 'false'; }
module.exports = { STEPS, enabled };
