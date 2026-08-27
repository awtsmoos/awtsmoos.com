// B"H
/**
 * @file SelfHealLoop.js
 * @brief Launches, observes, scores, and reports the next smallest repair.
 */
import { GoalEntity } from './GoalEntity.js';
import { GoalStore } from './GoalStore.js';
import { RuntimeSnapshot } from './RuntimeSnapshot.js';
import { RealityScore } from './RealityScore.js';

/**
 * Runs a bounded preview stabilization loop.
 */
export class SelfHealLoop {
    /**
     * @param {object} deps Runtime dependencies.
     * @param {object} deps.previewManager PreviewRuntimeManager-like object.
     */
    constructor(deps = {}) {
        this.previewManager = deps.previewManager;
    }

    /**
     * Executes an inspect-launch-score loop without pretending to patch blindly.
     *
     * @param {object} ctx Execution context.
     * @param {object} ctx.ws Workspace descriptor.
     * @param {string} ctx.coreType Provider type.
     * @param {string} ctx.projectRoot Resolved project root.
     * @param {object} ctx.project Static project inspection.
     * @param {object} ctx.normalized Normalized tool arguments.
     * @param {string|number} [ctx.tabId] Tab id.
     * @returns {Promise<object>} Goal, snapshot, score, and handoff data.
     */
    async run(ctx = {}) {
        const goal = new GoalEntity({
            goal: ctx.normalized?.goal || 'stabilize runtime preview',
            target: ctx.normalized?.target || '/',
            options: ctx.normalized?.options || {}
        });

        goal.phase('inspect_runtime', { status: 'started', projectRoot: ctx.projectRoot });
        const manifest = await this.previewManager.inspect(ctx.ws, ctx.coreType, ctx.projectRoot);
        goal.phase('inspect_runtime', { status: 'finished', manifest });

        goal.phase('launch_preview', { status: 'started' });
        const preview = await this.previewManager.launch(
            ctx.ws,
            ctx.coreType,
            { project_path: ctx.projectRoot, manifest: ctx.normalized?.args?.manifest || {} },
            ctx.tabId
        );
        goal.preview(preview).phase('launch_preview', { status: preview.status || 'observed', previewId: preview.id });

        const logs = this.previewManager.logs(preview.id);
        const snapshot = RuntimeSnapshot.capture({ project: ctx.project, importVerification: ctx.importVerification, manifest: preview.manifest || manifest, preview, logs });
        goal.snapshot(snapshot);

        const score = RealityScore.compute(snapshot, ctx.normalized?.options || {});
        goal.verify(score);

        if (!score.ok) {
            goal.repair({
                kind: 'next-smallest-repair',
                reason: score.summary,
                recommendedActions: this.recommend(score, snapshot)
            });
        }

        const storedGoal = GoalStore.save(goal.toJSON());

        return {
            ok: score.ok,
            goal: storedGoal,
            snapshot,
            realityScore: score,
            liveUrl: snapshot.preview?.publicUrl || snapshot.preview?.url || null,
            osMount: {
                kind: 'virtual-os-browser-target',
                url: snapshot.preview?.publicUrl || snapshot.preview?.url || null,
                title: goal.goal || 'Generated App'
            }
        };
    }

    /**
     * Produces concrete next actions from failed gates.
     *
     * @param {object} score Reality score.
     * @param {object} snapshot Runtime snapshot.
     * @returns {Array<object>} Repair recommendations.
     */
    recommend(score, snapshot) {
        const actions = [];
        if (score.failed.includes('runnableEntry')) {
            actions.push({ tool: 'inspect_runtime', fix: 'create or select index.html/package.json/server.js entry' });
        }
        if (score.failed.includes('previewUrl')) {
            actions.push({ tool: 'launch_preview', fix: 'repair runtime manifest or static preview builder output' });
        }
        if (score.failed.includes('importAssetsOk')) {
            actions.push({ tool: 'semantic_search', fix: 'inspect suspicious imports/assets before preview handoff', risks: snapshot.importVerification?.risks || [] });
        }
        if (score.failed.includes('noRuntimeErrors')) {
            actions.push({ tool: 'semantic_search', fix: 'trace first runtime error back to imports/assets/state', errors: snapshot.health?.errors || [] });
        }
        return actions;
    }
}
