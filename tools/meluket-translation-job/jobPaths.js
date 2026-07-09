// B"H
/**
 * External job-output paths for Meluket tools.
 *
 * The repository is a vessel for source code only. The living river of prompts,
 * model responses, validation reports, repaired XML, import reports, and other
 * generated artifacts must flow outside git so no push can accidentally carry
 * thousands of transient files into history again.
 */
const path = require('path');

const DEFAULT_JOB_ROOT = '/Users/awtsmoos/Documents/awtsmoos-jobs/meluket-translation-job';

function jobRoot() {
  return process.env.AWTSMOOS_JOB_ROOT || DEFAULT_JOB_ROOT;
}

function generatedDir(...parts) {
  return path.join(jobRoot(), 'generated', ...parts);
}

module.exports = {
  DEFAULT_JOB_ROOT,
  jobRoot,
  generatedDir
};
