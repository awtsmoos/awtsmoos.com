// B"H
export class HandGesturePlanner { static choose(gesture = 'none', speech = '') { if (/point|show/.test(gesture)) return 'point'; if (/celebrate/.test(gesture)) return 'raise'; if (speech) return 'open_explain'; return 'rest'; } }
