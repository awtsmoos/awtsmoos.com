// B"H
'use strict';
const http=require('node:http');
const fs=require('node:fs');
const DEFAULT_KEY='/etc/awtsmoos/tunnel-guardian.key';
function createClient(options={}){
 const key=options.secret||fs.readFileSync(options.keyFile||DEFAULT_KEY,'utf8').trim();
 const port=Number(options.port||process.env.AWTSMOOS_TUNNEL_GUARDIAN_PORT||47475);
 async function rpc(endpoint,payload,timeoutMs=25000){
  return await new Promise((resolve,reject)=>{
   const body=payload?Buffer.from(JSON.stringify(payload)):null;
   const req=http.request({host:'127.0.0.1',port,path:endpoint,method:body?'POST':'GET',timeout:Math.min(120000,Math.max(1000,timeoutMs)),headers:{'x-awtsmoos-guardian-key':key,...(body?{'content-type':'application/json','content-length':body.length}:{})}},res=>{let size=0;const chunks=[];res.on('data',c=>{size+=c.length;if(size>20*1024*1024){req.destroy(Error('guardian_result_too_large'));return}chunks.push(c)});res.on('end',()=>{try{const r=JSON.parse(Buffer.concat(chunks).toString('utf8'));res.statusCode>=500?reject(Error(r.error||'guardian_failed')):resolve(r)}catch(e){reject(e)}})});
   req.on('timeout',()=>req.destroy(Error('guardian_deadline_exceeded')));
   req.on('error',reject);req.end(body);
  });
 }
 return {rpc,
  sendTunnelRequest(accountId,reference,payload,timeoutMs){return rpc('/rpc/send',{accountId,reference,payload,timeoutMs},Number(timeoutMs||30000)+3000)},
  sendTunnelRecoveryControl(accountId,reference,verb,payload,timeoutMs){return rpc('/rpc/recovery',{accountId,reference,verb,payload,timeoutMs},Number(timeoutMs||30000)+3000)},
  sendToAlias(alias,payload){return rpc('/rpc/alias',{alias,payload},4500)},
  clients(){return rpc('/rpc/devices',null,3000)}
 };
}
module.exports={createClient};
