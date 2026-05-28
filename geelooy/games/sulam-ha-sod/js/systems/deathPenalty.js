// B"H

/**
 * Death penalty math for Sulam HaSod.
 *
 * The Awtsmoos lets every gathered spark testify against careless motion. A
 * death should always cost at least the value gathered during that run, then add
 * a progress-based tithe that grows harsher deeper into the chamber and harsher
 * again in more difficult levels.
 */
export function calculateDeathPenalty({ shefa = 0, runShefa = 0, progress = 0, difficulty = 1 } = {}) {
  const progressRatio = Math.max(0, Math.min(1, progress));
  const diff = Math.max(1, Number(difficulty || 1));
  const runDebt = Math.max(0, Math.ceil(runShefa));
  const progressBase = 4 + Math.ceil(progressRatio * 18);
  const difficultyLift = Math.ceil(diff * (0.8 + progressRatio * 1.7));
  const multiplierDebt = Math.ceil(runDebt * progressRatio * Math.min(2.8, 0.35 + diff * 0.09));
  const rawLoss = Math.max(1, runDebt + progressBase + difficultyLift + multiplierDebt);
  return Math.min(Math.max(0, shefa), rawLoss);
}

/**
 * Builds the readable shatter receipt shown after death.
 *
 * @param {number} loss actual Shefa removed.
 * @param {number} runShefa Shefa collected since the last respawn.
 * @param {number} progress one-based percent-like progress fraction.
 * @returns {string} compact explanation.
 */
export function deathPenaltyReceipt(loss, runShefa, progress) {
  const pct = Math.round(Math.max(0, Math.min(1, progress)) * 100);
  return `Lost ${loss} Shefa: run sparks ${Math.ceil(runShefa)} + progress tax at ${pct}%.`;
}
