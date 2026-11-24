// B"H — Awtsmoos.com tests the boundaries between independent visual vessels.
const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
const {openChrome}=require('./ChromePipe.cjs');
const read=path=>readFileSync(path,'utf8');
/** Test candidate CSS in a real browser without depending on production or login. */
async function main() {
	const browser=await openChrome();
	try {
		const drawer=read('geelooy/style/civilization/profile-action-drawer.css');
		const quick=read('geelooy/social-composer/js/quick/quick.css')+'\n'+read('geelooy/social-composer/js/quick/quickExtras.css');
		const result=await browser.evaluate(`(()=>{
			document.body.innerHTML='<a id="outside">Outside</a><button id="outsideButton">Outside button</button><div class="profile-action-drawer" hidden><div class="profile-action-head"><button>Close</button></div></div><div id="fixture"></div>';
			const outside=document.getElementById('outsideButton');
			const snapshot=()=>[getComputedStyle(outside).color,getComputedStyle(outside).minHeight,getComputedStyle(outside).transform];
			const before=snapshot();const style=document.createElement('style');style.textContent=${JSON.stringify(drawer)};document.head.append(style);
			const after=snapshot();const selectors=[];
			function walk(rules){for(const rule of rules){if(rule.selectorText)selectors.push(rule.selectorText);if(rule.cssRules)walk(rule.cssRules);}}
			walk(style.sheet.cssRules);
			const host=document.getElementById('fixture');host.style.cssText='display:block;position:fixed;inset:0';const shadow=host.attachShadow({mode:'open'});
			const inner=document.createElement('style');inner.textContent=${JSON.stringify(quick)};shadow.append(inner);
			const surface=document.createElement('div');surface.className='screen';surface.innerHTML='<header><a class="close">×</a><h1>New post</h1><button>Advanced</button></header><main><textarea id="body" placeholder="Write"></textarea><button class="destination">Choose destination</button></main><footer><span class="audience">Public</span><button class="primary">Next</button></footer>';shadow.append(surface);
			const inspect=()=>[...shadow.querySelectorAll('h1,textarea,.destination,.primary,.audience')].map(element=>{const css=getComputedStyle(element);return [css.color,css.backgroundColor,css.fontSize,css.fontFamily,css.display];});
			const clean=inspect();const conflict=document.createElement('style');conflict.textContent='* { color: magenta !important; font-size: 48px !important; font-family: monospace !important; } button, textarea, h1, .screen { background: red !important; display: none !important; }';document.head.append(conflict);
			return {before,after,selectors,clean,afterConflict:inspect()};
		})()`);
		assert.deepEqual(result.after,result.before,'Drawer styles leaked outside their component');
		for(const selector of result.selectors)assert.ok(selector.startsWith('.profile-action-drawer'),`Unscoped drawer selector: ${selector}`);
		assert.deepEqual(result.afterConflict,result.clean,'Outer CSS changed the isolated composer');
		console.log('CSS source isolation passed: drawer scope and hostile global styles');
	} finally {await browser.close();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
