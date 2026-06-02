// B"H
const fs=require('fs');
const path=require('path');
const { pathToFileURL }=require('url');
const { loadConfig }=require('../../geelooy/apps/tunnel/agent/lib/config.js');
const { collectOptions }=require('../../geelooy/apps/tunnel/agent/tools/fs/actionGroups/runtimeActions.js');
const page=process.argv[2];
const capMs=Number(process.env.MERKAVA_VDOM_EVIDENCE_MS||30000);
const proofSource=`(() => {
  const before = document.querySelectorAll('*').length;
  const probe = document.createElement('section');
  probe.id = 'merkava-vdom-proof';
  probe.className = 'merkava-vdom-proof';
  probe.textContent = 'B"H virtual DOM proof';
  document.body.appendChild(probe);
  if (typeof addStyleSheet === 'function') addStyleSheet('.merkava-vdom-proof{display:block;color:rgb(1, 2, 3);width:7px;height:5px;}');
  const computed = getComputedStyle(probe);
  const canvas = document.createElement('canvas');
  canvas.id = 'merkava-webgl-proof';
  canvas.width = 4; canvas.height = 4;
  document.body.appendChild(canvas);
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
  if (gl) {
    gl.viewport(0,0,4,4);
    gl.clearColor(0.1,0.2,0.3,1);
    if (gl.colorMask) gl.colorMask(true,true,true,true);
    if (gl.stencilMask) gl.stencilMask(255);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    if (gl.drawArrays) gl.drawArrays(gl.TRIANGLES,0,0);
  }
  const renderSnapshot = typeof renderWebGLDom === 'function' ? renderWebGLDom() : null;
  return {
    htmlTag: document.documentElement && document.documentElement.tagName,
    bodyTag: document.body && document.body.tagName,
    before,
    after: document.querySelectorAll('*').length,
    proofFound: !!document.getElementById('merkava-vdom-proof'),
    computedDisplay: computed.getPropertyValue('display') || computed.display || '',
    computedColor: computed.getPropertyValue('color') || computed.color || '',
    canvasContext: !!gl,
    webglCommands: gl && gl.commands ? gl.commands.length : 0,
    textureCount: renderSnapshot && renderSnapshot.textures ? renderSnapshot.textures.length : 0,
    renderCommandCount: renderSnapshot && renderSnapshot.commands ? renderSnapshot.commands.length : 0
  };
})()`;
(async()=>{
 const started=Date.now();
 const config=loadConfig();
 const service=await import(pathToFileURL(path.resolve('geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/index.js')).href+'?vdom='+Date.now());
 const options=await collectOptions({action:'simulateRuntime',p:page,waitMs:0,timeoutMs:capMs},config);
 options.waitMs=0; options.timeoutMs=capMs; options.browserActions=[{action:'evaluate',source:proofSource}];
 const result=await service.simulateRuntime(options);
 const action=(result.interactionLog||[])[0];
 const value=action&&action.value;
 const ok=!!result.ok && !!value && value.htmlTag==='HTML' && value.bodyTag==='BODY' && value.proofFound && value.after>value.before && !!value.canvasContext && value.webglCommands>=3;
 console.log(JSON.stringify({p:page,at:new Date().toISOString(),ok,error:ok?null:(result.error||action?.error||'vdom/css/webgl evidence assertion failed'),ms:Date.now()-started,value}));
 process.exit(ok?0:2);
})().catch(e=>{console.log(JSON.stringify({p:page,at:new Date().toISOString(),ok:false,error:e.message,stack:e.stack}));process.exit(1);});
