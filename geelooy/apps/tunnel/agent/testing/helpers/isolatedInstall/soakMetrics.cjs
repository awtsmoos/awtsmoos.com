// B"H
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

/** B"H — One portable sample measures the disposable agent without touching it. */
function sample(processRecord, options = {}) {
	const pid = Number(processRecord?.child?.pid || 0);
	return {
		at: new Date().toISOString(),
		pid,
		rssKb: residentKilobytes(pid),
		openHandles: openHandleCount(pid),
		childProcesses: childProcessCount(pid),
		storeBytes: treeBytes(options.tempHome || options.installRoot || '')
	};
}

function residentKilobytes(pid) {
	if (!pid) return 0;
	if (process.platform === 'linux') {
		const status = readText(`/proc/${pid}/status`);
		const match = /^VmRSS:\s+(\d+)\s+kB$/m.exec(status);
		if (match) return Number(match[1]);
	}
	const result = spawnSync('ps', ['-o', 'rss=', '-p', String(pid)], { encoding: 'utf8' });
	const value = Number(String(result.stdout || '').trim());
	return Number.isFinite(value) ? value : 0;
}

function openHandleCount(pid) {
	if (!pid) return 0;
	if (process.platform === 'linux') {
		try { return fs.readdirSync(`/proc/${pid}/fd`).length; }
		catch { return 0; }
	}
	const result = spawnSync('lsof', ['-n', '-P', '-p', String(pid)], { encoding: 'utf8' });
	if (result.error || result.status !== 0) return 0;
	const lines = String(result.stdout || '').trim().split(/\r?\n/);
	return Math.max(0, lines.length - 1);
}

function childProcessCount(pid) {
	if (!pid) return 0;
	if (process.platform === 'linux') {
		const children = readText(`/proc/${pid}/task/${pid}/children`).trim();
		return children ? children.split(/\s+/).filter(Boolean).length : 0;
	}
	const result = spawnSync('pgrep', ['-P', String(pid)], { encoding: 'utf8' });
	if (result.error || (result.status !== 0 && result.status !== 1)) return 0;
	return String(result.stdout || '').split(/\r?\n/).filter(Boolean).length;
}

function treeBytes(root) {
	if (!root) return 0;
	let total = 0;
	const pending = [path.resolve(root)];
	while (pending.length) {
		const current = pending.pop();
		let entries;
		try { entries = fs.readdirSync(current, { withFileTypes: true }); }
		catch { continue; }
		for (const entry of entries) {
			const full = path.join(current, entry.name);
			if (entry.isDirectory()) { pending.push(full); continue; }
			try { total += fs.statSync(full).size; } catch {}
		}
	}
	return total;
}

function readText(filePath) {
	try { return fs.readFileSync(filePath, 'utf8'); }
	catch { return ''; }
}

module.exports = {
	childProcessCount,
	openHandleCount,
	residentKilobytes,
	sample,
	treeBytes
};
