// B"H
/**
 * @file cameraStart.js
 * @description
 * Chapter 619: The first gaze becomes authored data.
 *
 * Lava courses walk east across the X river, while the ancient camera woke up
 * facing north across Z. This helper lets a player spawn whisper exact camera
 * angles into Ayin, so the first rendered breath sees the path, not the side
 * wall of confusion.
 */
const finite = value => Number.isFinite(Number(value));
const numberOr = (value, fallback) => finite(value) ? Number(value) : fallback;

/**
 * Applies optional per-player camera startup values.
 *
 * @param {object} chossid - Living player vessel whose original JSON may carry
 * cameraDistance, cameraTheta, or cameraPhi.
 * @returns {void}
 */
export function applyCameraStart(chossid) {
  const ayin = chossid?.olam?.ayin;
  if (!ayin) return;
  const op = chossid.originalOptions || {};
  const distance = numberOr(op.cameraDistance, 5);
  ayin.currentDistance = distance;
  ayin.desiredDistance = distance;
  if (finite(op.cameraTheta)) ayin.userInputTheta = Number(op.cameraTheta);
  if (finite(op.cameraPhi)) ayin.userInputPhi = Number(op.cameraPhi);
  if (finite(op.cameraTargetHeight)) {
    ayin.targetHeight = Math.max(0.8, Math.min(1.4, Number(op.cameraTargetHeight)));
  }
}
