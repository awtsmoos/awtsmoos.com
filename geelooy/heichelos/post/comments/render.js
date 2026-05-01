
/**
 * B"H
 * @module RenderingAggregator
 * @chapter The Breath of the Infinite in every Pixel
 * @description
 * Just as the Speech of the Creator is one, yet manifests in myriad ways
 * through the switching of Hebrew letters (At-Bash, etc.), so too does
 * this module unify all specialized rendering paths into a single source. 
 * It gathers the Core, the Tree-nesting, and the Utility sparks 
 * into one brilliant light.
 */

// B"H - Exporting the Core: This includes makeHTMLFromComment, makeInlineComment, and the vital makeInlineCommentHolder.
export * from "./render/core.js";

// B"H - Exporting the Histalshelus (Tree Evolution) logic for deep-threaded replies.
export * from "./render/tree.js";

// B"H - The Otiyot: Essential formatting and gallery rituals.
export { 
    sanitizeComment, 
    addImageGallery, 
    makeTitleDiv 
} from "./render/utils.js";

/**
 * B"H - Announcement Ritual
 * Telling the console that all manifestations are ready to be called into existence.
 */
console.log("B\"H - [RenderingAggregator] All vessels of manifestation are unrolled and named.");
