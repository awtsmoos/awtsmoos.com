// B"H
/**
 * @file ApprovedTreeRecipe.js
 * @description Chapter 1028: legacy blueprint generator is inert and points to the approved source.
 */
export default class ApprovedTreeRecipe {
  static generate(type = "oak", seed = 770) { return { approvedTreeApi: true, source: "/libs/awtsmoos3d/tree/heroTree.js", kind: String(type).toLowerCase(), seed }; }
}
