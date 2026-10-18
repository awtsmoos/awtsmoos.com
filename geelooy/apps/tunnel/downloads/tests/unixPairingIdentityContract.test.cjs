// B"H
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');
const test=require('node:test');
const Standalone=require('../unix-pairing-direct.cjs');
const Coherence=require('../../agent/lib/deviceIdentity/keyCoherence.js');
const Candidate=require('../../agent/lib/runtime/main-candidate-identity.js');
const root=path.resolve(__dirname,'..');

test('standalone RSA fingerprint is canonical PEM, matching native KeyCoherence',()=>{
 const pair=crypto.generateKeyPairSync('rsa',{modulusLength:2048,publicKeyEncoding:{type:'spki',format:'pem'},privateKeyEncoding:{type:'pkcs8',format:'pem'}});
 const fp=Standalone.fingerprint(pair.publicKey);
 assert.equal(fp,Coherence.fingerprint(pair.publicKey));
 assert.equal(Coherence.inspect({publicKey:pair.publicKey,publicKeyFingerprint:fp},pair.privateKey).state,'coherent');
 const der=crypto.createPublicKey(pair.publicKey).export({type:'spki',format:'der'});
 assert.notEqual(fp,crypto.createHash('sha256').update(der).digest('base64url'));
});

test('fresh installer pairs under exact staged config name, never hostname alias',()=>{
 const activation=fs.readFileSync(path.join(root,'unix-activation.sh'),'utf8');
 const flow=fs.readFileSync(path.join(root,'unix-pairing-direct-flow.sh'),'utf8');
 assert.match(activation,/CANDIDATE_ROOT\/config\.json/);
 assert.match(activation,/direct_pairing_flow "\$pairing_tunnel_name"/);
 assert.doesNotMatch(activation,/direct_pairing_flow "\$\{AWTSMOOS_TUNNEL_NAME:-\}"/);
 assert.doesNotMatch(flow,/tunnel_name=.*hostname/);
 assert.doesNotMatch(flow,/Continuing without pairing/);
});

test('agent refuses incoherent installer key before writing a credential or metadata',async()=>{
 const os=require('node:os');const temp=fs.mkdtempSync(path.join(os.tmpdir(),'awts-pair-handoff-'));
 const saved={test:process.env.AWTSMOOS_TEST_MODE,install:process.env.AWTSMOOS_INSTALL_ROOT,mode:process.env.AWTSMOOS_REGISTRATION_MODE};
 const pair=crypto.generateKeyPairSync('rsa',{modulusLength:2048,publicKeyEncoding:{type:'spki',format:'pem'},privateKeyEncoding:{type:'pkcs8',format:'pem'}});
 try {
  process.env.AWTSMOOS_TEST_MODE='1';process.env.AWTSMOOS_INSTALL_ROOT=temp;delete process.env.AWTSMOOS_REGISTRATION_MODE;
  fs.writeFileSync(path.join(temp,'provisioned-identity.json'),JSON.stringify({deviceId:'dev_fixture',tunnelId:'tun_fixture',credential:'secret',privateKey:pair.privateKey,publicKey:pair.publicKey,publicKeyFingerprint:'incorrect'}));
  let writes=0;
  const dependencies={DeviceIdentity:{
   KeyCoherence:Coherence,
   SecureStore:{write(){writes++}},Metadata:{write(){writes++}},Provenance:{currentEnvironment(){return 'test'}},
   load(){return {ok:false,state:'unpaired'}},CreationAuthority:{assertCreationAllowed(){throw Error('expected_gate')}},pair(){throw Error('must_not_pair')}
  },log(){}};
  await assert.rejects(()=>Candidate.ensureDeviceIdentity(dependencies,{installRoot:temp}),/expected_gate/);
  assert.equal(writes,0);
  assert(fs.existsSync(path.join(temp,'provisioned-identity.json')));
 } finally {
  for(const [k,v] of [['AWTSMOOS_TEST_MODE',saved.test],['AWTSMOOS_INSTALL_ROOT',saved.install],['AWTSMOOS_REGISTRATION_MODE',saved.mode]]){if(v===undefined)delete process.env[k];else process.env[k]=v}
  fs.rmSync(temp,{recursive:true,force:true});
 }
});

test('coherent provisioned device is stored, loaded and consumed exactly once',async()=>{
 const os=require('node:os');const temp=fs.mkdtempSync(path.join(os.tmpdir(),'awts-pair-valid-'));
 const saved={test:process.env.AWTSMOOS_TEST_MODE,install:process.env.AWTSMOOS_INSTALL_ROOT,mode:process.env.AWTSMOOS_REGISTRATION_MODE};
 const pair=crypto.generateKeyPairSync('rsa',{modulusLength:2048,publicKeyEncoding:{type:'spki',format:'pem'},privateKeyEncoding:{type:'pkcs8',format:'pem'}});
 try {
  process.env.AWTSMOOS_TEST_MODE='1';process.env.AWTSMOOS_INSTALL_ROOT=temp;delete process.env.AWTSMOOS_REGISTRATION_MODE;
  fs.writeFileSync(path.join(temp,'provisioned-identity.json'),JSON.stringify({deviceId:'dev_valid',tunnelId:'tun_valid',credential:'credential-without-logging',privateKey:pair.privateKey,publicKey:pair.publicKey,publicKeyFingerprint:Standalone.fingerprint(pair.publicKey)}));
  const secure=new Map();let metadata;
  const dependencies={DeviceIdentity:{
   KeyCoherence:Coherence,
   SecureStore:{write(device,kind,value){secure.set(`${device}:${kind}`,value)}},Metadata:{write(config,value){metadata=value}},Provenance:{currentEnvironment(){return 'test'}},
   load(){return metadata ? {ok:true,state:'paired',deviceId:metadata.deviceId,tunnelId:metadata.tunnelId}: {ok:false,state:'unpaired'}},
   CreationAuthority:{assertCreationAllowed(){throw Error('must_not_repair')}},pair(){throw Error('must_not_pair')}
  },log(){}};
  const result=await Candidate.ensureDeviceIdentity(dependencies,{installRoot:temp});
  assert.equal(result.ok,true);assert.equal(result.tunnelId,'tun_valid');
  assert.equal(secure.size,2);assert.equal(metadata.publicKeyFingerprint,Coherence.fingerprint(pair.publicKey));
  assert.equal(fs.existsSync(path.join(temp,'provisioned-identity.json')),false);
 } finally {
  for(const [k,v] of [['AWTSMOOS_TEST_MODE',saved.test],['AWTSMOOS_INSTALL_ROOT',saved.install],['AWTSMOOS_REGISTRATION_MODE',saved.mode]]){if(v===undefined)delete process.env[k];else process.env[k]=v}
  fs.rmSync(temp,{recursive:true,force:true});
 }
});
