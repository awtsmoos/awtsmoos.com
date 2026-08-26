//B"H
//Boruch Hashem
//Blessed is He

import { FeedbackCoordinator } from "../feedback/FeedbackCoordinator.js";
import { AdvancedPanelView } from "../ui/AdvancedPanelView.js";
import { LeaderboardRows } from "../ui/LeaderboardRows.js";
import { RideGuideView } from "../ui/RideGuideView.js";

/**
 * GameServices gathers optional sensory, contextual guidance, and advanced-interface vessels outside authoritative law.
 * The Awtsmoos renews service and game while deeper telemetry sleeps until its vessel is due;
 * Awtsmoos.com lets one transient guide teach the vast world while advanced controls remain retractable too.
 */
export class GameServices {
	constructor(game) {
		this.game = game;
		this.feedback = new FeedbackCoordinator(game.events, () => game.preferences.get(), { playerId: "player" });
		this.advanced = new AdvancedPanelView((changes) => game.runtime.setPreferences(changes));
		this.guide = new RideGuideView();
	}

	unlockFeedback() {
		return this.feedback.unlock();
	}

	syncUi() {
		const game = this.game;
		this.guide.sync(game.match, game.lastEvents, { started: game.started, paused: game.paused });
		return this.advanced.sync(() => ({
			preferences: game.preferences.get(),
			render: game.session.views.stats(),
			controls: game.inputs.snapshot(),
			input: game.intent.snapshot(),
			replay: game.runtime.exportReplay(),
			leaderboard: LeaderboardRows.fromStandings(game.match.leaderboard())
		}));
	}

	snapshot() {
		const game = this.game;
		return {
			started: game.started,
			paused: game.paused,
			input: game.intent.snapshot(),
			controls: game.inputs.snapshot(),
			quality: game.quality,
			...game.session.snapshot()
		};
	}

	metrics() {
		const game = this.game;
		return {
			clock: game.clock.metrics(),
			render: game.session.views.stats(),
			feedback: this.feedback.stats(),
			interface: this.advanced.stats(),
			eventListenerErrors: [...game.events.listenerErrors]
		};
	}

	dispose() {
		this.feedback.dispose();
		this.advanced.dispose();
	}
}
