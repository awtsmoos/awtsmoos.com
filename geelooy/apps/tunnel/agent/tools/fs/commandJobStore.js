// B"H
const { cancelCommandJob } = require('./commandJob/cancel.js');
const { commandJobOutputPage } = require('./commandJob/output.js');
const { startCommandJob } = require('./commandJob/start.js');
const { commandStatus } = require('./commandJob/status.js');
const { commandWait } = require('./commandJob/wait.js');
const Paths = require('./commandJob/paths.js');

/**
 * B"H — The command store facade names five public operations. Lifecycle,
 * cancellation, reconciliation, output, and waits remain in separate vessels.
 */
module.exports = {
	cancelCommandJob,
	commandJobOutputPage,
	commandStatus,
	commandWait,
	jobDir: Paths.jobDir,
	startCommandJob,
	storeRoot: Paths.storeRoot
};
