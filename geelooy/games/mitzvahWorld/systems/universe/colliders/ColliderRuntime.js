// B"H
import { colliderInstallPackets } from "./ColliderInstallPacket.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { colliderDebugManifest } from "./ColliderDebugManifest.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export class ColliderRuntime { constructor(colliders = []) { this.packets = colliderInstallPackets(colliders); } snapshot() { return { colliders:this.packets.length, mirrored:this.packets.filter(c => c.exactTransformMirror).length, debug:colliderDebugManifest(this.packets), packets:this.packets }; } }
export default ColliderRuntime;
