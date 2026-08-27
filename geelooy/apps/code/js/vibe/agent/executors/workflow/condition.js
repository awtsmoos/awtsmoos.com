// B"H

/**
 * B"H
 * Pulls a nested value from the living workflow context. Like letters of
 * creation descending through worlds, each dot opens the next chamber until
 * the requested spark is found or the vessel ends.
 *
 * @param {object} source Context object.
 * @param {string} path Dot-separated path.
 * @returns {*} The discovered value, or undefined.
 */
export function getPath(source, path) {
    return String(path || "").split(".").filter(Boolean).reduce((acc, key) => acc?.[key], source);
}

const operators = {
    eq: (a, b) => a === b,
    ne: (a, b) => a !== b,
    gt: (a, b) => a > b,
    gte: (a, b) => a >= b,
    lt: (a, b) => a < b,
    lte: (a, b) => a <= b,
    truthy: a => !!a,
    falsy: a => !a,
    includes: (a, b) => Array.isArray(a) ? a.includes(b) : String(a || "").includes(String(b || "")),
    contains: (a, b) => operators.includes(a, b),
    matches: (a, b) => new RegExp(String(b || "")).test(String(a || ""))
};

/**
 * B"H
 * Evaluates declarative workflow conditions for all providers, even models
 * that only emit text. No hidden JavaScript eval is needed; the predicate is
 * data, and the Awtsmoos reveals truth through a small operator altar.
 *
 * @param {*} condition Boolean, object predicate, or map of expected known values.
 * @param {object} ctx Workflow context.
 * @returns {boolean} Whether the condition passes.
 */
export function evaluateWorkflowCondition(condition, ctx = {}) {
    if (condition === undefined || condition === null) return true;
    if (typeof condition === "boolean") return condition;
    if (Array.isArray(condition)) return condition.every(item => evaluateWorkflowCondition(item, ctx));
    if (typeof condition !== "object") return !!condition;

    if (condition.all) return condition.all.every(item => evaluateWorkflowCondition(item, ctx));
    if (condition.any) return condition.any.some(item => evaluateWorkflowCondition(item, ctx));
    if (condition.not) return !evaluateWorkflowCondition(condition.not, ctx);

    if (condition.path || condition.operator) {
        const left = condition.path ? getPath(ctx, condition.path) : condition.left;
        const op = operators[condition.operator || "eq"] || operators.eq;
        return !!op(left, condition.right, ctx);
    }

    return Object.entries(condition).every(([key, value]) => getPath(ctx, "known." + key) === value);
}
