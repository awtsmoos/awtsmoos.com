// B"H
const assert=require('node:assert/strict');
const {EventEmitter}=require('node:events');
const test=require('node:test');
const Socket=require('../lib/runtime/main-connection-socket.js');

function fixture() {
 const ws=new EventEmitter();ws.opened=true;ws.closed=false;
 const sends=[],log=[];let pulse=null,cleared=false;
 const mailbox=[{type:'TUNNEL_RESPONSE',id:'unacknowledged-durable-receipt'}];
 const state={activeWs:ws,registrationConfirmed:false,tunnelName:'fixture',generation:1};
 const dependencies={state,TransportMailbox:{outbox:()=>mailbox},Send:{safeSend(socket,message){sends.push(message);return true}},
  Control:{markSeen(){}},Receipt:{write(){}},log(...parts){log.push(parts)},agentVersion:'fixture'};
 const messages={handle(raw){const data=JSON.parse(String(raw));if(data.type==='TUNNEL_ACK')state.registrationConfirmed=true;}};
 const wired=Socket.wireConnectionSocket({dependencies,ws,config:{tunnelName:'fixture'},generation:1,
  messages,owns:()=>true,scheduleReconnect(){},
  openInitializer:()=>({release(){}}),setIntervalFn:(cb,ms)=>{
   assert.equal(ms,2500);pulse=cb;return {unref(){}};
  },clearIntervalFn:()=>{cleared=true;}});
 return {ws,sends,mailbox,state,wired,pulse:()=>pulse,wasCleared:()=>cleared};
}

test('48 incoming requests and ACKs cannot replay the same response repeatedly',async()=>{
 const h=fixture();h.ws.emit('open');h.ws.emit('message',JSON.stringify({type:'TUNNEL_ACK'}));
 assert.equal(h.sends.length,1,'one replay on real registration');
 for(let i=0;i<48;i++)h.ws.emit('message',JSON.stringify({type:'TUNNEL_REQUEST',id:'wait-'+i,payload:{action:'commandWait'}}));
 for(let i=0;i<48;i++)h.ws.emit('message',JSON.stringify({type:'TUNNEL_RESPONSE_ACK',id:'receipt-'+i}));
 for(let i=0;i<55;i++)await new Promise(r=>setImmediate(r));
 assert.equal(h.sends.length,1,'incoming control or waits cannot multiply redelivery');
 h.pulse()();assert.equal(h.sends.length,2,'bounded scheduled recovery retransmits a still-unacked response');
 h.mailbox.length=0;h.pulse()();assert.equal(h.sends.length,2,'ACK settlement ends retransmission');
 h.wired.terminate('socket_closed');assert.equal(h.wasCleared(),true,'dead socket must not retain replay timer');
});
