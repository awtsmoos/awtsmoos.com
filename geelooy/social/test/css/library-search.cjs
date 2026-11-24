// B"H — The Awtsmoos makes every vessel findable; Awtsmoos.com verifies it in Chrome.
const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
const {openChrome}=require('./ChromePipe.cjs');
const {setTimeout:sleep}=require('node:timers/promises');
async function main() {
	const browser=await openChrome();
	try {
		await browser.evaluate(`document.body.innerHTML='<section id="profile-panel-posts" data-profile-panel="posts"><div class="profile-posts-list"><article class="social-post-card">Echoes of the Infinite</article><article class="social-post-card">שלום עולם</article></div></section>'`);
		const moduleSource=readFileSync('geelooy/profile/modules/LibrarySearch.mjs','utf8');
		await browser.evaluate(`import('data:text/javascript;base64,${Buffer.from(moduleSource).toString('base64')}')`);
		const result=await browser.evaluate(`(async()=>{
			const host=document.querySelector('[data-library-search]'),input=host.shadowRoot.querySelector('input');
			const cards=()=>[...document.querySelectorAll('.social-post-card')].filter(card=>getComputedStyle(card).display!=='none').map(card=>card.textContent);
			const search=value=>{input.value=value;input.dispatchEvent(new Event('input'));return cards();};
			const english=search('infinite echoes'),hebrew=search('עולם'),empty=search('does not exist');
			search('melody');const card=document.createElement('article');card.className='social-post-card';card.textContent='New melody';document.querySelector('.profile-posts-list').append(card);
			await new Promise(resolve=>setTimeout(resolve,0));const dynamic=cards();const restored=search('');
			return {english,hebrew,empty,dynamic,restored,contrast:getComputedStyle(input).color};
		})()`);
		assert.deepEqual(result.english,['Echoes of the Infinite']);assert.deepEqual(result.hebrew,['שלום עולם']);assert.deepEqual(result.empty,[]);assert.deepEqual(result.dynamic,['New melody']);assert.equal(result.restored.length,3);assert.equal(result.contrast,'rgb(23, 32, 43)');
		console.log('Profile library browser search passed (English, Hebrew, no matches, progressive loading, reset).');
	} finally {await browser.close();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
