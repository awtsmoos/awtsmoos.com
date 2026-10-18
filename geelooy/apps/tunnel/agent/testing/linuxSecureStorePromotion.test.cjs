// B"H
// Boruch Hashem
// Blessed is He

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const test = require('node:test');
const Store = require('../lib/deviceIdentity/linuxStore.js');
const downloads = path.resolve(__dirname, '../../downloads');

/** A legacy ciphertext must become visible to a staged runtime, never leaked. */
function runFixture(verify) {
	const base = fs.mkdtempSync(path.join(os.tmpdir(), 'awts-key-promotion-'));
	const root = path.join(base, 'agent');
	const recovery = path.join(base, 'recovery');
	const saved = { install: process.env.AWTSMOOS_INSTALL_ROOT, recovery: process.env.AWTSMOOS_RECOVERY_ROOT };
	fs.mkdirSync(root);
	try {
		process.env.AWTSMOOS_INSTALL_ROOT = root;
		process.env.AWTSMOOS_RECOVERY_ROOT = recovery;
		const service = 'com.awtsmoos.tunnel.device';
		const device = 'dev_' + crypto.randomBytes(6).toString('hex');
		const publicKeyPair = crypto.generateKeyPairSync('rsa', { modulusLength: 2048, publicKeyEncoding: { format: 'pem', type: 'spki' }, privateKeyEncoding: { format: 'pem', type: 'pkcs8' } });
		const credential = crypto.randomBytes(32).toString('hex');
		Store.write(service, `${device}:private-key`, publicKeyPair.privateKey);
		Store.write(service, `${device}:credential`, credential);
		const target = path.join(recovery, 'state/private/.linux-secure-store');
		const legacy = path.join(root, '.linux-secure-store');
		fs.renameSync(target, legacy);
		assert.equal(Store.read(service, `${device}:private-key`), null);
		verify({ base, root, recovery, service, device, legacy, target, credential, publicKeyPair });
	} finally {
		for (const [key, value] of [['AWTSMOOS_INSTALL_ROOT',saved.install], ['AWTSMOOS_RECOVERY_ROOT',saved.recovery]]) {
			if(value===undefined)delete process.env[key]; else process.env[key]=value;
		}
		fs.rmSync(base,{recursive:true,force:true});
	}
}
function migrate(root, recovery) {
	const script = `ROOT='${root}'\nRECOVERY_ROOT='${recovery}'\nAWTSMOOS_NODE_BIN='${process.execPath}'\nsource '${path.join(downloads,'unix-state-migration.sh')}'\nuname(){ printf 'Linux\\n'; }\nmigrate_linux_secure_store`;
	return spawnSync('bash',['-c',script],{encoding:'utf8',timeout:4000});
}

test('legacy machine-sealed identity survives installation path replacement',()=>runFixture(({root,recovery,service,device,credential,publicKeyPair,target,legacy})=>{
	const first=migrate(root,recovery);
	assert.equal(first.status,0,first.stderr);
	assert.equal(Store.read(service,`${device}:credential`),credential);
	const key=Store.read(service,`${device}:private-key`);
	assert.equal(key,publicKeyPair.privateKey);
	assert(fs.existsSync(legacy),'rollback copy must survive');
	assert.equal(fs.statSync(target).mode & 0o777,0o700);
	for(const file of fs.readdirSync(target))assert.equal(fs.statSync(path.join(target,file)).mode & 0o777,0o600);
	const again=migrate(root,recovery);
	assert.equal(again.status,0,again.stderr);
}));

test('conflicting encrypted custody fails closed and retains original files',()=>runFixture(({root,recovery,legacy,target})=>{
	fs.mkdirSync(target,{recursive:true,mode:0o700});
	const name=fs.readdirSync(legacy)[0];
	fs.writeFileSync(path.join(target,name),'tampered encrypted data',{mode:0o600});
	const result=migrate(root,recovery);
	assert.notEqual(result.status,0);
	assert.match(result.stderr,/identity_store_conflict/);
	assert(fs.existsSync(path.join(legacy,name)));
}));

test('symlinked legacy secure store is refused',()=>runFixture(({root,recovery,legacy})=>{
	fs.renameSync(legacy,legacy+'-real');
	fs.symlinkSync(legacy+'-real',legacy,'dir');
	const result=migrate(root,recovery);
	assert.notEqual(result.status,0);
	assert.match(result.stderr,/identity_store_source_invalid/);
}));
