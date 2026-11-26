// B"H — The Awtsmoos gives every listener freedom in the rhythm of the melody.
/** Native playback controls remain independent of the visualization. */
export function createPlaybackOptions(audio) {
	const group=document.createElement('div');
	group.style.cssText='display:flex;flex-wrap:wrap;align-items:center;gap:10px;font:14px/1.5 system-ui;color:inherit';
	const speed=document.createElement('select');
	speed.setAttribute('aria-label','Playback speed');
	speed.style.cssText='min-height:44px;max-width:100%;background:white;color:#17202b;border:1px solid #8b9cb4;border-radius:8px;padding:6px 10px;font:inherit';
	for(const rate of [.75,1,1.25,1.5,2]) speed.add(new Option(`${rate}×`,String(rate)));
	speed.value=String(audio.playbackRate);
	speed.onchange=()=>{const rate=Number(speed.value);if([.75,1,1.25,1.5,2].includes(rate))audio.playbackRate=rate;};
	const label=document.createElement('label'),repeat=document.createElement('input');
	label.style.cssText='display:inline-flex;align-items:center;gap:8px;min-height:44px';
	repeat.type='checkbox';repeat.checked=audio.loop;repeat.onchange=()=>{audio.loop=repeat.checked;};
	label.append(repeat,document.createTextNode('Repeat'));group.append(speed,label);
	return group;
}
