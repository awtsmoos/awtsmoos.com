/* B"H */
export function createNoiseSuppression(input = {}) { return { kind:'NoiseSuppression', enabled:input.enabled ?? true, mode:input.mode || 'architecture' }; }
export function describeNoiseSuppression(node) { return node.enabled ? `NoiseSuppression:${node.mode}` : 'NoiseSuppression:off'; }
