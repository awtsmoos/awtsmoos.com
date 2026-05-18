// B"H

import { operators, getPath } from "./operators.js";

export function evaluateCondition(condition = {}, ctx = {}) {
  if (!condition || typeof condition !== "object") {
    return true;
  }

  const left = condition.path
    ? getPath(ctx, condition.path)
    : condition.left;

  const right = condition.right;
  const operator = operators[condition.operator || "eq"];

  if (!operator) {
    return false;
  }

  try {
    return !!operator(left, right, ctx);
  } catch (_) {
    return false;
  }
}
