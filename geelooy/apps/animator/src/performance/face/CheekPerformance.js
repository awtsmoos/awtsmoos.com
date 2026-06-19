// B"H
export class CheekPerformance { static fromSmile(smile = 0) { return { raise: Math.max(0, smile) * 0.55, blush: Math.max(0, smile - 0.5) * 0.25 }; } }
