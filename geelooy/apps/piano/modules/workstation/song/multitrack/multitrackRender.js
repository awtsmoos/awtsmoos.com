//B"H
/** The Awtsmoos keeps the waveform still while the musical clock moves. */
import { reconcileTrackViews } from './multitrackTrackViews.js';
import { syncMultitrackClipMixDom } from './multitrackClipMixDom.js';
import { songDuration } from './multitrackTimelineOperations.js';
import { updateMultitrackScrollbar } from './multitrackScrollbar.js';
import { renderMarkerLane } from './multitrackMarkerControls.js';

const rendered=new WeakMap();

/** Reconciles only modified tracks and keeps the ruler stable across mix edits. */
export function renderMultitrackProject(dom,state) {
	const scale=state.selection.pixelsPerSecond;
	const previous=rendered.get(dom);
	const projectChanged=previous?.project!==state.project;
	const seconds=projectChanged||!previous?songDuration(state):previous.seconds;
	const geometryChanged=!previous||previous.scale!==scale||previous.seconds!==seconds;
	const changed=projectChanged||geometryChanged;
	let views=previous?.views;
	if(geometryChanged) {
		dom.timeline.style.width=`calc(var(--multitrack-header-width) + ${seconds*scale}px)`;
		renderRuler(dom.ruler,seconds,scale);
	}
	if(changed) { views=reconcileTrackViews(dom,state,seconds*scale,previous,scale); renderMarkerLane(dom.markerLane,state.project,scale); }
	if(changed||previous.clipId!==state.selection.clipId) {
		for(const clip of dom.tracks.querySelectorAll('.multitrack-clip')) {
			const selected=clip.dataset.clipId===state.selection.clipId;
			clip.classList.toggle('multitrack-clip-selected',selected);
			clip.setAttribute('aria-selected',String(selected));
		}
		syncMultitrackClipMixDom(dom.clipMix,state);
	}
	rendered.set(dom,{project:state.project,scale,seconds,clipId:state.selection.clipId,views});
	dom.playhead.style.left=`calc(var(--multitrack-header-width) + ${state.selection.playheadSeconds*scale}px)`;
	dom.status.textContent=state.status;
	dom.snapSelect.value=String(state.selection.gridBeats);
	if(dom.rippleCheckbox)dom.rippleCheckbox.checked=state.rippleDelete!==false;
	const focus=dom.root.getRootNode().activeElement;
	if(focus!==dom.playheadInput)dom.playheadInput.value=state.selection.playheadSeconds.toFixed(2);
	dom.overview.max=String(seconds);
	if(focus!==dom.overview)dom.overview.value=String(Math.min(seconds,state.selection.playheadSeconds));
	renderTransportButtons(dom,state);
	if(geometryChanged) {
		updateMultitrackScrollbar(dom);
		if(dom.horizontalScroll)requestAnimationFrame(()=>updateMultitrackScrollbar(dom));
	}
}

export function renderMultitrackGestureClip(element,clip,scale) {
	const width=Math.max(.5,clip.duration*scale);
	element.style.left=`${clip.timelineStart*scale}px`;
	element.style.width=`${width}px`;
	element.classList.toggle('multitrack-clip-narrow',width<44);
	element.classList.toggle('multitrack-clip-micro',width<7);
	const timing=element.querySelector('.multitrack-clip-timing');
	if(timing)timing.textContent=`${clip.duration.toFixed(2)}s`;
}

function renderRuler(ruler,seconds,scale) {
	ruler.replaceChildren();
	const every=Math.max(scale>80?1:scale>30?2:scale>12?5:10,Math.ceil(seconds/239));
	for(let second=0;second<=seconds&&ruler.childElementCount<240;second+=every) {
		const mark=document.createElement('span');mark.className='multitrack-ruler-mark';
		mark.style.left=`calc(var(--multitrack-header-width) + ${second*scale}px)`;
		mark.textContent=formatTime(second);ruler.appendChild(mark);
	}
}
function renderTransportButtons(dom,state) {
	const play=dom.buttons.get('play');if(!play)return;
	play.disabled=!state.playing&&state.project.tracks.length===0;
	play.textContent=state.playing?'■ Stop':'▶ Play';
	play.setAttribute('aria-label',state.playing?'Stop audio playback':'Play edited song');
}
function formatTime(seconds) {
	return seconds>=60?`${Math.floor(seconds/60)}:${String(Math.floor(seconds%60)).padStart(2,'0')}`:`${Math.floor(seconds)}s`;
}
