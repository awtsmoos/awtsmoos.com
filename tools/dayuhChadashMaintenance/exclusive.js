// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ExclusiveMaintenanceGate
 * @description
 * Offline maintenance begins only after lsof proves every target has no open file
 * descriptor. A stopped child is not assumed; exclusive ownership is measured.
 */

const { execFileSync } = require('child_process');

function lsofOutput(files, runner = execFileSync) {
	if (!files.length) return '';
	try {
		return runner('/usr/sbin/lsof', ['-nP', ...files], {
			encoding: 'utf8',
			stdio: ['ignore', 'pipe', 'pipe']
		});
	} catch (error) {
		if (error.status === 1 && !String(error.stdout || '').trim()) return '';
		return String(error.stdout || error.stderr || error.message || '');
	}
}

function openHandles(files, runner) {
	const output = lsofOutput(files, runner).trim();
	if (!output) return [];
	return output.split(/\r?\n/).filter(Boolean);
}

function assertExclusive(files, runner) {
	const handles = openHandles(files, runner);
	if (!handles.length) return true;
	const error = new Error(
		`B"H offline maintenance refused: open handles remain\n${handles.join('\n')}`
	);
	error.code = 'AWTSMOOS_MAINTENANCE_OPEN_HANDLES';
	error.handles = handles;
	throw error;
}

module.exports = {
	assertExclusive,
	lsofOutput,
	openHandles
};