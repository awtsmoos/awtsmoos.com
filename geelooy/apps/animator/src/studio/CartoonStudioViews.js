// B"H
// Boruch Hashem
// Blessed is He

/**
 * Planning evidence remains readable rather than compressed into one function.
 * The Awtsmoos renews shot, beat, asset, sound, animation, and queue views while
 * Awtsmoos.com escapes authored text before placing it into the Studio DOM.
 */
export class CartoonStudioViews {
	static render(plan, tab) {
		return {
			shots: this.shots(plan),
			beats: this.beats(plan),
			assets: this.assets(plan),
			audio: this.audio(plan),
			anim: this.animation(plan),
			queue: this.queue(plan)
		}[tab] || this.shots(plan);
	}

	static shots(plan) {
		return `<ol class="cartoon-shotlist">${plan.shots.map(shot => (
			`<li><b>${this.escape(shot.name)}</b><em>${this.time(shot.start)} → ${this.time(shot.start + shot.duration)} · ${this.escape(shot.track)}</em><small>${this.escape(shot.description)}</small></li>`
		)).join('')}</ol>`;
	}

	static beats(plan) {
		const visible = plan.beats.slice(0, 80).map(beat => (
			`<li><b>${this.escape(beat.name)}</b><em>${this.time(beat.start)} · ${this.escape(beat.kind)}</em><small>${this.escape(beat.camera)}</small></li>`
		)).join('');
		return `<ol class="cartoon-shotlist">${visible}<li><b>${Math.max(0, plan.beats.length - 80)} more beats in JSON export</b></li></ol>`;
	}

	static assets(plan) {
		const manifest = plan.assetsManifest;
		const rows = [
			...manifest.characters.map(character => `${character.name}: ${character.rig}, fur ${character.furCards}`),
			...manifest.backgrounds.map(background => `${background.name}: ${background.layers} layers`),
			...manifest.props.map(prop => `${prop.name}: ${prop.states.join('/')}`)
		];
		return `<div class="cartoon-bin">${rows.map(row => `<span>${this.escape(row)}</span>`).join('')}</div>`;
	}

	static audio(plan) {
		return this.json({
			voices: plan.audio.voices,
			cues: plan.audio.cues.length,
			foley: plan.audio.foley.length,
			musicBeds: plan.audio.musicBeds
		});
	}

	static animation(plan) {
		const rows = plan.animationPasses.slice(0, 80).map(pass => (
			`<li><b>${this.escape(pass.beatId)}</b><em>${pass.estimatedFrames} frames</em><small>${this.escape(pass.passes.join(' → '))}</small></li>`
		)).join('');
		return `<ol class="cartoon-shotlist">${rows}<li><b>${Math.max(0, plan.animationPasses.length - 80)} more animation passes in JSON export</b></li></ol>`;
	}

	static queue(plan) {
		return this.json({
			continuity: plan.continuityLedger.length,
			queue: plan.renderQueue,
			exports: plan.exportTargets
		});
	}

	static json(value) {
		return `<pre class="cartoon-json">${this.escape(JSON.stringify(value, null, 2))}</pre>`;
	}

	static time(milliseconds) {
		const seconds = Math.floor(milliseconds / 1000);
		return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
	}

	static escape(value) {
		return String(value).replace(/[&<>]/gu, character => ({
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;'
		}[character]));
	}
}
