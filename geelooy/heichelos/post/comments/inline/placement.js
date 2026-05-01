/**
 * B"H
 * @module InlinePlacementAggregator
 * @chapter Unity in Position
 */

import { distributeCommentsByCoordinates } from "./placement/Core.js";
export { createAndPlaceRootCommentHolder } from "./placement/RootPlacementFactory.js";

/**
 * @function addCommentsInline
 * @description The unified entry point for placing marginal insights.
 * Explicitly provided for the Hub to serve the Conductor.
 */
export const addCommentsInline = (comments, alias) => distributeCommentsByCoordinates(comments, alias);