// B"H
const { treasuryBudgets } = require("./treasury/budgets.js");

/**
 * B"H
 * Root budget route alias.
 * Some forms, tests, and future clients may ask for `/budgets` while the product
 * cockpit lives at `/treasury/budgets`; both must reach the same guarded vessel.
 */
async function budgets($i) {
  return treasuryBudgets($i);
}
module.exports = { budgets };
