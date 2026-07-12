// B"H
const Context = require('./context.js');
const Lifecycle = require('./lifecycle.js');

/** B"H — Start persists identity before a child receives breath. */
async function startCommandJob(config = {}, payload = {}) {
	if (!Context.allowed(config, payload)) {
		return Context.named(payload, 'commandStart', {
			ok: false,
			error: 'commands_disabled'
		});
	}
	const command = String(payload.command || payload.script || payload.text || '').trim();
	if (!command) {
		return Context.named(payload, 'commandStart', {
			ok: false,
			error: 'missing_command'
		});
	}
	await Context.GarbageCollection.collect(config);
	const ids = Context.Ids.commandIds();
	const cwd = Context.resolveCwd(config, payload);
	const shell = payload.shell || Context.Policy.defaultShell();
	const timeoutMs = Context.Policy.boundedTimeout(payload.timeoutMs || 86400000);
	await Context.Paths.ensureDir(config, ids.jobId);
	const meta = Context.MetaFactory.createMeta({
		...ids,
		command,
		cwd,
		shell,
		timeoutMs,
		config,
		payload,
		ids
	});
	await Context.Meta.write(config, ids.jobId, meta);
	const child = Context.ProcessControl.spawn(command, cwd, shell);
	Context.ProcessControl.renice(child, payload);
	Context.MetaFactory.attachPid(meta, child.pid);
	const live = Lifecycle.createLive(config, payload, ids.jobId, child, meta);
	Lifecycle.wireProcess(config, ids.jobId, child, meta, live, timeoutMs);
	return Context.Responses.start(ids.jobId, {
		command,
		cwd,
		shell,
		timeoutMs,
		storage: meta.storage,
		meta
	});
}

module.exports = { startCommandJob };
