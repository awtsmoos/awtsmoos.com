
/**
 * @file ClosedMouthsSide.js
 * @description
 * THE SEALED GATES OF ACHORAIM (Side Closed Visemes).
 * B"H
 */
export class ClosedMouthsSide {
  static get(construct) {
    return {
      M:       construct(26, 4, 2, -2),
      neutral: construct(25, 5, -2, 2),
      sad:     construct(28, 18, 4, -2),
      angry:   construct(30, 8, 3, 0)
    };
  }
}
