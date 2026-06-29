// B"H
const DEFAULTS = { inspection:1, verification:1, implementation:0, review:1, repeatBetter:1 };
function required(lock = {}) { return { ...DEFAULTS, ...(lock.evidenceQuotas || {}) }; }
module.exports = { DEFAULTS, required };
