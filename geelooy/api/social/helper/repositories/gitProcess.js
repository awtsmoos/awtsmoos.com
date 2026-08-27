//B"H
// Boruch Hashem
// Blessed is He

const { execFile, spawn } = require('child_process');
const { promisify } = require('util');

/**
 * @module GitProcess
 * @description
 * The Awtsmoos lets Git keep its own mature plumbing while Awtsmoos.com bounds
 * time, output, environment, and arguments. User-controlled repository values
 * never enter a shell command string; every deed is an argv-shaped process.
 */

const execFileAsync = promisify(execFile);
const GIT = process.env.AWTSMOOS_GIT_BIN || '/usr/bin/git';
const GIT_HTTP_BACKEND = process.env.AWTSMOOS_GIT_HTTP_BACKEND
	|| '/Library/Developer/CommandLineTools/usr/libexec/git-core/git-http-backend';

async function runGit(args, options = {}) {
	const result = await execFileAsync(GIT, args.map(String), {
		cwd: options.cwd,
		env: cleanEnvironment(options.env),
		timeout: Number(options.timeoutMs || 120000),
		maxBuffer: Number(options.maxBuffer || 16 * 1024 * 1024),
		encoding: options.encoding === null ? null : 'utf8'
	});
	return { stdout: result.stdout, stderr: result.stderr };
}

function runGitHttp(environment, body = Buffer.alloc(0)) {
	return new Promise((resolve, reject) => {
		const child = spawn(GIT_HTTP_BACKEND, [], {
			env: cleanEnvironment(environment),
			stdio: ['pipe', 'pipe', 'pipe']
		});
		const stdout = [];
		const stderr = [];
		let bytes = 0;
		child.stdout.on('data', chunk => {
			bytes += chunk.length;
			if (bytes > 64 * 1024 * 1024) child.kill('SIGKILL');
			else stdout.push(chunk);
		});
		child.stderr.on('data', chunk => stderr.push(chunk));
		child.on('error', reject);
		child.on('close', code => {
			if (code !== 0) return reject(processError(code, stderr));
			resolve(Buffer.concat(stdout));
		});
		child.stdin.end(body);
	});
}

function cleanEnvironment(extra = {}) {
	return {
		PATH: process.env.PATH || '/usr/bin:/bin',
		HOME: process.env.HOME || '/tmp',
		LANG: 'C.UTF-8',
		...extra
	};
}

function processError(code, stderr) {
	const error = new Error(`GIT_PROCESS_FAILED:${code}`);
	error.code = 'GIT_PROCESS_FAILED';
	error.stderr = Buffer.concat(stderr).toString('utf8').slice(0, 8000);
	return error;
}

module.exports = {
	GIT,
	GIT_HTTP_BACKEND,
	cleanEnvironment,
	runGit,
	runGitHttp
};
