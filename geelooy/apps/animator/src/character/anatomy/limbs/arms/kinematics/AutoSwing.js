// B"H
/**
 * @class AutoSwing
 * @description
 * THE RHYTHM OF EXISTENCE.
 * B"H
 */
export class AutoSwing {
  static get(data, side, time) {
    if (data.isWalking && data.partzufProfile?.type !== 'front') {
       return side === 'left' ? (data.walk.armL || 0) : (data.walk.armR || 0);
    }
    // Idle sway
    const phase = side === 'left' ? 0 : Math.PI;
    return Math.sin(time * 0.002 + phase) * 3;
  }
}
