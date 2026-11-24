// B"H — Awtsmoos.com measures the actual browser, not imagined pixels.
const {spawn}=require('node:child_process');
const {mkdtempSync,rmSync}=require('node:fs');
const {tmpdir}=require('node:os');
const {join}=require('node:path');
/** Isolated Chrome session using the native DevTools pipe (works with Node 18). */
async function openChrome() {
	const folder=mkdtempSync(join(tmpdir(),'awt-css-'));
	const chrome=spawn(process.env.CHROME_BIN || '/usr/bin/google-chrome',['--headless','--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--remote-debugging-pipe','--user-data-dir='+folder,'about:blank'],{stdio:['ignore','ignore','ignore','pipe','pipe']});
	const pending=new Map();let buffer='',sequence=0;
	function fail(error) {
		for(const entry of pending.values()) {clearTimeout(entry.timer);entry.reject(error);}
		pending.clear();
	}
	chrome.on('error',fail);chrome.on('exit',()=>{fail(Error('Chrome exited'));try{rmSync(folder,{recursive:true,force:true});}catch{}});
	chrome.stdio[4].on('data',chunk=>{
		buffer+=chunk.toString();let end;
		while((end=buffer.indexOf('\0'))>=0) {
			const raw=buffer.slice(0,end);buffer=buffer.slice(end+1);if(!raw) continue;
			const message=JSON.parse(raw),entry=pending.get(message.id);if(!entry)continue;
			pending.delete(message.id);clearTimeout(entry.timer);
			if(message.error)entry.reject(Error(JSON.stringify(message.error)));else entry.resolve(message.result);
		}
	});
	function send(method,params={},sessionId) {
		return new Promise((resolve,reject)=>{
			const id=++sequence;
			const timer=setTimeout(()=>{pending.delete(id);reject(Error('Chrome timeout: '+method));},Number(process.env.AWT_CHROME_TIMEOUT_MS)||12000);
			pending.set(id,{resolve,reject,timer});
			chrome.stdio[3].write(JSON.stringify({id,method,params,...(sessionId?{sessionId}:{})})+'\0');
		});
	}
	async function close(){chrome.kill();}
	try {
		const {targetId}=await send('Target.createTarget',{url:'about:blank'});
		const {sessionId}=await send('Target.attachToTarget',{targetId,flatten:true});
		const call=(method,params)=>send(method,params,sessionId);
		async function evaluate(expression) {
			const response=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
			if(response.exceptionDetails)throw Error(response.exceptionDetails.exception?.description || response.exceptionDetails.text);
			return response.result.value;
		}
		await call('Network.enable');await call('Network.setCacheDisabled',{cacheDisabled:true});
		return {call,evaluate,close};
	} catch(error){await close();throw error;}
}
module.exports={openChrome};
