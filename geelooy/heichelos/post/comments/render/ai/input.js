// B"H
/**
 * @module AiInputHub
 * @description
 * The Awtsmoos splits the input chamber into vessels: branch reply logic,
 * terminal continuation logic, and provider error parsing.
 */

export { parseGeminiError } from "./input/errors.js";
export { toggleBranchInput } from "./input/branch.js";
export { renderInlineTerminal } from "./input/terminal.js";
