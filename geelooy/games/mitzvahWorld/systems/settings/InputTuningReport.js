// B"H
export function inputTuningReport(tuning = {}) { return { sensitivity:tuning.sensitivity, deadzone:tuning.deadzone, invertX:Boolean(tuning.invertX), invertY:Boolean(tuning.invertY), floating:Boolean(tuning.floating) }; }
export default inputTuningReport;
