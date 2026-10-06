// B"H
// Boruch Hashem
// Blessed is He
const crypto=require("node:crypto"),fs=require("node:fs/promises"),path=require("node:path");
const Cdp=require("./cdp.js"),Extras=require("./extras.js"),Snapshot=require("./frontendSnapshot.js");
const {loadConfig}=require("../../lib/config.js");
const Repo=require("../fs/workSession/repository.js"),Store=require("../fs/workSession/store.js");
const Device=require("../fs/deviceStateRoot.js");
const pause=ms=>new Promise(r=>setTimeout(r,ms));
async function value(expression){const r=await Cdp.cdpCall("Runtime.evaluate",{expression,returnByValue:true,awaitPromise:true},10000);if(r.exceptionDetails)throw Error("browser_evaluation_failed");return r.result?.value;}
async function steps(items){
 let clicked=false,asserted=false;
 for(const step of items){
  if(!["click","assertVisible"].includes(step.type)||typeof step.selector!=="string"||step.selector.length>500)throw Error("frontend_step_invalid");
  const expression="(()=>{const e=document.querySelector("+JSON.stringify(step.selector)+");if(!e)return null;const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width&&r.height&&s.visibility!=='hidden'&&s.display!=='none'?{x:r.x+r.width/2,y:r.y+r.height/2}:null;})()";
  const deadline=Date.now()+Math.min(10000,Math.max(1000,Number(step.timeoutMs)||5000));let rect;
  do{rect=await value(expression);if(rect)break;await pause(100);}while(Date.now()<deadline);
  if(!rect)throw Error("frontend_selector_not_visible:"+step.selector);
  if(step.type==="click"){
   await Cdp.cdpCall("Input.dispatchMouseEvent",{type:"mousePressed",...rect,button:"left",clickCount:1},5000,{noReconnect:true});
   await Cdp.cdpCall("Input.dispatchMouseEvent",{type:"mouseReleased",...rect,button:"left",clickCount:1},5000);clicked=true;
  }else if(clicked)asserted=true;
 }
 return clicked&&asserted;
}
/** The Awtsmoos records cold real-browser evidence without taking another agent's tab. */
async function verify(payload={},config=loadConfig()){
 const widths=payload.widths||[390,768,1440], interactions=payload.steps||[];
 if(!Array.isArray(widths)||!widths.length||widths.length>4||widths.some(w=>!Number.isInteger(w)||w<320||w>2560))throw Error("frontend_widths_invalid");
 if(!Array.isArray(interactions)||interactions.length>16)throw Error("frontend_steps_invalid");
 const url=new URL(payload.url);if(!["http:","https:"].includes(url.protocol))throw Error("frontend_url_invalid");
 const styleAssertions=payload.styleAssertions||[];
 if(!Array.isArray(styleAssertions)||styleAssertions.length>32||styleAssertions.some(a=>typeof a.selector!=="string"||a.selector.length>500||typeof a.property!=="string"||!/^[-a-z]+$/.test(a.property)||typeof a.equals!=="string"||a.equals.length>500))throw Error("frontend_style_assertions_invalid");
 const repo=await Repo.snapshot(config.root);if(!repo.ok)throw Error("repository_unavailable");
 const readiness=await Extras.ready({...payload,headless:true,createNewIfUnbound:true});
 const page=await Cdp.newPage(readiness.port,"about:blank"),id="browser_"+crypto.randomUUID();
 const report={id,source:"real-chrome",commit:repo.commit,repositoryClean:repo.clean,url:url.href,
  createdAt:new Date().toISOString(),samples:[],interactionVerified:false,ok:false};
 try{
  await Cdp.ensurePage(readiness.port,{chromeTargetId:page.id,force:true,timeoutMs:10000});
  await Cdp.cdpCall("Network.enable",{},10000);
  await Cdp.cdpCall("Network.setCacheDisabled",{cacheDisabled:true},10000);
  await Cdp.cdpCall("Page.addScriptToEvaluateOnNewDocument",{source:"window.__awtsmoosVerificationErrors=[];addEventListener('error',e=>window.__awtsmoosVerificationErrors.push(String(e.message||e.target?.src||e.target?.href||'resource_error').slice(0,500)),true);addEventListener('unhandledrejection',e=>window.__awtsmoosVerificationErrors.push(String(e.reason).slice(0,500)));"},10000);
  for(const width of widths){
   await Cdp.cdpCall("Emulation.setDeviceMetricsOverride",{width,height:900,deviceScaleFactor:1,mobile:width<=390},10000);
   const began=Date.now();
   const nav=await Cdp.navigateAndWait(url.href,Math.min(30000,Number(payload.timeoutMs)||20000),readiness.port,{chromeTargetId:page.id});
   if(nav.ok===false)throw Error("frontend_navigation_failed");
   await pause(Math.min(5000,Math.max(200,Number(payload.settleMs)||500)));
   const sample=await value(Snapshot.expression);
   sample.requestedWidth=width;
   sample.styleAssertions=await value("("+function(items){return items.map(a=>{const element=document.querySelector(a.selector),actual=element?getComputedStyle(element).getPropertyValue(a.property).trim():null;return {...a,actual,ok:actual===a.equals};});}.toString()+")("+JSON.stringify(styleAssertions)+")");
   const logs=require("./logs.js").readChromeLogs({maxLogs:200}).logs.filter(e=>e.ts>=began&&Extras.isChromeError(e));
   sample.networkAndConsoleErrors=logs.slice(0,20).map(e=>({source:e.source,message:e.message.slice(0,500)}));
   const image=await Cdp.cdpCall("Page.captureScreenshot",{format:"png",captureBeyondViewport:false,fromSurface:true},10000);
   const bytes=Buffer.from(image.data||"","base64");if(!bytes.length)throw Error("frontend_screenshot_empty");
   const file=path.join(Device.root(config),"work-verification","screenshots",id+"-"+width+".png");
   await fs.mkdir(path.dirname(file),{recursive:true});await fs.writeFile(file,bytes,{mode:0o600});
   sample.screenshotPath=file;sample.screenshotSha256=crypto.createHash("sha256").update(bytes).digest("hex");
   sample.ok=sample.styleAssertions.every(a=>a.ok)&&Math.abs(sample.width-width)<=2&&!sample.overflow&&!sample.errors.length&&!sample.networkAndConsoleErrors.length&&!sample.brokenImages.length&&!sample.duplicateIds.length&&sample.styles.every(s=>s.loaded);
   report.samples.push(sample);
  }
  Object.assign(report,await require("./frontendSourceProof.js").prove(config,payload,url,repo.commit,value));
  report.interactionVerified=await steps(interactions);
  report.styleAssertionsVerified=styleAssertions.length>0&&report.samples.every(s=>s.styleAssertions.every(a=>a.ok));
  const final=await Repo.snapshot(config.root);
  report.ok=report.commitVerified&&report.samples.every(s=>s.ok)&&final.commit===repo.commit&&final.clean&&repo.clean;
  report.visualReview="required";report.semanticCoverage="caller_selected_interaction_assertions";
 }catch(error){report.error=error.message;}
 finally{await Cdp.closePage(readiness.port,page.id).catch(()=>{});}
 await Store.create(config,report,"reports");
 return {...report,action:"chromeVerifyFrontend",reportId:id};
}
module.exports={verify,steps};
