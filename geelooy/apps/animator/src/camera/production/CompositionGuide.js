// B"H
export class CompositionGuide { static safe(camera = {}) { return { ...camera, zoom: Math.max(.45, Math.min(1.05, Number(camera.zoom ?? .7))), y: Number(camera.y ?? 130) }; } }
