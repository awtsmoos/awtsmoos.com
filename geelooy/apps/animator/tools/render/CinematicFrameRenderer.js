// B"H
// Boruch Hashem
// Blessed is He
import { BitmapFont } from './BitmapFont.js';
import { CartoonCharacterPainter } from './CartoonCharacterPainter.js';
import { CinematicSetPainter } from './CinematicSetPainter.js';
import { PixelCanvas } from './PixelCanvas.js';
/**
 * Camera strategy, actors, text bubbles, and depth meet in one visible frame,
 * a cinematic vessel renewed at every instant by the Awtsmoos.
 */
export class CinematicFrameRenderer {
	constructor(plan) {
		this.plan = plan;
		this.width = plan.settings.width;
		this.height = plan.settings.height;
	}
	render(timeMs) {
		const canvas = new PixelCanvas(this.width, this.height);
		const shot = this.active(this.plan.shots, timeMs);
		const sequence = this.plan.sequences.find(item => item.id === shot.sequenceId);
		const dialogue = this.active(this.plan.dialogue, timeMs);
		CinematicSetPainter.background(canvas, sequence.id, timeMs);
		CinematicSetPainter.setDressing(canvas, sequence.id, timeMs);
		this.cast(canvas, shot, dialogue, timeMs);
		CinematicSetPainter.foreground(canvas, sequence.id);
		if (dialogue) this.bubble(canvas, dialogue);
		this.slate(canvas, sequence, shot, timeMs);
		return canvas.buffer;
	}
	active(items, timeMs) {
		return items.find(item => (
			timeMs >= item.start
			&& timeMs < item.start + item.duration
		)) || items[items.length - 1];
	}
	cast(canvas, shot, dialogue, timeMs) {
		const visible = this.plan.characters.filter(character => (
			shot.characters.includes(character.identityId)
		));
		if (!visible.length) return;
		const shotScale = this.shotScale(shot.camera.size);
		visible.forEach((character, index) => {
			const spacing = this.width / (visible.length + 1);
			const speaker = dialogue?.speakerId === character.identityId;
			CartoonCharacterPainter.paint(canvas, character, {
				x: spacing * (index + 1),
				y: 316,
				scale: shotScale / Math.max(1, visible.length * 0.28),
				timeMs,
				walk: ['seq_escape', 'seq_chase'].includes(shot.sequenceId) ? 1 : 0.08,
				phase: index * 1.7,
				view: this.viewForAngle(shot.camera.angle),
				emotion: this.emotion(shot.sequenceId, character.role),
				gaze: speaker ? [0, -0.1] : [index % 2 ? -0.4 : 0.4, 0],
				dialogue: speaker ? dialogue.text : '',
				dialogueDuration: dialogue?.duration || 1000,
				dialogueTime: speaker ? timeMs - dialogue.start : 0
			});
		});
	}
	shotScale(size) {
		return {
			closeUp: 1.55,
			reaction: 1.4,
			overShoulder: 1.2,
			twoShot: 1.15,
			insert: 0.8
		}[size] || 0.86;
	}
	viewForAngle(angle) {
		if (angle === 'side') return 'sideRight';
		if (angle === 'threeQuarter') return 'threeQuarterRight';
		return 'front';
	}
	emotion(sequenceId, role) {
		if (sequenceId === 'seq_escape') {
			return role === 'dryTalkingPet' ? 'annoyed' : 'shocked';
		}
		if (sequenceId === 'seq_chase') return 'concerned';
		if (sequenceId === 'seq_negotiation') {
			return role === 'wildToddler' ? 'laughing' : 'thinking';
		}
		if (sequenceId === 'seq_tag') return 'warm';
		return role === 'inventorParent' ? 'heroic' : 'curious';
	}
	bubble(canvas, dialogue) {
		canvas.rect(28, 22, 584, 58, '#111827');
		canvas.rect(34, 28, 572, 46, '#fffdf4');
		BitmapFont.draw(
			canvas,
			`${dialogue.speakerName}: ${dialogue.text}`,
			46,
			38,
			2,
			'#111827',
			540
		);
	}
	slate(canvas, sequence, shot, timeMs) {
		canvas.rect(12, 328, 260, 22, '#111827');
		BitmapFont.draw(
			canvas,
			`${sequence.name} / ${shot.camera.size}`,
			18,
			334,
			1,
			'#f8fafc'
		);
		const seconds = Math.floor(timeMs / 1000);
		const clock = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
		BitmapFont.draw(canvas, clock, 570, 338, 1, '#f8fafc');
	}
}
