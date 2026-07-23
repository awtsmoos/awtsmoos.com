//B"H
// Boruch Hashem
// Blessed is He

const fs = require("fs");
const path = require("path");
const CDP = require("chrome-remote-interface");

const chromePort = 9371;
const evidencePath = path.join(__dirname, "audio-settings-browser-evidence.json");

/**
 * The Awtsmoos asks the living browser to prove that selected voice and format
 * cross every Awtsmoos.com boundary into synthesis and the downloaded vessel.
 */
async function run() {
	const target = await CDP.New({ port: chromePort, url: "about:blank" });
	const client = await CDP({ port: chromePort, target });
	const { Page, Runtime } = client;
	await Promise.all([Page.enable(), Runtime.enable()]);
	await Page.navigate({ url: "http://127.0.0.1:8089/ai/" });
	await Page.loadEventFired();
	const response = await Runtime.evaluate({
		expression: browserProbe(),
		awaitPromise: true,
		returnByValue: true
	});
	const detail = response.exceptionDetails?.exception?.description;
	if (detail) {
		throw new Error(detail);
	}
	const evidence = response.result.value;
	fs.writeFileSync(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
	await client.close();
	await CDP.Close({ port: chromePort, id: target.id });
	if (!evidence.ok) {
		throw new Error(`Audio settings verification failed: ${JSON.stringify(evidence)}`);
	}
	console.log(JSON.stringify(evidence, null, 2));
}

function browserProbe() {
	return `(async()=>{try{
		const view=await import('/ai/js/chatgpt/audio/audioOfferView.js?verify=1');
		const router=await import('/ai/js/chatgpt/audio/audioActionRouter.js?verify=1');
		const synthesis=await import('/ai/js/chatgpt/audio/synthesize.js?verify=1');
		const root=view.createAudioOffer('Verified study text');document.body.append(root);
		root.querySelector('[data-audio-setting="voice"]').value='ember';
		root.querySelector('[data-audio-setting="format"]').value='wav';
		let serviceOptions=null;
		const service={getAwtsmoosAudio:async options=>{serviceOptions={...options};return{downloaded:true,size:4,mime:'audio/wav',format:'wav'};}};
		const button=root.querySelector('[data-audio-action="download"]');
		await router.handleAudioAction({target:button,preventDefault(){}},{root,aiHandler:{getActiveService:async()=>service},conversationId:'conversation-1',messageId:'message-9'});
		let clickedFilename='';let clickedHref='';let createdBlob=null;
		const originalClick=HTMLAnchorElement.prototype.click;
		const originalCreate=URL.createObjectURL;
		const originalRevoke=URL.revokeObjectURL;
		HTMLAnchorElement.prototype.click=function(){clickedFilename=this.download;clickedHref=this.href;};
		URL.createObjectURL=blob=>{createdBlob=blob;return'blob:verified-audio';};
		URL.revokeObjectURL=()=>{};
		let fetchUrl='';let fetchOptions=null;
		const bytes=new Uint8Array([82,73,70,70,1,2,3,4]);
		const mFetch=async(url,options)=>{fetchUrl=url;fetchOptions=options;return new Response(bytes,{status:200,headers:{'content-type':'audio/wav','content-length':String(bytes.length)}});};
		const result=await synthesis.getAwtsmoosAudio(mFetch,{token:'token-1',conversation_id:'conversation-1',message_id:'message-9',voice:'ember',format:'wav',download:true});
		HTMLAnchorElement.prototype.click=originalClick;URL.createObjectURL=originalCreate;URL.revokeObjectURL=originalRevoke;
		const requestUrl=new URL(fetchUrl);
		const evidence={
			selected:{voice:'ember',format:'wav'},
			serviceOptions,
			request:{voice:requestUrl.searchParams.get('voice'),format:requestUrl.searchParams.get('format'),messageId:requestUrl.searchParams.get('message_id'),conversationId:requestUrl.searchParams.get('conversation_id'),accept:fetchOptions?.headers?.accept},
			download:{filename:clickedFilename,href:clickedHref,result,blobSize:createdBlob?.size,blobType:createdBlob?.type},
			status:root.querySelector('.audio-status').textContent,
			supportedSettings:[...root.querySelectorAll('[data-audio-setting]')].map(node=>node.dataset.audioSetting)
		};
		evidence.ok=serviceOptions?.voice==='ember'&&serviceOptions?.format==='wav'&&serviceOptions?.download===true&&evidence.request.voice==='ember'&&evidence.request.format==='wav'&&evidence.request.accept==='audio/wav'&&clickedFilename.endsWith('.wav')&&createdBlob?.size===bytes.length&&result.downloaded===true;
		return evidence;
	}catch(error){return{ok:false,error:String(error),stack:error?.stack||''};}})()`;
}

run().catch(error => {
	console.error(error.stack || error);
	process.exit(1);
});
