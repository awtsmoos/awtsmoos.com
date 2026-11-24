// B"H — Awtsmoos.com guards the actual rendered surface at every tested width.
const assert=require('node:assert/strict');
const {openChrome}=require('./ChromePipe.cjs');
const {measure}=require('./measure.cjs');
const {setTimeout:sleep}=require('node:timers/promises');
const origin=process.env.SOCIAL_TEST_ORIGIN || 'https://awtsmoos.com';
const routes={social:'/social/',profile:'/profile/',heichelos:'/heichelos/',composer:'/social-composer/'};
const widths=[320,390,1280];
async function viewport(browser,width) {
	await browser.call('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:width<600});
	await sleep(250);
}
async function load(browser,kind,path) {
	await browser.call('Page.navigate',{url:new URL(path,origin).href});
	for(let attempt=0;attempt<60;attempt++) {
		const ready=await browser.evaluate(`document.readyState==='complete' && location.pathname!=='blank' && ${kind==='composer'?"!!document.getElementById('isolated-quick-post')?.shadowRoot":'true'}`);
		if(ready)break;
		await sleep(200);
	}
	await sleep(500);
}
function check(result,kind,width) {
	assert.ok(!result.error,result.error);
	assert.ok(result.width<=width+1,`Unexpected layout viewport: ${result.width}`);
	assert.ok(result.scrollWidth<=width+1,`Horizontal overflow ${result.scrollWidth-width}px`);
	for(const item of result.items) {
		assert.ok(!item.missing,`Missing ${item.selector}`);
		assert.ok(item.visible,`Hidden ${item.selector}`);
		assert.ok(item.x>=-1 && item.x+item.w<=width+1,`Clipped ${item.selector}`);
		assert.ok(item.contrast!==null && item.contrast>=4.5,`Contrast ${item.selector}: ${item.contrast?.toFixed(2)}`);
	}
	if(kind==='composer') {
		assert.ok(result.shadow && result.legacyInert && result.pickerHidden,'Composer isolation broken');
		assert.ok(result.hostWidth<=width+1,'Composer host overflow');
		assert.ok(result.items.find(item=>item.selector==='#body').h>=150,'Writing area too small');
		const next=result.items.find(item=>item.selector==='#next');
		assert.ok(next.h>=44 && next.y+next.h<=result.viewportHeight+1,'Next button outside usable viewport');
	}
}
async function main() {
	const browser=await openChrome();let passed=0,failed=0;
	try {
		for(const [kind,path] of Object.entries(routes)) {
			await viewport(browser,390);await load(browser,kind,path);
			for(const width of widths) {
				await viewport(browser,width);
				const result=await browser.evaluate(`(${measure.toString()})(${JSON.stringify(kind)})`);
				try {check(result,kind,width);console.log('PASS',kind,width);passed++;}
				catch(error){console.log('FAIL',kind,width,error.message,JSON.stringify(result));failed++;}
			}
		}
	} finally {await browser.close();}
	console.log(`CSS browser results: ${passed} passed, ${failed} failed`);
	if(failed)process.exitCode=1;
}
main().catch(error=>{console.error(error);process.exitCode=1;});
