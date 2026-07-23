//B"H
//Boruch Hashem
//Blessed is He

const fs = require("fs");
const path = require("path");
const CDP = require("chrome-remote-interface");

const port = 9373;

/**
 * The Awtsmoos asks Chrome itself to witness Arbor becoming `fathom` and a
 * multi-megabyte Awtsmoos.com stream becoming one complete browser download.
 */
async function run() {
	const target = await CDP.New({ port, url: "about:blank" });
	const client = await CDP({ port, target });
	const { Page, Runtime } = client;
	await Promise.all([Page.enable(), Runtime.enable()]);
	await Page.navigate({ url: "http://127.0.0.1:8090/ai/" });
	await Page.loadEventFired();
	const response = await Runtime.evaluate({
		expression: probe(),
		awaitPromise: true,
		returnByValue: true
	});
	const detail = response.exceptionDetails?.exception?.description;
	if (detail) {
		throw new Error(detail);
	}
	const evidence = response.result.value;
	fs.writeFileSync(
		path.join(__dirname, "browser-long-audio-evidence.json"),
		`${JSON.stringify(evidence, null, 2)}\n`
	);
	await client.close();
	await CDP.Close({ port, id: target.id });
	if (!evidence.ok) {
		throw new Error(`Browser proof failed: ${JSON.stringify(evidence)}`);
	}
	console.log(JSON.stringify(evidence, null, 2));
}

function probe() {
	return `(async()=>{try{
		localStorage.setItem('awtsmoos.audio.settings.v1',JSON.stringify({voice:'arbor',format:'mp3'}));
		const view=await import('/ai/js/chatgpt/audio/audioOfferView.js?longProof=1');
		const router=await import('/ai/js/chatgpt/audio/audioActionRouter.js?longProof=1');
		const root=view.createAudioOffer('A deliberately long answer');document.body.append(root);
		const voice=root.querySelector('[data-audio-setting="voice"]');
		const arborLabel=voice.selectedOptions[0]?.textContent;
		const totalBytes=5*1024*1024+913;const packetBytes=65537;let requestOptions=null;
		const service={getAwtsmoosAudioStream:async options=>{requestOptions={...options};let offset=0;const stream=new ReadableStream({pull(controller){if(offset>=totalBytes){controller.close();return;}const length=Math.min(packetBytes,totalBytes-offset);const packet=new Uint8Array(length);for(let index=0;index<length;index+=1)packet[index]=(offset+index)*17&255;offset+=length;controller.enqueue(packet);}});return{response:new Response(stream,{headers:{'content-length':String(totalBytes),'content-type':'audio/mpeg'}}),mime:'audio/mpeg',format:'mp3'};}};
		let blobSize=0;let blobType='';let filename='';const originalCreate=URL.createObjectURL;const originalClick=HTMLAnchorElement.prototype.click;
		URL.createObjectURL=blob=>{blobSize=blob.size;blobType=blob.type;return'blob:complete-long-audio';};
		HTMLAnchorElement.prototype.click=function(){filename=this.download;};
		await router.handleAudioAction({target:root.querySelector('[data-audio-action="download"]'),preventDefault(){}},{root,aiHandler:{getActiveService:async()=>service},conversationId:'long-conversation',messageId:'long-message'});
		URL.createObjectURL=originalCreate;HTMLAnchorElement.prototype.click=originalClick;
		const status=root.querySelector('.audio-status').textContent;
		const evidence={displayedVoice:arborLabel,selectedValue:voice.value,requestOptions,blobSize,blobType,filename,status,totalBytes};
		evidence.ok=arborLabel==='Arbor'&&voice.value==='fathom'&&requestOptions?.voice==='fathom'&&requestOptions?.format==='mp3'&&blobSize===totalBytes&&blobType==='audio/mpeg'&&filename.endsWith('.mp3')&&status.includes('Downloaded complete MP3');
		return evidence;
	}catch(error){return{ok:false,error:String(error),stack:error?.stack||''};}})()`;
}

run().catch(error => {
	console.error(error.stack || error);
	process.exit(1);
});
