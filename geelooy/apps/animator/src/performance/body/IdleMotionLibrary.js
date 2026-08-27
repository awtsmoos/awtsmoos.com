// B"H
export class IdleMotionLibrary { static forProfile(profile = 'neutral') { return { breathEnergy: profile.includes('child') ? 1.15 : 0.9, weightShift: true }; } }
