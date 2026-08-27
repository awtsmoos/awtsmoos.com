// B"H

import { evaluateWorkflowCondition } from "./condition.js";

function asSteps(value) {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
}

async function sleep(ms = 0) {
    if (!ms) return;
    await new Promise(resolve => setTimeout(resolve, ms));
}

async function runSequence(steps, ctx) {
    const results = [];
    for (const step of asSteps(steps)) results.push(await runStep(step, ctx));
    return { ok: results.every(item => item?.ok !== false), results };
}

/**
 * B"H
 * Executes one universal workflow node. Native function-call models and plain
 * text-only models both arrive here after parsing, so this is the equalizer:
 * one command can unfold into many commands, branch, retry, recover, and keep
 * a visible ledger of the Awtsmoos recreating state after each action.
 *
 * @param {object|Array} step Workflow node or list of nodes.
 * @param {object} ctx Execution context with tab, vars, known, last, item.
 * @returns {Promise<object>} Structured result.
 */
export async function runStep(step, ctx) {
    if (Array.isArray(step)) return runSequence(step, ctx);
    if (!step || typeof step !== "object") return { ok: true, skipped: true };

    if (step.if !== undefined) {
        return runSequence(evaluateWorkflowCondition(step.if, ctx) ? step.then : step.else, ctx);
    }

    if (step.foreach) {
        const items = Array.isArray(step.foreach.items) ? step.foreach.items : [];
        const results = [];
        for (const item of items) {
            ctx.item = item;
            results.push(await runStep(step.do, ctx));
        }
        return { ok: results.every(item => item?.ok !== false), results };
    }

    if (step.pipe || step.steps) {
        return runSequence(step.pipe || step.steps, ctx);
    }

    if (step.fallback) {
        let last = null;
        for (const branch of asSteps(step.fallback)) {
            last = await runStep(branch, ctx);
            if (last?.ok !== false) return last;
        }
        return last || { ok: false, error: "All fallbacks failed" };
    }

    const attempts = step.retry?.attempts || step.attempts || 1;
    let last = null;

    for (let i = 0; i < attempts; i += 1) {
        try {
            if (!step.tool) return { ok: true, skipped: true };
            const executeTool = ctx.executeTool;
            if (typeof executeTool !== "function") throw new Error("Workflow executor has no tool router injection.");
            const result = await executeTool(step.tool, step.args || {}, ctx.tab, ctx.onProgress);
            last = { ok: !String(result || "").startsWith("[B\"H Error]"), tool: step.tool, result };
            ctx.last = last;
            if (last.ok) return last;
        } catch (error) {
            last = { ok: false, tool: step.tool || null, error: error.message, stack: error.stack };
            ctx.last = last;
        }
        await sleep(step.retry?.delay_ms || 0);
    }

    if (last?.ok === false && step.onFailure) return runSequence(step.onFailure, ctx);
    return last || { ok: true, skipped: true };
}
