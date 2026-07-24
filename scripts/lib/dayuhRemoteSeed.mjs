// B"H
import { dirname } from 'node:path';
import { openAwtsmoosExecInput } from './awtsmoosExecInput.mjs';
import { execOnAwtsmoosClient } from './awtsmoosSshClient.mjs';
import { streamRawArchive } from './dayuhRawArchive.mjs';

/** Seeds the remote database through one raw custom-SSH stream and atomic swap. */
export async function seedDayuhRemote(config, password, progress = () => {}) {
	const archive = `${config.remoteState}/seed.tar.gz.part`;
	const session = await openAwtsmoosExecInput(
		{
			host: config.host,
			username: config.username,
			port: config.port,
			password
		},
		`mkdir -p ${quote(config.remoteState)} && cat > ${quote(archive)}`
	);
	try {
		const summary = await streamRawArchive({
			localRoot: config.localRoot,
			session,
			progress
		});
		const result = await execOnAwtsmoosClient(
			session.client,
			seedCommand(config, archive, summary.sha256)
		);
		if (!result.ok) throw new Error(result.stderr || `remote_seed_exit_${result.code}`);
		return summary;
	} finally {
		session.close();
	}
}

function seedCommand(config, archive, sha256) {
	const incoming = `${config.remoteRoot}.incoming-seed`;
	const backup = `${config.remoteRoot}.previous-seed`;
	const parent = dirname(config.remoteRoot);
	return `set -eu
actual=$(sha256sum ${quote(archive)} | awk '{print $1}')
test "$actual" = ${quote(sha256)}
rm -rf ${quote(incoming)} ${quote(backup)}
mkdir -p ${quote(incoming)} ${quote(parent)}
tar -xzf ${quote(archive)} -C ${quote(incoming)}
if [ -e ${quote(config.remoteRoot)} ]; then mv ${quote(config.remoteRoot)} ${quote(backup)}; fi
restore() { if [ ! -e ${quote(config.remoteRoot)} ] && [ -e ${quote(backup)} ]; then mv ${quote(backup)} ${quote(config.remoteRoot)}; fi; }
trap restore EXIT
mv ${quote(incoming)} ${quote(config.remoteRoot)}
trap - EXIT
rm -rf ${quote(backup)}
rm -f ${quote(archive)}`;
}

function quote(value) {
	return `'${String(value).replace(/'/g, `'\\''`)}'`;
}
