// B"H
export class ObjectMotionPresets {
  static sample(action = 'idle', from = {}, to = {}, t = 0, h = 10) {
    const x = this.lerp(from.x || 0, to.x ?? from.x ?? 0, t), baseY = this.lerp(from.y || 0, to.y ?? from.y ?? 0, t);
    const lift = ['hop', 'bounce', 'reveal'].includes(action) ? Math.sin(Math.PI * t) * Math.min(18, h) : 0;
    return { x, y: baseY - lift, rotation: action === 'roll' ? this.lerp(0, 160, t) : 0, squash: action === 'hop' ? Math.sin(Math.PI * t) * 0.08 : 0 };
  }
  static lerp(a, b, t) { return Number(a) + (Number(b) - Number(a)) * Math.max(0, Math.min(1, t)); }
}
