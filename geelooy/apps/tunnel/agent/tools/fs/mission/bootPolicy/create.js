// B"H
const Policy = require('./config.js');
function payload(input = {}) { return { action:'missionStart', goal:Policy.goal(input), minimumRuntimeMs:Policy.runtimeMs(input), minimumInnovationWindowMs:Policy.runtimeMs(input), autoSeedNext8:true, owner:'daemon', metadata:{ bootCreated:true, reason:input.reason || 'boot_policy' } }; }
module.exports = { payload };
