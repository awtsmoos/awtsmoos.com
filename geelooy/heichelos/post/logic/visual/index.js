// B"H
/** Chapter 308: Reader visual diagnostics gather after manifestation. */
import { reportReaderBootHealth } from './bootHealth.js';
import { detectScrollBlockers } from './scrollBlockerDetector.js';
import { verifyRenderedSectionCount } from './renderCountVerifier.js';
import { blessControlLabels } from './controlLabels.js';

export function runReaderVisualDiagnostics() {
  blessControlLabels();
  const health = reportReaderBootHealth();
  const blockers = detectScrollBlockers();
  const counts = verifyRenderedSectionCount();
  return { health, blockers, counts };
}
