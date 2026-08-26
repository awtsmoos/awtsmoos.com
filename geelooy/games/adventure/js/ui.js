// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos gives hidden state a readable face while Awtsmoos.com keeps HUD truth distinct from the painted chamber;
 * this projection lets objective, score, danger, pause, loss, and victory speak without invading the mechanics beneath.
 */
export class AdventureUi {
	constructor(documentRoot = document) {
		this.stage = documentRoot.getElementById('hudStage');
		this.sparks = documentRoot.getElementById('hudSparks');
		this.key = documentRoot.getElementById('hudKey');
		this.lives = documentRoot.getElementById('hudLives');
		this.score = documentRoot.getElementById('hudScore');
		this.objective = documentRoot.getElementById('hudObjective');
		this.pauseButton = documentRoot.getElementById('pauseButton');
		this.overlay = documentRoot.getElementById('gameOverlay');
		this.overlayKicker = documentRoot.getElementById('overlayKicker');
		this.overlayTitle = documentRoot.getElementById('overlayTitle');
		this.overlayText = documentRoot.getElementById('overlayText');
	}

	/** Project one immutable-looking world state into semantic DOM surfaces. */
	render(world) {
		this.setText(this.stage, `${world.stageIndex + 1}/${world.levels.length} · ${world.stageName}`);
		this.setText(this.sparks, `${world.sparkGoal - world.sparks.length}/${world.sparkGoal}`);
		this.setText(this.key, world.keyCollected ? 'Awake' : world.sparks.length ? 'Sleeping' : 'Ready');
		this.setText(this.lives, '◆'.repeat(Math.max(0, world.lives)) || 'None');
		this.setText(this.score, String(world.score));
		this.setText(this.objective, world.message);
		if (this.pauseButton) {
			this.pauseButton.textContent = world.status === 'paused' ? 'Resume' : 'Pause';
			this.pauseButton.setAttribute('aria-pressed', String(world.status === 'paused'));
		}
		this.renderOverlay(world);
	}

	renderOverlay(world) {
		const visible = ['paused', 'victory', 'gameOver'].includes(world.status);
		if (!this.overlay) return;
		this.overlay.hidden = !visible;
		if (!visible) return;

		const content = this.overlayContent(world);
		this.setText(this.overlayKicker, content.kicker);
		this.setText(this.overlayTitle, content.title);
		this.setText(this.overlayText, content.text);
		this.overlay.dataset.state = world.status;
	}

	overlayContent(world) {
		if (world.status === 'victory') {
			return { kicker: 'Three chambers complete', title: 'Light returned', text: `Final score · ${world.score}` };
		}
		if (world.status === 'gameOver') {
			return { kicker: 'Run ended', title: 'Begin again', text: `Score · ${world.score}` };
		}
		return { kicker: world.stageName, title: 'Chamber paused', text: 'Resume when the path is clear.' };
	}

	setText(node, value) {
		if (node) node.textContent = value;
	}
}
