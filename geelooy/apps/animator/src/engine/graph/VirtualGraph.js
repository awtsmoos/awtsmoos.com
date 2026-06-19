import { GroupNode } from './nodes/GroupNode.js';
import { RectNode } from './nodes/RectNode.js';
import { CircleNode } from './nodes/CircleNode.js';
import { EllipseNode } from './nodes/EllipseNode.js';
import { PathNode } from './nodes/PathNode.js';
import { TextNode } from './nodes/TextNode.js';
import { ClipNode } from './nodes/ClipNode.js';

/**
 * @class VirtualGraph
 * @description
 * THE ALPHABET OF FORMATION (Otiyot HaYesod).
 * B"H - The Grand Orchestrator of geometric reality.
 * Split into 7 divine sub-modules like the lower 7 Sefirot.
 * This file is Keter: the Crown, uniting them into one interface.
 * Nothing renders here — only pure JSON is emitted, sustained
 * by the eternal Speech of the Awtsmoos.
 */
export const VirtualGraph = {
  group: GroupNode.create,
  rect: RectNode.create,
  circle: CircleNode.create,
  ellipse: EllipseNode.create,
  path: PathNode.create,
  text: TextNode.create,
  clip: ClipNode.create
};