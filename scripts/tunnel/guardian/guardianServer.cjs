// B"H
'use strict';
const http=require('node:http');
const fs=require('node:fs');
const crypto=require('node:crypto');
const path=require('node:path');
const AwtsSocket=require('../../../ayzarim/awtsmoosDynamicServer/awtsmoosSocket.js');
const Sockets=require('../../../ayzarim/awtsmoosDynamicServer/websocket/core/socketAdmission.js');
const {parseCookies}=require('../../../ayzarim/tools/utils.js');
const AwtsAuth=require('../../../ayzarim/tools/auth.js');
const MAX_BODY=17*1024*1024;
const rawNames=[
 'isTunnel','accessKind','accountId','tunnelId','tunnelName','deviceId','deviceName','platform',
 'kind','vesselType','browserAgent','connected','isAlive','root','allowWrite','agentVersion',
 'capabilities','tools','registeredAt','lastSeenAt','heartbeatAt','lastPongAt','missedHeartbeats',
 'awaitingPong','executionHealthSupported','executionHealthy','executionHealthState','executionHealthAt',
 'acceptanceHealthSupported','acceptanceHealthy','acceptanceHealthState','acceptanceHealthAt',
 'acceptanceFailureAt','acceptanceLastFailureAt','acceptanceSuccessAt','acceptanceFailureStreak',
 'lastAcceptedAt','lastAcceptedReceiptId','parentCustody','registrationKey'
 ];
function profile(client){const o={};for(const key of rawNames)if(client[key]!==undefined)o[key]=client[key];return o;}
function clientsOf(ws){return Array.from(ws.tunnelClients?.values()||[]).filter(x=>x?.isTunnel).map(profile);}
function validateHeader(actual,expected){const a=Buffer.from(String(actual||'')),b=Buffer.from(String(expected||''));return a.length===b.length&&a.length>0&&crypto.timingSafeEqual(a,b);}
function loadAuth(root){
 // Use exactly the same secret loader/fallback as the established website,
 // so session-authenticated browser sockets do not change identity when
 // upgraded by the independent guardian.
 const config=require(path.join(root,'ayzarim/awtsmoos.config.json'));
 const {loadSecret}=require('../../../ayzarim/awtsmoosDynamicServer/server/authSetup.js');
 const secret=loadSecret({config},`${root}/`);
 return secret ? new AwtsAuth(JSON.stringify(secret)) : null;
}
function createGuardian(options={}){
 const ws=options.ws||new AwtsSocket();
 const secret=String(options.secret||'');
 if(secret.length<32)throw Error('guardian_rpc_secret_unavailable');
 if(!options.disableCookieAuth){ws.auth=loadAuth(options.root||path.resolve(__dirname,'../../..'));ws.parseCookies=parseCookies;}
 const service=http.createServer(async(req,res)=>{
  if(req.url==='/healthz'&&req.method==='GET')return respond(res,200,{ok:true,role:'independent_tunnel_guardian',pid:process.pid,connections:ws.tunnelClients?.size||0,admission:Sockets.socketAdmissionSnapshot(ws)});
  if(!validateHeader(req.headers['x-awtsmoos-guardian-key'],secret))return respond(res,403,{ok:false,error:'guardian_auth_required'});
  if(req.url==='/rpc/devices'&&req.method==='GET')return respond(res,200,{ok:true,clients:clientsOf(ws)});
  if(req.method!=='POST')return respond(res,405,{ok:false,error:'unsupported_guardian_method'});
  let body;
  try{body=await readJson(req)}catch{return respond(res,413,{ok:false,error:'invalid_guardian_payload'});}
  try{
   if(req.url==='/rpc/send')return respond(res,200,await ws.sendTunnelRequest(body.accountId,body.reference,body.payload,body.timeoutMs));
   if(req.url==='/rpc/recovery')return respond(res,200,await ws.sendTunnelRecoveryControl(body.accountId,body.reference,body.verb,body.payload,body.timeoutMs));
   if(req.url==='/rpc/alias')return respond(res,200,{ok:Boolean(ws.sendToAlias(body.alias,body.payload))});
   return respond(res,404,{ok:false,error:'unknown_guardian_route'});
  }catch(e){return respond(res,502,{ok:false,error:String(e?.message||'guardian_request_failed').slice(0,160)});}
 });
 service.on('upgrade',(req,socket,head)=>ws.handleUpgrade(req,socket,head));
 service.on('clientError',(_e,socket)=>socket.destroy());
 return {server:service,ws,listen(port=47475){return new Promise((resolve,reject)=>{service.once('error',reject);service.listen(port,'127.0.0.1',()=>{service.off('error',reject);resolve(service.address())})})}};
}
async function readJson(req){let total=0;const blocks=[];for await(const c of req){total+=c.length;if(total>MAX_BODY)throw Error('guardian_body_too_large');blocks.push(c)}return JSON.parse(Buffer.concat(blocks).toString('utf8'));}
function respond(res,status,body){if(res.writableEnded)return;const value=Buffer.from(JSON.stringify(body??null));res.writeHead(status,{'Content-Type':'application/json','Content-Length':value.length,'Cache-Control':'no-store'});res.end(value);}
module.exports={createGuardian,clientsOf,profile,validateHeader,loadAuth,readJson};
