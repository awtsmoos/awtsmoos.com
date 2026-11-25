//B"H
/** The Awtsmoos keeps future notes in their time without allocating every voice at once. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createLookahead, needsLookahead } from '../modules/workstation/song/multitrack/multitrackLookahead.js';
import { createMultitrackProject } from '../modules/workstation/song/multitrack/multitrackProject.js';
import { freezeTrackWithClip } from '../modules/workstation/song/multitrack/multitrackFreeze.js';
import { startMultitrackClipVoice } from '../modules/workstation/song/multitrack/multitrackPlaybackVoice.js';
function fixture(start=0,offset=0) {
	const project=createMultitrackProject({tracks:[{clips:Array.from({length:10000},(_,i)=>({id:`c${i}`,bufferId:'s',timelineStart:start+i*2,duration:1}))}]});
	const context={currentTime:10,createGain:()=>({gain:{value:1},connect(){},disconnect(){}})};
	const calls=[];const timers=new Map();let next=0;let errors=[];let stopped=0;
	const options={project,context,destination:{},offset,audioStore:{getBuffer:()=>({duration:1})},setTimer:fn=>{timers.set(++next,fn);return next;},clearTimer:id=>timers.delete(id),onError:e=>errors.push(e),startVoice:opts=>{
		calls.push(opts);
		const source=new EventTarget();
		return {source,stop(){stopped++;}};
	}};
	function tick(time) {context.currentTime=time;const [id,fn]=timers.entries().next().value;timers.delete(id);fn();}
	return {options,project,context,calls,timers,errors,tick,stopped:()=>stopped};
}
test('10000 clips allocate only five nearby sources and refill on the audio clock',()=>{
	const f=fixture();assert.equal(needsLookahead(f.project,0),true);
	const runtime=createLookahead(f.options);
	assert.equal(runtime.voices.length,5);assert.equal(f.calls.length,5);
	assert.deepEqual(f.calls.map(c=>c.when),[10,12,14,16,18]);
	runtime.voices[0].source.dispatchEvent(new Event('ended'));
	assert.equal(runtime.voices.length,4);
	f.tick(12);assert.equal(f.calls.at(-1).when,20);assert.equal(f.calls.length,6);
	runtime.close();assert.equal(runtime.voices.length,0);assert.equal(f.timers.size,0);assert.equal(f.stopped(),6);
});
test('future silence is playable; missed deadlines stop explicitly',()=>{
	const f=fixture(20);const runtime=createLookahead(f.options);
	assert.equal(runtime.hasAudio,true);assert.equal(runtime.voices.length,0);
	f.tick(40);assert.equal(f.errors.length,1);assert.match(f.errors[0].message,/interrupted/);assert.equal(f.timers.size,0);
});
test('seek includes overlapping clip and validates even distant missing media',()=>{
	const f=fixture(0,4.5);const runtime=createLookahead(f.options);
	assert.equal(f.calls[0].clip.id,'c2');assert.equal(f.calls[0].projectOffset,4.5);assert.equal(f.calls[0].when,10);runtime.close();
	f.options.audioStore={getBuffer:()=>null};assert.throws(()=>createLookahead(f.options),/Missing decoded/);
});
test('loop seek wraps source offset and natural end releases both nodes',()=>{
	let start;let disconnected=0;const source=new EventTarget();Object.assign(source,{connect(){},disconnect(){disconnected++;},start(...args){start=args;},stop(){}});
	const gain={gain:{cancelScheduledValues(){},setValueAtTime(){},linearRampToValueAtTime(){}},connect(){},disconnect(){disconnected++;}};
	const clip={sourceOffset:1,timelineStart:0,duration:10,loop:true,gain:1,fadeIn:0,fadeOut:0};
	const voice=startMultitrackClipVoice({context:{currentTime:0,createBufferSource:()=>source,createGain:()=>gain},buffer:{duration:3},clip,trackOutput:{},projectOffset:5});
	assert.deepEqual(start,[0,2,5]);source.dispatchEvent(new Event('ended'));voice.stop();assert.equal(disconnected,2);
});

test('frozen track on the lookahead path plays at unity — no double gain/effects',()=>{
	const filler={id:'filler',clips:Array.from({length:200},(_,i)=>({id:`f${i}`,bufferId:'s',timelineStart:i*2,duration:1})),gain:0.5,pan:0,effects:{},automation:{gain:[],pan:[]},muted:false,solo:false};
	const raw={id:'vox',clips:[{id:'orig',bufferId:'b1',duration:1,timelineStart:0}],gain:0.25,pan:-0.8,effects:{midGain:6,compressor:true},automation:{gain:[{time:0,value:0.25}],pan:[]},muted:false,solo:false,midiRegions:[{id:'r',start:0,duration:1,notes:[]}]};
	const frozen=freezeTrackWithClip(raw,{id:'fc1',bufferId:'fb1',duration:2,timelineStart:0,gain:1});
	const project=createMultitrackProject({tracks:[frozen,filler]});
	assert.equal(needsLookahead(project,0),true);
	const f=fixture();f.options.project=project;
	const runtime=createLookahead(f.options);
	// The frozen track's output is the unity view (gain 1), not its baked 0.25.
	assert.equal(runtime.outputs[0].gain.gain.value,1);
	assert.equal(runtime.outputs[0].track.gain,1);
	assert.equal(runtime.outputs[0].track.effects.midGain,0);
	// The control track keeps its own gain.
	assert.equal(runtime.outputs[1].gain.gain.value,0.5);
	// The frozen clip itself is scheduled from the frozen buffer.
	assert.ok(f.calls.some(c=>c.clip.id==='fc1'));
	runtime.close();
});
