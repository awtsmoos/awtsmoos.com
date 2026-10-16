// B"H
const assert = require('node:assert/strict');
const { fork } = require('node:child_process');
const crypto = require('node:crypto');
const Pairing = require('../tunnelSecurity/pairingStore.js');

if (process.argv[2] === 'child') {
  process.on('message', (request) => {
    const status = request.action === 'consume'
      ? Pairing.consumePairing(request.pairingId, request.secret)
      : Pairing.describePairing(request.pairingId);
    process.send({ state: status.state, ok: status.ok, tunnelId: status.tunnelId,
      envelopeDigest: status.credentialEnvelope ? crypto.createHash('sha256').update(status.credentialEnvelope).digest('hex') : null });
  });
} else {
  const test = require('node:test');
  const Fixture = require('./tunnelSecurityTestContext.cjs');
  test('pairing state reads current disk record across workers', async () => {
    const context = Fixture.createSecurityContext();
    const worker = fork(__filename, ['child'], { env: process.env, stdio: ['ignore','ignore','ignore','ipc'] });
    const call = (request) => new Promise((resolve,reject) => {
      const timeout = setTimeout(() => reject(Error('worker_timeout')), 5000);
      worker.once('message', response => { clearTimeout(timeout); resolve(response); });
      worker.send(request);
    });
    try {
      const { publicKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
      const entry = Pairing.createPairingRequest({ deviceId: 'multi-worker', tunnelName: 'multi-worker', devicePublicKey: publicKey.export({ type:'spki',format:'pem' }) });
      assert.equal(entry.ok, true);
      assert.equal((await call({pairingId:entry.pairingId})).state, 'pending');
      assert.equal(Pairing.approvePairing('alice', entry.userCode).ok, true);
      assert.equal((await call({pairingId:entry.pairingId})).state, 'approved');
      const consumed = await call({action:'consume',pairingId:entry.pairingId,secret:entry.requestSecret});
      assert.equal(consumed.ok,true);
      const retry = Pairing.consumePairing(entry.pairingId,entry.requestSecret);
      assert.equal(retry.retried,true);
      assert.equal(retry.tunnelId,consumed.tunnelId);
      assert.equal(crypto.createHash('sha256').update(retry.credentialEnvelope).digest('hex'), consumed.envelopeDigest);
    } finally { worker.kill(); context.cleanup(); }
  });
}
