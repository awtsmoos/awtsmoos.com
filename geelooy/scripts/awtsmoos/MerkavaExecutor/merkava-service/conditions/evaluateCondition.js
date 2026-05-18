// B"H
const { operators, getPath } = require("./operators.js");

/**
 * B"H
 * Evaluates a safe JSON expression without eval.
 *
 * @param {*} expr Declarative expression.
 * @param {object} ctx Runtime context.
 * @returns {*} Evaluated value.
 */
function evaluateCondition(expr, ctx = {}) {
  if (expr == null || typeof expr !== "object" || Array.isArray(expr)) return expr;
  if (Object.prototype.hasOwnProperty.call(expr, "literal")) return expr.literal;
  if (Object.prototype.hasOwnProperty.call(expr, "var")) return getPath(ctx, expr.var);

  const entries = Object.entries(expr);
  if (entries.length !== 1) return expr;

  const [op, rawArgs] = entries[0];
  const args = Array.isArray(rawArgs) ? rawArgs : [rawArgs];
  if (op === "has" && args.length === 1) return getPath(ctx, args[0]) !== undefined;

  if (!operators[op]) {
    throw new Error("Unsupported Merkava condition operator: " + op);
  }

  return operators[op](...args.map(item => evaluateCondition(item, ctx)));
}

module.exports = { evaluateCondition };
