// B"H — Awtsmoos.com preserves the audible melody beneath every visible garment.
const assert=require('node:assert/strict');
const {resolve}=require('node:path');
const {openChrome}=require('./ChromePipe.cjs');
/** Exercise real native media element properties in a local browser. */
async function main() {
	const {startFixtureServer}=await import('../../../games/city-of-light/tests/BrowserHarnessServer.mjs');
	const fixture=await startFixtureServer({directory:resolve('geelooy'),port:44023});
	let browser;
	try {
		browser=await openChrome();
		const {call,evaluate}=browser;
		await call('Page.enable');
		await call('Network.setBlockedURLs',{urls:['https://*']});
		await call('Page.navigate',{url:fixture.origin+'/shared/social/media/'});
		const result=await evaluate(`(async()=>{
			const {attachAudioEffects}=await import('/shared/social/media/AudioEffects.mjs');
			const parent=document.createElement('div'),audio=document.createElement('audio');
			audio.controls=true;parent.append(audio);document.body.replaceChildren(parent);
			let mode='';const effect=attachAudioEffects(parent,audio,{onChange:value=>mode=value});
			const speed=parent.querySelector('[aria-label="Playback speed"]'),repeat=parent.querySelector('input[type=checkbox]'),preset=parent.querySelector('[aria-label="Audio visual effects"]');
			speed.value='1.5';speed.dispatchEvent(new Event('change'));repeat.checked=true;repeat.dispatchEvent(new Event('change'));
			preset.value='celestial';preset.dispatchEvent(new Event('change'));
			const selected={rate:audio.playbackRate,loop:audio.loop,mode,controls:audio.controls};
			preset.value='off';preset.dispatchEvent(new Event('change'));
			const off=parent.querySelector('canvas').hidden;
			effect.dispose();effect.dispose();return {selected,off,finalMode:mode};
		})()`);
		assert.deepEqual(result.selected,{rate:1.5,loop:true,mode:'celestial',controls:true});
		assert.equal(result.off,true);assert.equal(result.finalMode,'off');
		console.log('Audio controls browser check passed: speed, repeat, preset, off, native controls and disposal.');
	} finally {await browser?.close();fixture.server.kill('SIGTERM');}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
