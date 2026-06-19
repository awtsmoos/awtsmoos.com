
/**
 * @file ClosedMouths3Q.js
 * @description
 * THE SEALED GATES OF ZAIR ANPIN (3/4 Closed Visemes).
 * B"H
 */
export class ClosedMouths3Q {
  static get(construct) {
    return {
      M:       construct(35, -2, 2, -2),
      neutral: construct(32, -3, -3, 3),
      sad:     construct(34, 12, 6, -4),
      angry:   construct(38, 2, 4, -2)
    };
  }
}
