
// B"H
/**
 * @file skinnedMaterial.js
 * @brief The orchestrator for skeletal manifestation, now purified of internal complexity.
 * 
 * THE POEM OF THE MENDED KAV:
 * We reach through the worlds, two levels on high,
 * To find the true math of the earth and the sky.
 * No longer we wander in directories of old,
 * The path is now straight, as the prophets foretold.
 * The Bone and the Uniform, each in its room,
 * Bringing the Golem to life from the gloom.
 */
import { Drawer } from '../renderer/utils/drawer.js';
import { BoneProcessor } from './skinned/boneProcessor.js';
import { UniformLinker } from './skinned/uniformLinker.js';

export class SkinnedMaterial {
    constructor(gl) {
        this.gl = gl;
        this.programInfo = null;
        this.drawer = new Drawer(gl);
    }

    /**
     * B"H - Initializes the program and the action-drawer.
     */
    setProgram(programInfo) {
        this.programInfo = programInfo;
        // B"H - Drawer is already initialized with gl
    }

    /**
     * B"H - Orchestrates the skinned draw call.
     */
    draw(obj, context) {
        const { renderer, currentTime } = context;

        // 1. Transform the Spirit (Skeleton) in Local Realm
        const bonePalette = BoneProcessor.process(
            obj.skeletonInstance, 
            renderer.animationManager, 
            obj.id, 
            currentTime
        );

        if (!bonePalette) return;

        // 2. Channelling the Intent (Uniforms)
        this.gl.useProgram(this.programInfo.program);
        UniformLinker.link(this.gl, this.programInfo, context, bonePalette);

        // 3. The Physical Manifestation (Action)
        this.drawer.draw(obj, this.programInfo.attribLocations);
    }
}
