// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RuntimeBundlePatch
 * @description
 * The Awtsmoos severs absolute Mach-O build paths and binds the small runtime
 * to its own directory, so the vessel may move without losing its libraries.
 */

const { execFileSync } = require('child_process');

function readRpaths(binary, execute = execFileSync) {
	const output = execute('/usr/bin/otool', ['-l', binary], {
		encoding: 'utf8'
	});
	const paths = [];
	let insideRpath = false;
	for (const line of output.split(/\r?\n/)) {
		if (line.trim() === 'cmd LC_RPATH') insideRpath = true;
		if (insideRpath && /^\s*path\s+/.test(line)) {
			paths.push(line.trim().replace(/^path\s+/, '').replace(/\s+\(offset.*$/, ''));
			insideRpath = false;
		}
	}
	return paths;
}

function patchRuntimeRpaths(binary, options = {}) {
	if ((options.platform || process.platform) !== 'darwin') return [];
	const execute = options.execute || execFileSync;
	const tool = options.installNameTool || '/usr/bin/install_name_tool';
	const rpaths = readRpaths(binary, execute);
	const absolute = rpaths.filter(value => value.startsWith('/'));
	if (!absolute.length) return rpaths;
	const portable = rpaths.includes('@loader_path');
	for (let index = 0; index < absolute.length; index++) {
		const args = (!portable && index === 0)
			? ['-rpath', absolute[index], '@loader_path', binary]
			: ['-delete_rpath', absolute[index], binary];
		execute(tool, args, { stdio: 'pipe' });
	}
	const after = readRpaths(binary, execute);
	if (!after.includes('@loader_path') || after.some(value => value.startsWith('/'))) {
		throw Object.assign(new Error('B"H runtime rpath remained non-portable'), {
			code: 'AWTSMOOS_RUNTIME_RPATH_REFUSED',
			rpaths: after
		});
	}
	return after;
}

module.exports = {
	patchRuntimeRpaths,
	readRpaths
};
