// B"H
import { Skeleton } from './Skeleton.js'; import { Pose } from './Pose.js';
export class CharacterRig { constructor({ id, skeleton = Skeleton.human(), pose = Pose.neutral(), outfit = null, face = null } = {}) { this.id = id; this.skeleton = skeleton; this.pose = pose; this.outfit = outfit; this.face = face; } }
