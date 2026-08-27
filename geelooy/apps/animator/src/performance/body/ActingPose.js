// B"H
export class ActingPose { static make(values = {}) { return { breath: 0, weight: 0, headTilt: 0, headNod: 0, shoulder: 0, hand: 'rest', ...(values || {}) }; } }
