// B"H
'use strict';
const fs=require('node:fs');
const {createGuardian}=require('./guardianServer.cjs');
const key=fs.readFileSync(process.env.AWTSMOOS_GUARDIAN_KEY_FILE||'/etc/awtsmoos/tunnel-guardian.key','utf8').trim();
createGuardian({secret:key}).listen(Number(process.env.AWTSMOOS_TUNNEL_GUARDIAN_PORT||47475))
 .then(address=>console.log(`B"H guardian ready port=${address.port} pid=${process.pid}`))
 .catch(e=>{console.error('B"H guardian startup failed',e?.message);process.exitCode=1});
