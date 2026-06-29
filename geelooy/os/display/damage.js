// B"H
export class DamageTracker { constructor() { this.rects = []; } mark(rect) { this.rects.push(rect); return rect; } consume() { const r = this.rects; this.rects = []; return r; } }
