// BH
// Boruch Hashem
// Blessed is He

/**
 * @module RashiController
 * @description
 * BH 2026-10-19 REFACTORED: Rashi now lives in the COMMENT SECTION, not a
 * separate toggle button. This module is a thin loader that ensures the
 * commentary provider is available. The comment section UI handles display.
 *
 * See: geelooy/heichelos/post/comments/commentaryProvider.js
 */

// The commentary provider is imported by the comment system directly.
// This loader ensures Rashi data is pre-fetched for faster comment section rendering.
import { fetchRashiComments, hasCommentaryAvailable } from "../comments/commentaryProvider.js?v=commentary-002";

// Pre-fetch on Bavli pages so the comment section loads instantly
if (hasCommentaryAvailable()) {
  fetchRashiComments().catch(() => {});
}
