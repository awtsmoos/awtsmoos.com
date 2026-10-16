//B"H
//Boruch Hashem
//Blessed is He
"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const vm=require("node:vm");
const {pairingPageHtml}=require("../pairingPage.js");

function simulate({response={status:200,body:{ok:true}},pairingId="pair_fixture",code="EXAMPLECODE"}={}) {
	const html=pairingPageHtml({pairingCode:code,pairingId});
	const script=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
	assert(script,"standalone inline script exists");
	const nodes=new Map();
	function node(id) {
		if(!nodes.has(id)){
			const classes=new Set();
			nodes.set(id,{
				id,disabled:false,value:"",textContent:"",
				classList:{add:x=>classes.add(x),remove:x=>classes.delete(x),contains:x=>classes.has(x)},
				events:new Map(),addEventListener(type,fn){this.events.set(type,fn);},
				focus(){}
			});
		}
		return nodes.get(id);
	}
	const location={pathname:"/api/tunnel/control/pairing/page",search:"?pairingId=pair_fixture&pairingCode=EXAMPLECODE",href:""};
	const requests=[];
	const sandbox={
		document:{getElementById:node},
		location,
		fetch:async (url,options)=>{
			requests.push({url,options});
			return {status:response.status,json:async()=>response.body};
		},
		console
	};
	vm.runInNewContext(script,sandbox,{timeout:1000,filename:"pairing-page-client.js"});
	return {html,node,location,requests};
}
const flush=()=>new Promise(resolve=>setImmediate(resolve));

test("approved reply switches to only the green check and hides the approval controls",async()=>{
	const ui=simulate();
	ui.node("approve").events.get("click")();
	await flush();
	assert.equal(ui.requests.length,1);
	const request=ui.requests[0];
	assert.equal(request.url,"/api/tunnel/control/pairing/approve");
	assert.equal(JSON.parse(request.options.body).pairingId,"pair_fixture");
	assert.equal(ui.node("view-success").classList.contains("show"),true);
	assert.equal(ui.node("view-approve").classList.contains("hidden"),true);
	assert.equal(ui.node("view-manual").classList.contains("hidden"),true);
	assert(ui.html.includes("<h2>Approved ✓</h2>"));
	assert(!ui.html.includes("magicalBg"));
});

test("unauthenticated approval returns to this precise pairing page after login",async()=>{
	const ui=simulate({response:{status:401,body:{ok:false,error:"not_authenticated"}}});
	ui.node("approve").events.get("click")();
	await flush();
	assert(ui.location.href.startsWith("/login/?next="));
	assert.equal(new URL(ui.location.href,"https://awtsmoos.com").searchParams.get("next"),ui.location.pathname+ui.location.search);
	assert.equal(ui.node("view-success").classList.contains("show"),false);
});

test("failed approval has an explicit error and does not claim success",async()=>{
	const ui=simulate({response:{status:404,body:{ok:false,error:"pairing_expired",message:"The pairing expired."}}});
	ui.node("approve").events.get("click")();
	await flush();
	assert.equal(ui.node("approve").disabled,false);
	assert.equal(ui.node("status").classList.contains("error"),true);
	assert.match(ui.node("status").textContent,/expired/);
	assert.equal(ui.node("view-success").classList.contains("show"),false);
});

test("untrusted pairing query cannot terminate the inline script",()=>{
	const html=pairingPageHtml({pairingCode:'</script><script>alert(1)',pairingId:'</script><img src=x onerror=alert(1)>'});
	assert.equal((html.match(/<\/script>/g)||[]).length,1);
	assert(!html.includes('var pairingId="</script>'));
	assert(html.includes("\\u003c"));
});
