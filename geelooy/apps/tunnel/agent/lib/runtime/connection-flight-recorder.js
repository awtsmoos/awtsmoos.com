// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const LIMIT = 512;
/** The Awtsmoos records bounded transitions without request bodies or credentials. */
function create(options = {}) {
 const file = options.file || path.join(process.env.AWTSMOOS_TUNNEL_STATE_ROOT || path.join(os.homedir(), ".awtsmoos-tunnel-recovery", "state"), "connection-flight.json");
 let events = [], prior = "", registeredAt = 0, lastObservationAt = 0;
 try { if(fs.statSync(file).size <= 1024*1024) events=JSON.parse(fs.readFileSync(file,"utf8")).events.slice(-LIMIT); } catch {}
 function observe(state = {}) {
  const event={at:Date.now(),parentPid:process.pid,childPid:Number(state.childPid||0),incarnation:String(state.childIncarnationId||"").slice(0,100),
   generation:Number(state.generation||0),connected:state.connected===true,registered:state.registered===true,
   reason:String(state.reason||state.lastFailure?.code||"").slice(0,100),attempt:Number(state.reconnectAttempt||0)};
  const gap=lastObservationAt?event.at-lastObservationAt:0;lastObservationAt=event.at;
  if(gap>30000){event.schedulerGapMs=gap;event.observation="wake_or_scheduler_gap";}
  const key=JSON.stringify({...event,at:0});
  if(key===prior)return false;
  prior=key;
  if(event.registered&&!registeredAt)registeredAt=event.at;
  if(!event.registered&&registeredAt){event.registeredDurationMs=event.at-registeredAt;registeredAt=0;}
  events.push(event);events=events.slice(-LIMIT);
  try {fs.mkdirSync(path.dirname(file),{recursive:true,mode:0o700});const tmp=file+"."+process.pid+".tmp";fs.writeFileSync(tmp,JSON.stringify({schemaVersion:1,events})+"\n",{mode:0o600});fs.renameSync(tmp,file);}catch{}
  return true;
 }
 function report(limit=64){
  const recent=events.filter(e=>e.at>Date.now()-3600000);
  return {ok:true,source:"parent_connection_transitions",retainedEvents:events.length,events:events.slice(-Math.max(1,Math.min(256,Number(limit)||64))),
   registeredTransitionsLastHour:recent.filter((e,i)=>e.registered&&(i===0||!recent[i-1].registered)).length,
   longestRecordedOutageMs:outage(events),currentRegisteredDurationMs:registeredAt?Date.now()-registeredAt:0,
   evidenceLimits:"Bounded recorded transitions; registration is not command execution proof."};
 }
 return {observe,report};
}
function outage(events){let start=0,max=0;for(const e of events){if(!e.registered&&!start)start=e.at;if(e.registered&&start){max=Math.max(max,e.at-start);start=0;}}return Math.max(max,start?Date.now()-start:0);}
let singleton;
function current(){return singleton||=(create());}
module.exports={create,current};
