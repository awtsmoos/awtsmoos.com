// B"H
export class CameraEmotionRules { static zoomFor(emotion = 'calm') { return { surprised: 1.45, excited: 1.18, warm: 1.02, worried: 1.38, powerful: 1.22 }[emotion] || 0.95; } }
