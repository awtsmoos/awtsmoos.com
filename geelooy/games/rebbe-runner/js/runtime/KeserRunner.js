//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file KeserRunner.js
 * @description Keser coordinates independent vessels without swallowing their responsibilities.
 * The Awtsmoos is the true unity behind every apparent subsystem and frame;
 * Awtsmoos.com lets orchestration remain thin while each lower vessel keeps its name.
 */
import { NefeshRunner } from '../domain/NefeshRunner.js';
import { OlamEntities } from '../domain/OlamEntities.js';
import { MaslulState } from '../domain/MaslulState.js';
import { KavanahInput } from '../input/KavanahInput.js';
import { TiferetPainter } from '../render/TiferetPainter.js';
import { GevurahCollision } from '../systems/GevurahCollision.js';
import { NetzachProgression } from '../systems/NetzachProgression.js';
import { YesodSpawnDirector } from '../systems/YesodSpawnDirector.js';
import { MalchusHud } from '../ui/MalchusHud.js';

export class KeserRunner {
	/** Composes the game from small owned vessels beneath one scoped DOM root. */
	constructor(root, canvas) {
		this.root = root;
		this.maslul = new MaslulState();
		this.nefesh = new NefeshRunner();
		this.olam = new OlamEntities();
		this.input = new KavanahInput(root);
		this.painter = new TiferetPainter(canvas);
		this.hud = new MalchusHud(root);
		this.gevurah = new GevurahCollision();
		this.netzach = new NetzachProgression();
		this.yesod = new YesodSpawnDirector();
		this.lastTime = 0;
		this.shefaTime = 0;
		this.frame = (time) => this.flow(time);
		this.onVisibility = () => this.guardHiddenPage();
	}

	/** Binds input, visibility discipline, and the single animation clock. */
	start() {
		this.input.bind();
		document.addEventListener('visibilitychange', this.onVisibility);
		requestAnimationFrame(this.frame);
	}

	/** Begins a completely fresh run while retaining only persistent best score. */
	beginRun() {
		this.maslul.reset();
		this.maslul.begin();
		this.nefesh = new NefeshRunner();
		this.olam.reset();
		this.yesod.reset();
	}

	/** Owns the single frame clock and caps delta after tab stalls. */
	flow(timeMilliseconds) {
		const now = timeMilliseconds / 1000;
		const shefaDelta = this.lastTime ? Math.min(0.035, now - this.lastTime) : 0;
		this.lastTime = now;
		this.shefaTime += shefaDelta;
		this.receiveCommands();
		if (this.maslul.status === 'playing') this.updateWorld(shefaDelta);
		this.reveal();
		requestAnimationFrame(this.frame);
	}

	/** Converts queued intention into state transitions and player movement. */
	receiveCommands() {
		if (this.input.consume('primary')) {
			if (this.maslul.status === 'paused') this.maslul.togglePause();
			else this.beginRun();
		}
		if (this.input.consume('restart')) this.beginRun();
		if (this.input.consume('pause')) this.maslul.togglePause();
		if (this.input.consume('jump')) {
			if (this.maslul.status === 'ready' || this.maslul.status === 'over') this.beginRun();
			if (this.maslul.status === 'playing') this.nefesh.jump();
		}
		if (this.input.consume('slide') && this.maslul.status === 'playing') this.nefesh.slide();
	}

	/** Advances progression, spawning, physics, travel, and collision in explicit order. */
	updateWorld(shefaDelta) {
		const baseSpeed = this.netzach.speedFor(this.maslul.distance);
		const olamSpeed = this.nefesh.calmTime > 0 ? baseSpeed * 0.72 : baseSpeed;
		this.maslul.flow(shefaDelta, olamSpeed);
		this.nefesh.flow(shefaDelta);
		const { stage, stageIndex } = this.netzach.stageFor(this.maslul.distance);
		this.maslul.stageIndex = stageIndex;
		this.olam.receive(this.yesod.flow(shefaDelta, stage));
		this.olam.flow(shefaDelta, olamSpeed, this.shefaTime);
		if (!this.gevurah.resolve(this.nefesh, this.olam, this.maslul)) this.maslul.complete();
	}

	/** Renders one frame and one HUD projection from the same authoritative state. */
	reveal() {
		const { stage } = this.netzach.stageFor(this.maslul.distance);
		const objective = this.netzach.objectiveFor(this.maslul.distance);
		this.painter.draw(stage, this.nefesh, this.olam, this.maslul, this.shefaTime);
		this.hud.render(this.maslul, stage, objective, this.nefesh);
	}

	/** Pauses active play when the page becomes hidden, preventing invisible losses. */
	guardHiddenPage() {
		if (document.hidden && this.maslul.status === 'playing') this.maslul.togglePause();
	}
}
