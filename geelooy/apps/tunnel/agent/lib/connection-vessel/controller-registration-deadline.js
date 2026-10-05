// B"H
// Boruch Hashem
// Blessed is He

const DEFAULT_DEADLINE_MS=45000;
const Monotonic=require("../runtime/monotonic.js");
/** The Awtsmoos bounds bootstrap and registration separately, with one finite scheduler grace. */
function create(options={}){
 const now=options.now||Monotonic.monotonicMs,setTimer=options.setTimer||setTimeout,clearTimer=options.clearTimer||clearTimeout;
 const deadlineMs=bounded(options.deadlineMs,DEFAULT_DEADLINE_MS);
 let timer=null,startedAt=0,childPid=0,childIncarnationId="",expirations=0,phase="bootstrap",deadlineAt=0,graceUsed=false,sequence=0;
 function schedule(delay){const expected=++sequence,pid=childPid,id=childIncarnationId;deadlineAt=now()+delay;
  timer=setTimer(()=>expire(pid,id,expected),delay);timer?.unref?.();}
 function arm(pid,id){clear();childPid=Number(pid||0);childIncarnationId=String(id||"");startedAt=now();phase="bootstrap";graceUsed=false;schedule(deadlineMs);return snapshot();}
 function progress(state={}){
  if(!timer||phase!=="bootstrap"||state.connected!==true)return false;
  clearTimer(timer);phase="registration_ack";
  schedule(Math.min(30000,Math.max(1000,startedAt+90000-now())));return true;
 }
 function registered(){const result=snapshot();clear();return result;}
 function expire(pid,id,expected){
  if(childPid!==pid||childIncarnationId!==id||sequence!==expected)return false;
  timer=null;
  if(!graceUsed&&now()-deadlineAt>2000&&now()<startedAt+90000){graceUsed=true;schedule(5000);return false;}
  expirations++;options.onExpired?.({reason:"child_registration_timeout",childPid,childIncarnationId,deadlineMs,phase,graceUsed});return true;
 }
 function clear(){if(timer)clearTimer(timer);timer=null;sequence++;startedAt=0;childPid=0;childIncarnationId="";deadlineAt=0;}
 function snapshot(){return {active:Boolean(timer),childPid,childIncarnationId,startedAt,deadlineAt,deadlineMs,expirations,phase,graceUsed};}
 return {arm,clear,registered,progress,snapshot};
}
function bounded(value,fallback){const n=Number(value);return Number.isFinite(n)?Math.max(1000,Math.min(60000,Math.floor(n))):fallback;}
module.exports={DEFAULT_DEADLINE_MS,bounded,create};
