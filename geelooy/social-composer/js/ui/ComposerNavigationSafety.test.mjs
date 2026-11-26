//B"H
//Boruch Hashem
//Blessed is He
import assert from 'node:assert/strict';
import test from 'node:test';
import { ComposerWorkflow } from './ComposerWorkflow.js';
import { normalizeComposerValue } from '../state/ComposerValue.js';

/** A publication receipt must reveal a single destination, never a duplicate deed. */
function fixture(response) {
	let value = normalizeComposerValue({identity:{aliasId:'teacher',heichelId:'study',seriesId:'lessons'},title:'A teaching',rootBlocks:[{text:'Body'}],publication:{idempotencyKey:'stable-key'}});
	const calls = { publish:0,clear:0,save:0,redirects:[] };
	const workflow = new ComposerWorkflow({
		state:{snapshot:()=>structuredClone(value),replace:next=>{value=next;},mutate:(_,fn)=>fn(value)},
		api:{async publish(){calls.publish++;return response;}},
		localDrafts:{clear(){calls.clear++;},save(){calls.save++;return true;}},
		status:{show(){}},returnPath:'/legacy/'
	});
	workflow.issues=()=>[];
	return {workflow,calls,snapshot:()=>value};
}

test('quick review owns navigation; legacy mode still returns',async()=>{
	const f=fixture({status:'published'});
	const original=globalThis.window;
	globalThis.window={location:{assign:path=>f.calls.redirects.push(path)}};
	try {
		assert.equal((await f.workflow.publish({navigate:false})).status,'published');
		await new Promise(resolve=>setTimeout(resolve,500));
		assert.deepEqual(f.calls.redirects,[]);
		await f.workflow.publish();
		await new Promise(resolve=>setTimeout(resolve,500));
		assert.deepEqual(f.calls.redirects,['/legacy/']);
	} finally {if(original===undefined) delete globalThis.window;else globalThis.window=original;}
});

for(const response of [null,{}, {status:'executing'}, {status:'failed'}]) {
	test(`unconfirmed receipt ${JSON.stringify(response)} retains the draft and key`,async()=>{
		const f=fixture(response);
		assert.equal(await f.workflow.publish({navigate:false}),null);
		assert.equal(f.calls.publish,1);
		assert.equal(f.calls.clear,0);
		assert.equal(f.calls.save,1);
		assert.equal(f.snapshot().publication.idempotencyKey,'stable-key');
		assert.equal(f.snapshot().title,'A teaching');
	});
}
