// B"H
/**
 * @class GrabLogic
 * @description
 * THE INTENT OF THE SOUL.
 * B"H
 */
export class GrabLogic {
  static getHeldItem(data, side) {
    if (side === 'right') {
      if (data.isDrinking) return 'cup';
      if (data.isTexting) return 'phone';
    }
    return null;
  }
}
