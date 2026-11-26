// B"H
// Boruch Hashem
// Blessed is He
/** The Awtsmoos gives sound a visible garment; Awtsmoos.com preserves the native player. */
import {draw} from './AudioEffectDrawing.mjs?v=media-002';
import {createPlaybackOptions} from './AudioPlaybackOptions.mjs?v=media-002';
export const modes=['off','waveform','spectrum','celestial'];
export function audioMode(value) {
	return modes.includes(value)?value:'off';
}
export function attachAudioEffects(container,audio,{initial='off',onChange=()=>{}}={}) {
	const panel=document.createElement('div'), select=document.createElement('select'), canvas=document.createElement('canvas'), note=document.createElement('small');
	panel.style.cssText='display:grid;gap:8px;margin:8px 0;max-width:100%';
	select.setAttribute('aria-label','Audio visual effects');
	select.style.cssText='min-height:44px;border:1px solid #8b9cb4;border-radius:10px;padding:8px;color:#17202b;background:#fff;max-width:100%';
	for(const [id,label] of [['off','Effects off'],['waveform','Live waveform'],['spectrum','Spectrum bars'],['celestial','Celestial rings']])select.add(new Option(label,id));
	canvas.width=640;canvas.height=240;canvas.style.cssText='width:100%;height:auto;border-radius:14px;background:#10182b';canvas.hidden=true;canvas.setAttribute('aria-hidden','true');
	note.style.cssText='font:12px system-ui;color:inherit';note.hidden=true;
	panel.append(createPlaybackOptions(audio),select,canvas,note);container.append(panel);
	let mode=audioMode(initial), ac,analyser,wave,spectrum,frame=0,disposed=false,observer,starting=false;
	const reduced=matchMedia('(prefers-reduced-motion: reduce)');
	const context=canvas.getContext('2d');
	function stop() {
		cancelAnimationFrame(frame);frame=0;
	}
	function active() {
		return !disposed && panel.isConnected && !audio.paused && mode!=='off' && !document.hidden && !reduced.matches;
	}
	function tick() {
		frame=0;
		if(!active())return;
		analyser.getFloatTimeDomainData(wave);analyser.getByteFrequencyData(spectrum);
		draw(context,canvas,wave,spectrum,mode);frame=requestAnimationFrame(tick);
	}
	function notice(message) {
		canvas.hidden=true;note.textContent=message;note.hidden=false;
	}
	async function start() {
		stop();canvas.hidden=mode==='off' || reduced.matches;note.hidden=true;
		if(!active() || starting)return;
		starting=true;
		try {
			const url=new URL(audio.currentSrc || audio.src,location.origin);
			if(url.origin!==location.origin)throw Error('Live graphics unavailable for external audio. Playback is unchanged.');
			if(!context)throw Error('Graphics unavailable in this browser.');
			if(!ac) {
				const AudioContext=window.AudioContext || window.webkitAudioContext;
				if(!AudioContext)throw Error('Live graphics are not supported by this browser.');
				ac=new AudioContext();analyser=ac.createAnalyser();analyser.fftSize=1024;
				analyser.connect(ac.destination);
				wave=new Float32Array(analyser.fftSize);spectrum=new Uint8Array(analyser.frequencyBinCount);
				await ac.resume();
				if(disposed)return;
				ac.createMediaElementSource(audio).connect(analyser);
			} else await ac.resume();
			if(active()&&!frame)tick();
		} catch(error) {if(!disposed)notice(error.message);}
		finally {starting=false;}
	}
	function dispose() {
		if(disposed)return;
		disposed=true;stop();observer?.disconnect();
		audio.removeEventListener('play',start);audio.removeEventListener('pause',stop);audio.removeEventListener('ended',stop);
		document.removeEventListener('visibilitychange',start);reduced.removeEventListener('change',start);
		// Callers dispose only when retiring the player, never while toggling effects.
		ac?.close().catch(()=>{});
	}
	select.value=mode;select.onchange=()=>{mode=audioMode(select.value);onChange(mode);void start();};
	audio.addEventListener('play',start);audio.addEventListener('pause',stop);audio.addEventListener('ended',stop);
	document.addEventListener('visibilitychange',start);reduced.addEventListener('change',start);
	observer=new MutationObserver(()=>{if(!panel.isConnected)dispose();});observer.observe(container.getRootNode(),{childList:true,subtree:true});
	void start();return {dispose};
}
