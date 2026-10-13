// B"H
// Boruch Hashem
// Blessed be He

/**
 * @file tutorial.js
 * @description First-run 5-second tutorial for Kabbalah Shooter.
 *
 * Teaches the three things a new player must know:
 *   1. What am I — the golden vessel; drag to move.
 *   2. What do I shoot — your light fires on its own; shatter the RED vessels.
 *   3. The goal — dodge red orbs, grab glowing letters, survive.
 *
 * Shown once (localStorage), skippable, never blocks dragging: only the card
 * and the Skip button capture pointer events. While active, game.tutorialGrace
 * keeps enemies from firing so the lesson is safe.
 */
const SEEN_KEY = 'kabbalahShooterTutorialSeen_v1';
const STEP_MS = 4500;
const GRACE_FRAMES = 300; // ~5s at 60fps

const STEPS = [
	{
		text: 'YOU are the golden vessel. DRAG anywhere to move.',
		arrow: 'player'
	},
	{
		text: 'Your light fires on its own. SHATTER the red vessels.',
		arrow: 'enemy'
	},
	{
		text: 'DODGE the red orbs. Grab glowing letters to grow stronger.',
		arrow: 'top',
		cta: 'Tap to play'
	}
];

export class TutorialController {
	constructor(documentObject) {
		this.doc = documentObject;
		this.game = null;
		this.overlay = documentObject.getElementById('tutorial-overlay');
		this.card = documentObject.getElementById('tutorial-card');
		this.text = documentObject.getElementById('tutorial-text');
		this.arrow = documentObject.getElementById('tutorial-arrow');
		this.skip = documentObject.getElementById('tutorial-skip');
		this.stepIndex = 0;
		this.active = false;
		this.timer = 0;

		if (this.card) this.card.addEventListener('click', () => this.advance());
		if (this.skip) this.skip.addEventListener('click', (e) => { e.stopPropagation(); this.finish(); });
	}

	get seen() {
		try { return !!localStorage.getItem(SEEN_KEY); } catch { return true; }
	}

	markSeen() {
		try { localStorage.setItem(SEEN_KEY, '1'); } catch { /* private mode */ }
	}

	/** Begin the tutorial on the first run. Returns true when shown. */
	start(game) {
		if (this.seen || !this.overlay || this.active || !game) return false;
		this.game = game;
		this.active = true;
		game.tutorialGrace = GRACE_FRAMES;
		this.showStep(0);
		return true;
	}

	showStep(index) {
		this.stepIndex = index;
		const step = STEPS[index];
		if (!step) { this.finish(); return; }
		if (this.text) this.text.innerHTML = this.highlight(step.text);
		this.placeArrow(step.arrow);
		if (this.overlay) this.overlay.style.display = 'block';
		if (this.card) {
			this.card.classList.remove('awt-tip-pop');
			void this.card.offsetWidth; // restart the pop animation
			this.card.classList.add('awt-tip-pop');
		}
		clearTimeout(this.timer);
		this.timer = setTimeout(() => this.advance(), STEP_MS);
	}

	/** Emphasize the load-bearing words. */
	highlight(text) {
		return text
			.replace('golden vessel', '<b class="awt-gold">golden vessel</b>')
			.replace('DRAG', '<b>DRAG</b>')
			.replace('fires on its own', '<b>fires on its own</b>')
			.replace('RED', '<b class="awt-red">RED</b>')
			.replace('red vessels', '<b class="awt-red">red vessels</b>')
			.replace('red orbs', '<b class="awt-red">red orbs</b>')
			.replace('glowing letters', '<b class="awt-gold">glowing letters</b>');
	}

	placeArrow(where) {
		if (!this.arrow) return;
		const game = this.game;
		let x = game.width / 2;
		let y = game.height * 0.3;
		let flip = false;
		if (where === 'player' && game.player) {
			x = game.player.pos.x;
			y = game.player.pos.y - 110;
		} else if (where === 'enemy') {
			const head = game.enemies.length && game.enemies[0].segments[0];
			if (head) { x = head.pos.x; y = head.pos.y - 90; }
		} else if (where === 'top') {
			x = game.width / 2;
			y = 90;
			flip = true;
		}
		x = Math.max(40, Math.min(game.width - 40, x));
		y = Math.max(70, y);
		this.arrow.style.left = x + 'px';
		this.arrow.style.top = y + 'px';
		this.arrow.classList.toggle('awt-flip', flip);
	}

	advance() {
		if (!this.active) return;
		if (this.stepIndex + 1 >= STEPS.length) this.finish();
		else this.showStep(this.stepIndex + 1);
	}

	finish() {
		if (!this.active) return;
		this.active = false;
		clearTimeout(this.timer);
		this.markSeen();
		if (this.overlay) this.overlay.style.display = 'none';
	}
}
