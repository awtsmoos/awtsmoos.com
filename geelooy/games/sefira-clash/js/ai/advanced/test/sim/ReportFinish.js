//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the report finish vessel in this instant, revealing
 * its focused js ai advanced test sim service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { assertHealthyReport } from './ReportHealth.js';

/** B"H — the final seal gathers stage, stocks, and witnessed damage. */
export function finishReport(report, state, simMs) {
	report.simMs = simMs;
	report.framesPerSecond = Math.round(report.framesRun / Math.max(0.001, simMs / 1000));
	report.winner = state.winner || null;
	report.alive = activeFighters(state).length;
	report.damageEnd = Math.round(state.fighters.reduce((sum, f) => sum + (f.damage || 0), 0));
	report.damagePerMinute = Math.round(report.damageEnd / Math.max(1, report.framesRun / 3600));
	report.attackCommandsPerMinute = Math.round(
		report.attackCommands / Math.max(1, report.framesRun / 3600)
	);
	report.itemsSpawned = state.stageDirector?.itemsSpawned || 0;
	report.itemsPickedUp = state.stageDirector?.itemsPickedUp || 0;
	report.hazardsSpawned = state.stageDirector?.hazardsSpawned || 0;
	report.hazardHits = state.stageDirector?.hazardHits || 0;
	report.objectiveSpawns = state.stageDirector?.objectiveSpawns || 0;
	report.objectiveClaims = state.stageDirector?.objectiveClaims || 0;
	report.scarCount = state.scars?.length || 0;
	report.stageBornPowerups = (state.powerups || []).filter(p => p.stageBorn).length;
	report.stageMood = state.stageMood;
	report.storyBeats = state.story?.beats || 0;
	report.storyCallouts = state.story?.callouts || {};
	report.rivalryPairs = Object.keys(state.story?.rivalHits || {}).length;
	report.finalStocks = state.fighters.map(f => ({
		id: f.id,
		human: f.human,
		stocks: f.stocks,
		damage: Math.round(f.damage),
		dead: f.dead
	}));
	report.health = assertHealthyReport(report);
	delete report.lastStocks;
}

/**
 * Reveals the active fighters behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} state The state value entering this behavior.
 */
export function activeFighters(state) {
	return state.fighters.filter(f => !f.dead && !f.hidden && (f.stocks || 0) > 0);
}
