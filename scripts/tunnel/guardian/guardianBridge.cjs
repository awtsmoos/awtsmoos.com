// B"H
'use strict';
const {createClient}=require('./guardianClient.cjs');
function attachBridge(ws, options={}) {
 if(!ws||typeof ws!=='object')throw Error('guardian_bridge_socket_required');
 const client=options.client||createClient(options);
 const original={sendTunnelRequest:ws.sendTunnelRequest,sendTunnelRecoveryControl:ws.sendTunnelRecoveryControl,sendToAlias:ws.sendToAlias};
 const remote=new Map();
 function matches(map,accountId,reference){
  for(const c of map.values())if(c.accountId===accountId&&
   (c.tunnelId===reference||c.tunnelName===reference))return true;
  return false;
 }
 function localOnly(){return new Map([...ws.tunnelClients.entries()].filter(([_,c])=>c&&!c.__guardianShadow));}
 function guardianRoute(accountId,reference){
  if(matches(remote,accountId,reference))return true;
  return !matches(localOnly(),accountId,reference);
 }
 ws.sendTunnelRequest=function(...args){return guardianRoute(args[0],args[1])
  ?client.sendTunnelRequest(...args):original.sendTunnelRequest.apply(ws,args)};
 ws.sendTunnelRecoveryControl=function(...args){return guardianRoute(args[0],args[1])
  ?client.sendTunnelRecoveryControl(...args):original.sendTunnelRecoveryControl.apply(ws,args)};
 ws.sendToAlias=function(...args){const local=original.sendToAlias?.apply(ws,args);client.sendToAlias(...args).catch(()=>{});return local};
 let inFlight=null;
 const interval=Number(options.refreshMs||1000);
 const refresh=()=>{
  if(inFlight)return inFlight;
  inFlight=(async()=>{
   try{
    const result=await client.clients();
    if(!result?.ok||!Array.isArray(result.clients))throw Error('guardian_snapshot_invalid');
    remote.clear();
    for(const descriptor of result.clients){
     if(!descriptor?.isTunnel||!descriptor.registrationKey||typeof descriptor.registrationKey!=='string')continue;
     remote.set(descriptor.registrationKey,{...descriptor,__guardianShadow:true,connected:true,
      isAlive:true,socket:{destroyed:false,writable:true,readyState:1}});
    }
   }catch{remote.clear();}
   finally{
    // Preserve real browser and legacy-native sockets in the current HTTP
    // generation; only the shadowed guardian entries are replaced.
    const registry=ws.tunnelClients||ws.tunnels||new Map();
    for(const [k,v] of registry)if(v?.__guardianShadow)registry.delete(k);
    for(const [k,v] of remote)registry.set(k,v);
    ws.tunnelClients=registry;ws.tunnels=registry;
    inFlight=null;
   }
  })();return inFlight;
 };
 const timer=setInterval(refresh,Math.max(500,Math.min(interval,5000)));timer.unref?.();
 refresh();
 return {client,refresh,stop(){clearInterval(timer);for(const [k,v] of ws.tunnelClients||[])if(v?.__guardianShadow)ws.tunnelClients.delete(k);Object.assign(ws,original);}};
}
module.exports={attachBridge};
