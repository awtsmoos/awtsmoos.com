//B"H
//Boruch Hashem
//Blessed is He

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

function fakeH(spec) {
	if (spec?.__fakeNode) return spec;
	if (typeof spec === 'string') return {textContent:spec};
	const node={
		__fakeNode:true,tag:spec.tag||'div',attrs:spec.attrs||{},className:spec.className||'',
		textContent:spec.text||'',value:'',disabled:false,events:new Map(),
		addEventListener(name,listener){this.events.set(name,listener);},
		children:(spec.children||[]).map(fakeH)
	};
	return node;
}
function gather(node,predicate,found=[]) {
	if(predicate(node))found.push(node);
	for(const child of node.children||[])gather(child,predicate,found);
	return found;
}
test('Git Control securely dispatches an explicit source import and clears masked key',async()=>{
	const source=await fs.readFile(new URL('../../apps/code/js/virtual-os/apps/GitControlApp.js',import.meta.url),'utf8');
	const modified=source.replace(/import \{ H \} from '\.\.\/ui\/h\.js';/, 'const H = globalThis.__GitControlTestH;');
	const moduleUrl='data:text/javascript;base64,'+Buffer.from(modified).toString('base64');
	const previous={H:globalThis.__GitControlTestH,localStorage:globalThis.localStorage,fetch:globalThis.fetch};
	globalThis.__GitControlTestH=fakeH;
	globalThis.localStorage={getItem:()=>null};
	let captured=null;
	globalThis.fetch=async(url,opts)=>{
		captured={url,opts};
		return {ok:true,async json(){return {ok:true,filesImported:2,destination:'project/repos/example',elapsedMs:342,skippedBinary:[]};}};
	};
	try{
		const {renderGitControlApp}=await import(moduleUrl);
		const container={replaceChildren(node){this.node=node;}};
		renderGitControlApp({},container,{}, {workspace:{name:'Virtual OS'}});
		const input=label=>gather(container.node,n=>n.attrs?.['aria-label']===label)[0];
		const button=gather(container.node,n=>n.tag==='button')[0];
		const status=gather(container.node,n=>n.attrs?.role==='status')[0];
		assert(input('One-use-per-request tunnel write key'));
		input('Public GitHub repository URL').value='https://github.com/octocat/Hello-World';
		input('GitHub branch name').value='master';
		input('Owned Virtual OS destination path').value='project/repos/example';
		input('One-use-per-request tunnel write key').value='TEST_KEY_NOT_REAL';
		await button.events.get('click')();
		assert.equal(captured.url,'/api/tunnel/control/fs/awtsmoos-os');
		assert.equal(captured.opts.method,'POST');
		assert.equal(captured.opts.headers['x-awtsmoos-api-key'],'TEST_KEY_NOT_REAL');
		assert.equal(JSON.parse(captured.opts.body).destination,'project/repos/example');
		assert(!captured.url.includes('TEST_KEY_NOT_REAL'));
		assert.equal(input('One-use-per-request tunnel write key').value,'');
		assert.match(status.textContent,/Imported.*2 source files/);
		assert.equal(button.disabled,false);
		const inspectButton=gather(container.node,n=>n.tag==='button')[1];
		globalThis.fetch=async(url,opts)=>{
			captured={url,opts};
			return {ok:true,async json(){return {ok:true,filesImported:2,source:'https://github.com/octocat/Hello-World',ref:'master',partial:false,importedAt:'2026-10-16T00:00:00Z'};}};
		};
		await inspectButton.events.get('click')();
		assert.match(captured.url,/action=gitCloneStatus/);
		assert.match(captured.url,/path=project%2Frepos%2Fexample/);
		assert.equal(captured.opts.method,'GET');
		assert.equal(captured.opts.headers,undefined);
		assert.match(status.textContent,/Snapshot receipt: 2 imported files/);
		assert.equal(inspectButton.disabled,false);
	}finally{globalThis.__GitControlTestH=previous.H;globalThis.localStorage=previous.localStorage;globalThis.fetch=previous.fetch;}
});
