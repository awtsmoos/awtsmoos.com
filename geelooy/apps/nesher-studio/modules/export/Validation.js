/* B"H */
export function createValidation(input = {}) { return { kind:'Validation', checks:input.checks || [] }; }
export function validateExportPlan(plan) { const checks = []; checks.push(check('video codec', plan.video?.codec?.startsWith('avc1') || plan.videoCodec === 'h264')); checks.push(check('audio codec', plan.audio?.codec === 'mp4a.40.2' || plan.audioCodec === 'aac')); checks.push(check('container', ['mp4','hls','thumbnail'].includes(plan.format))); return { ok:checks.every(c=>c.ok), checks }; }
export function ffprobeProofDescriptor(text = '') { return { kind:'ffprobe-text-proof', ok:/Video: h264|codec_name=h264/i.test(text) && /Audio: aac|codec_name=aac/i.test(text), text }; }
function check(name, ok) { return { name, ok:!!ok }; }
