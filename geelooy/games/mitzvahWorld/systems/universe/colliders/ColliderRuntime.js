// B"H
import { colliderInstallPackets } from "./ColliderInstallPacket.js";
import { colliderDebugManifest } from "./ColliderDebugManifest.js";
export class ColliderRuntime { constructor(colliders = []) { this.packets = colliderInstallPackets(colliders); } snapshot() { return { colliders:this.packets.length, mirrored:this.packets.filter(c => c.exactTransformMirror).length, debug:colliderDebugManifest(this.packets), packets:this.packets }; } }
export default ColliderRuntime;
