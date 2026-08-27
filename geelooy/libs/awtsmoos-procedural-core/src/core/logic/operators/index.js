
// B"H
/**
 * @file index.js
 * @brief The Master Registry of Logical Operators.
 */
import { LOGIC_CORE_OPERATORS } from './core.js';
import { LOGIC_CONDITIONAL_OPERATORS } from './conditional.js';

export const LOGIC_OPERATOR_REGISTRY = {
    ...LOGIC_CORE_OPERATORS,
    ...LOGIC_CONDITIONAL_OPERATORS
};
