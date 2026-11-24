//B"H
/** The Awtsmoos brings every peak into measure without consuming the original mix. */
import { renderMultitrackProjectMix } from './multitrackExportRenderer.js';
import { encodeMultitrackWav } from './multitrackWavEncoder.js';
import { downloadMultitrackBlob } from './multitrackDownload.js';
import { multitrackProjectDuration } from './multitrackProject.js';
import { measureMasterStats } from './multitrackLoudness.js';
import { applyTruePeakLimiter } from './multitrackTruePeakLimiter.js';

/** Measures sample peak and unweighted RMS, not true peak or integrated LUFS. */
export function measureMix(buffer) {
	let peak=0,sum=0,count=0;
	for(let c=0;c<buffer.numberOfChannels;c++)for(const sample of buffer.getChannelData(c)) {
		if(!Number.isFinite(sample))throw Error('Invalid audio sample.');
		peak=Math.max(peak,Math.abs(sample));sum+=sample*sample;count++;
	}
	return {peak,rms:Math.sqrt(sum/Math.max(1,count))};
}

/** Applies a common gain to the rendered copy; never alters source clips. */
export function normalizeMasterPeak(buffer, ceilingDb=-1, maxBoostDb=12) {
	if(!Number.isFinite(ceilingDb)||ceilingDb>0||ceilingDb<-20)throw Error('Invalid master ceiling.');
	const before=measureMix(buffer);
	const ceiling=10**(ceilingDb/20);
	const gain=before.peak>0?Math.min(10**(maxBoostDb/20),ceiling/before.peak):1;
	for(let c=0;c<buffer.numberOfChannels;c++) {
		const data=buffer.getChannelData(c);
		for(let i=0;i<data.length;i++)data[i]*=gain;
	}
	return {before,after:measureMix(buffer),gain};
}

/** True-peak-limited master: oversampled estimate + lookahead limiter (estimator-based, not certified BS.1770). */
export async function exportTruePeakLimitedMix(state, ceilingDb = -1, bitsPerSample = 16) {
	const project = state.project;
	if (multitrackProjectDuration(project) > 480) throw Error('Master export supports up to eight minutes.');
	const buffer = await renderMultitrackProjectMix(project, { sampleRate: 44100, onProgress: message => state.setStatus(message) });
	state.setStatus('Limiting true peak (oversampled estimate)…');
	const report = applyTruePeakLimiter(buffer, { ceilingDb });
	const bytes = encodeMultitrackWav(buffer, { bitsPerSample });
	const filename = downloadMultitrackBlob(new Blob([bytes], { type: 'audio/wav' }), `${project.title} tp-limited`, 'wav');
	const fmt = v => Number.isFinite(v) ? v.toFixed(2) : '-inf';
	state.setStatus(`TP-limited WAV ready · ${filename} · true peak est. ${fmt(report.beforeTruePeakDb)} → ${fmt(report.afterTruePeakDb)} dBTP · max GR ${fmt(report.maxGainReductionDb)} dB`);
	return report;
}

/** Mastering is explicit and bounded; ordinary WAV export remains unchanged. */
export async function exportPeakNormalizedMix(state,ceilingDb=-1,bitsPerSample=16) {
	const project=state.project;
	if(multitrackProjectDuration(project)>480)throw Error('Master export supports up to eight minutes.');
	const buffer=await renderMultitrackProjectMix(project,{sampleRate:44100,onProgress:message=>state.setStatus(message)});
	state.setStatus('Measuring and adjusting master sample peak…');
	const report=normalizeMasterPeak(buffer,ceilingDb);
	const bytes=encodeMultitrackWav(buffer,{bitsPerSample});
	const filename=downloadMultitrackBlob(new Blob([bytes],{type:'audio/wav'}),`${project.title} mastered`,'wav');
	const peak=report.after.peak>0?(20*Math.log10(report.after.peak)).toFixed(2)+' dBFS':'silence';
	const stats = measureMasterStats(buffer);
	const fmt = (v) => Number.isFinite(v) ? v.toFixed(2) : '-inf';
	state.setStatus(`Master WAV ready · ${filename} · sample peak ${peak} · true peak est. ${fmt(stats.truePeakDb)} dBTP · integrated est. ${fmt(stats.integratedLufs)} LUFS`);
	return report;
}

export function bindMasteringControls(container,state) {
	const button=document.createElement('button');
	button.type='button';button.className='multitrack-tool';button.textContent='Master WAV (−1 dBFS)';
	button.title='Peak-normalized WAV; sample peak, not true-peak limiting or loudness normalization';
	let busy=false;
	function refresh(){button.disabled=busy||!state.project.tracks.some(track=>track.clips.length);}
	button.addEventListener('click',async()=>{
		if(busy)return;
		busy=true;refresh();
		try{await exportPeakNormalizedMix(state);}catch(error){state.setStatus(error.message||'Master export failed.');}
		finally{busy=false;refresh();}
	});
	const button24=document.createElement('button');
	button24.type='button';button24.className='multitrack-tool';button24.textContent='Master WAV 24-bit';
	button24.title='Peak-normalized 24-bit PCM WAV export';
	function refresh24(){button24.disabled=busy||!state.project.tracks.some(track=>track.clips.length||(track.midiRegions||[]).length);}
	button24.addEventListener('click',async()=>{
		if(busy)return;
		busy=true;refresh();refresh24();
		try{await exportPeakNormalizedMix(state,-1,24);}catch(error){state.setStatus(error.message||'Master export failed.');}
		finally{busy=false;refresh();refresh24();}
	});
	const buttonTp = document.createElement('button');
	buttonTp.type = 'button'; buttonTp.className = 'multitrack-tool'; buttonTp.textContent = 'Master WAV TP-limit (−1 dBTP)';
	buttonTp.title = 'True-peak limited WAV: oversampled inter-sample estimate with lookahead limiting (estimator-based)';
	function refreshTp() { buttonTp.disabled = busy || !state.project.tracks.some(track => track.clips.length || (track.midiRegions || []).length); }
	buttonTp.addEventListener('click', async () => {
		if (busy) return;
		busy = true; refresh(); refresh24(); refreshTp();
		try { await exportTruePeakLimitedMix(state); } catch (error) { state.setStatus(error.message || 'TP-limited export failed.'); }
		finally { busy = false; refresh(); refresh24(); refreshTp(); }
	});
	container.append(button, button24, buttonTp); state.subscribe(refresh); state.subscribe(refresh24); state.subscribe(refreshTp); refresh(); refresh24(); refreshTp();
}
