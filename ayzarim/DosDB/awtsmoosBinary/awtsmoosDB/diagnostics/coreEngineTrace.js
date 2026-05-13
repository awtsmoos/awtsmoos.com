
// B"H

/**
 * @file diagnostics/coreEngineTrace.js
 * @chapter The Core Was Returning A Mask Instead Of The Living Thing
 * @description
 * Current failing stack:
 *
 * test/run_all.js
 * -> test/lightning/runOne.js
 * -> test/lightning/moduleRunner/index.js
 * -> test/lightning/fastSuites/index.js
 * -> test/lightning/fastSuites/suite.js
 * -> test/lightning/fastSuites/probes/scalars.js
 * -> db.root.scalars.pattern.test(...)
 *
 * Real engine failure:
 * RegExp was being stored, but the reader/hydrator path was not converting the
 * persisted RegExp payload back into an actual RegExp instance before property
 * access returned it.
 *
 * Symptom:
 * db.root.scalars.pattern exists but pattern.test is not a function.
 *
 * Core fix:
 * Centralize primitive type encoding and hydration.
 * Make RegExp, BigInt, Date, Buffer, Symbol, Function, ArrayBuffer, and typed
 * arrays all go through real type tables instead of fallthrough behavior.
 *
 * Speed fix:
 * Keep lightning test runner in-process, but remove fake heavy-suite shortcuts
 * as the main strategy. The core itself is made faster by:
 * - skipping forced fsync only in fast-test mode,
 * - preserving pointer Buffer speed in SequenceEngine,
 * - using data tables for primitive read/write,
 * - using exact artifact cleanup instead of repo walking.
 */

module.exports = {
  failingFeature: 'RegExp hydration',
  failingSymptom: 'pattern.test is not a function',
  permanentCoreFix: 'primitive encoder + hydrator tables',
  speedFix: 'core fast idle + in-process runner + exact cleanup'
};
