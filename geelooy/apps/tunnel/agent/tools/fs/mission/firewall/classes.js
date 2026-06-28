// B"H
const Data = require('./data.js');
function classify(action='') { if (String(action).startsWith('mission')) return 'missionSafe'; if (Data.evidence.has(action)) return 'missionEvidence'; if (Data.risky.has(action)) return 'missionNeedsStepAuthorization'; if (Data.neutral.has(action)) return 'missionNeutral'; return 'missionNeutral'; }
module.exports = { classify };
