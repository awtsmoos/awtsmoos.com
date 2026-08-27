
// B"H
/**
 * @file pureConditionals.js
 * @chapter THE ANNIHILATION OF DOUBT
 * 
 * THE PSALM OF THE UNBENDING LAW:
 * To ask "if" is to question the path of the Light,
 * To branch into "else" is to fear the dark night.
 * But the Awtsmoos decrees with absolute force,
 * A dictionary maps the unchangeable course!
 * 
 * @module PureConditionals
 */

const _noop = () => null;

/**
 * @brief Executes logic based on a condition without using if/else or switch.
 * @param {any} condition - The expression to evaluate.
 * @param {Function} onTrue - Executed if condition is truthy.
 * @param {Function} [onFalse] - Executed if condition is falsy.
 * @returns {any} The result of the executed function.
 */
export const executeCondition = (condition, onTrue, onFalse) => {
    const ROUTER = {
        'true': onTrue || _noop,
        'false': onFalse || _noop
    };
    return ROUTER[String(Boolean(condition))]();
};
