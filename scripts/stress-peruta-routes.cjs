// B"H
const { compute } = require('../geelooy/api/tunnel/control/routes/compute.js');
const { bank } = require('../geelooy/api/tunnel/control/routes/bank.js');
const { adminPerutas } = require('../geelooy/api/tunnel/control/routes/adminPerutas.js');
function res(){ return { setHeader(){}, statusCode: 200 }; }
function mock(get = {}, userId = 'asdf') { return { paramKinds: { GET: get }, response: res(), request: { headers: {}, user: { info: { userId } } } }; }
(async () => {
  const c = await compute(mock({}));
  if (!c.includes('Peruta Treasury')) throw new Error('compute html missing treasury');
  const cj = JSON.parse(await compute(mock({ format: 'json' })));
  if (!cj.ok || cj.enforcement !== 'observe_only') throw new Error('compute json bad');
  const bj = JSON.parse(await bank(mock({ format: 'json' })));
  if (!bj.ok || !bj.usage?.balances) throw new Error('bank json bad');
  const aj = JSON.parse(await adminPerutas(mock({ format: 'json', target: 'unit-user', routing: 7, compute: 8 })));
  if (!aj.ok || !aj.grant) throw new Error('admin grant bad');
  console.log(JSON.stringify({ ok: true, checks: ['compute-html', 'compute-json', 'bank-json', 'admin-grant-route'] }, null, 2));
})().catch(e => { console.error(e); process.exit(1); });

