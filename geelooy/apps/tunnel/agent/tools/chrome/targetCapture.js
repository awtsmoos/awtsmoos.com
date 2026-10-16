//B"H
//Boruch Hashem
//Blessed is He

"use strict";
const crypto=require("node:crypto");
const {ROOT,loadConfig}=require("../../lib/config.js");
const cdp=require("./cdp.js");
const {connectTarget}=require("./isolatedTargetRpc.js");
const Store=require("./captureArtifactStore.js");
const inflight=new Map();

/** Native isolated-target CDP screenshot. Never guesses the foreground window. */
async function captureBrowserTarget(input={},deps={}) {
	const started=Date.now(), stages=[], action="captureBrowserTarget";
	let stage="validation", session=null;
	const setStage=value=>{stage=value;stages.push({stage,elapsedMs:Date.now()-started});};
	const budget=Math.max(1000,Math.min(4000,Number(input.budgetMs||3900)));
	const root=deps.root||ROOT;
	const targetId=String(input.targetId||"");
	const port=Number(input.port||9222);
	const config=deps.config||loadConfig();
	if(!config?.chrome?.enabled||!config?.tools?.chrome)return {ok:false,action,error:"chrome_disabled",stage};
	if(!/^[a-zA-Z0-9_-]{8,128}$/.test(targetId))return {ok:false,action,error:"exact_target_id_required",stage};
	const viewport=input.viewport||{};
	const width=Number(viewport.width||1170),height=Number(viewport.height||2532);
	const dpr=Number(input.deviceScaleFactor??viewport.deviceScaleFactor??1);
	if(!Number.isInteger(width)||!Number.isInteger(height)||width<100||height<100||width>4096||height>4096||!Number.isFinite(dpr)||dpr<0.5||dpr>4)return {ok:false,action,error:"invalid_viewport",stage};
	const mobile=input.mobile===true||viewport.mobile===true,waitUntil=String(input.waitUntil||"none");
	if(!["none","interactive","complete"].includes(waitUntil))return {ok:false,action,error:"invalid_wait_until",stage};
	const fingerprint=crypto.createHash("sha256").update(JSON.stringify({targetId,port,width,height,dpr,mobile,waitUntil,cacheDisabled:input.cacheDisabled===true,diagnostics:input.diagnostics===true})).digest("hex");
	const requestId=String(input.requestId||"");
	if(requestId&&inflight.has(requestId))return inflight.get(requestId);
	const run=async()=>{
		let deadline;
		try{
			const cached=await Store.committed(root,requestId,fingerprint);
			if(cached)return {...cached,action,stage:"complete",durationMs:Date.now()-started};
			const remaining=()=>Math.max(1,budget-(Date.now()-started));
			deadline=new Promise((_,reject)=>setTimeout(()=>reject(new Error("lightweight_budget_exceeded")),budget));
			const work=(async()=>{
				setStage("target_lookup");
				const pages=await (deps.pages||cdp.pages)(port);
				const page=pages.find(item=>item.id===targetId&&item.type==="page"&&item.webSocketDebuggerUrl);
				if(!page)throw new Error("target_not_found");
				setStage("device_acceptance");
				session=await(deps.connectTarget||connectTarget)(page,remaining());
				const call=(name,args)=>session.call(name,args,remaining());
				setStage("cdp");
				await call("Page.enable",{});
				const changed=Boolean(input.viewport||input.deviceScaleFactor!==undefined||input.mobile!==undefined);
				try{
					if(changed)await call("Emulation.setDeviceMetricsOverride",{width,height,deviceScaleFactor:dpr,mobile});
					if(input.cacheDisabled===true)await call("Network.setCacheDisabled",{cacheDisabled:true});
					if(waitUntil!=="none"){
						const ready=await call("Runtime.evaluate",{expression:"document.readyState",returnByValue:true});
						if(waitUntil==="complete"&&ready?.result?.value!=="complete")throw new Error("page_not_ready");
						if(waitUntil==="interactive"&&ready?.result?.value==="loading")throw new Error("page_not_ready");
					}
					setStage("capturing");
					const shot=await call("Page.captureScreenshot",{format:"png",fromSurface:true,captureBeyondViewport:false});
					if(!shot?.data)throw new Error("empty_capture");
					const bytes=Buffer.from(shot.data,"base64");
					if(bytes.length<24||!bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))throw new Error("invalid_png");
					setStage("artifact_created");
					const metadata={targetId,url:page.url,title:page.title,viewport:{width,height},deviceScaleFactor:dpr,mobile,timestamp:new Date().toISOString(),mimeType:"image/png"};
					if(input.diagnostics===true){
						const info=await call("Runtime.evaluate",{expression:"(()=>({computedStyles:{display:getComputedStyle(document.documentElement).display},stylesheets:[...document.styleSheets].slice(0,30).map(x=>x.href||'inline')}))()",returnByValue:true});
						metadata.diagnostics=info?.result?.value||null;
					}
					setStage("artifact_saved");
					const receipt=await(deps.saveArtifact||Store.saveArtifact)(root,bytes,{mimeType:"image/png",metadata,requestId,fingerprint});
					setStage("complete");
					return {...receipt,action,stage,durationMs:Date.now()-started,stages};
				} finally {
					if(changed)await call("Emulation.clearDeviceMetricsOverride",{}).catch(()=>{});
					if(input.cacheDisabled===true)await call("Network.setCacheDisabled",{cacheDisabled:false}).catch(()=>{});
				}
			})();
			return await Promise.race([work,deadline]);
		}catch(error){return {ok:false,action,error:error.message,stage,durationMs:Date.now()-started,stages};}
		finally{session?.close?.();}
	};
	const pending=run();
	if(requestId)inflight.set(requestId,pending);
	try{return await pending;}finally{if(requestId)inflight.delete(requestId);}
}
module.exports={captureBrowserTarget};
