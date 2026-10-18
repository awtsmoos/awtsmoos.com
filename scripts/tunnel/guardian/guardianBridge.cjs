// B"H
'use strict';
const {createClient}=require('./guardianClient.cjs');
function attachBridge(ws, options={}) {
 if(!ws||typeof ws!=='object')throw Error('guardian_bridge_socket_required');
 const client=options.client||createClient(options);
 const previous={sendTunnelRequest:ws.sendTunnelRequest,sendTunnelRecoveryControl:ws.sendTunnelRecoveryControl,sendToAlias:ws.sendToAlias};
 ws.sendTunnelRequest=(...args)=>client.sendTunnelRequest(...args);
 ws.sendTunnelRecoveryControl=(...args)=>client.sendTunnelRecoveryControl(...args);
 ws.sendToAlias=(...args)=>client.sendToAlias(...args);
 let inFlight=null;
 const interval=Number(options.refreshMs||1000);
 const refresh=()=>{
  if(inFlight)return inFlight;
  inFlight=(async()=>{
  try{
   const result=await client.clients();
   if(!result?.ok||!Array.isArray(result.clients))throw Error('guardian_snapshot_invalid');
   const registry=new Map();const all=new Set();
   for(const descriptor of result.clients){
    if(!descriptor?.isTunnel||!descriptor.registrationKey||typeof descriptor.registrationKey!=='string')continue;
    const shadow={...descriptor,connected:true,isAlive:true,socket:{destroyed:false,writable:true,readyState:1}};
    registry.set(shadow.registrationKey,shadow);all.add(shadow);
   }
   ws.tunnelClients=registry;ws.tunnels=registry;ws.clients=all;
  }catch{
   // A stale snapshot must never certify an absent guardian as connected.
   ws.tunnelClients=new Map();ws.tunnels=ws.tunnelClients;ws.clients=new Set();
  }finally{inFlight=null;}
  })();
  return inFlight;
 };
 const timer=setInterval(refresh,Math.max(500,Math.min(interval,5000)));timer.unref?.();
 refresh();
 return {client,refresh,stop(){clearInterval(timer);Object.assign(ws,previous);}};
}
module.exports={attachBridge};
