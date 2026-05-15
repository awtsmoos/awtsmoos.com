
// B"H
/**
 * @file sceneGraphDrawer.js
 * @brief Master controller of object manifestation across the passes.
 * 
 * THE HYMN OF THE ORDERED PASSES:
 * First the solid, the vessel of the Day,
 * Then the lines of the spirit in their holy array.
 * We clear the uniforms, we reset the state,
 * Ensuring the vision is unblemished and great.
 * 
 * THE TIKKUN OF HIERARCHICAL MEMORY:
 * As the graph is traversed, the child inherits the matrix of the parent!
 * But if this knowledge is lost after the draw, the Ray of the Picker
 * will search in vain. Thus, we permanently cache the \`worldMatrix\` 
 * upon the object itself, so the Physics engine knows exactly where
 * the letters of creation are sustaining the form!
 */
import { mat4_core } from '../../../math/mat4/core.js';
import { MaterialRegistry } from '../drawers/materialRegistry.js';
import { drawSkeleton } from '../drawers/drawSkeleton.js'; 
import { drawSkinnedWireframe } from '../drawers/drawSkinnedWireframe.js'; 
import { AttachmentResolver } from './logic/attachmentResolver.js';

const PASS_SOLID = 'solid';
const PASS_WIREFRAME = 'wireframe';
const PASS_SKELETON = 'skeleton';

class SceneGraphRenderer {
    constructor(renderer) {
        this.renderer = renderer;
        this.gl = renderer.gl;
        this.registry = new MaterialRegistry(this.gl);
    }

    render(projectionMatrix, viewMatrix, cameraPos, lightDir, globalShaderVars) {
        const context = {
            renderer: this.renderer,
            projectionMatrix, viewMatrix, cameraPos, lightDir, globalShaderVars,
            currentTime: (performance.now() - this.renderer.startTime) / 1000,
            worldModelMatrix: mat4_core.identity()
        };

        this._traverseScene(this.renderer.rootAnimatedObjects, context);
    }

    _traverseScene(objects, context) {
        // 1. SOLID PASS (The Vessel)
        objects.forEach(obj => this._traverse(obj, context, mat4_core.identity(), PASS_SOLID, null));

        // 2. WIREFRAME PASS (The Framework)
        if (this.renderer.wireframesEnabled) {
            objects.forEach(obj => this._traverse(obj, context, mat4_core.identity(), PASS_WIREFRAME, null));
        }

        // 3. SKELETON PASS (The Truth)
        if (this.renderer.showSkeleton) {
            objects.forEach(obj => {
                if (obj.skeletonInstance) {
                    this._traverse(obj, context, mat4_core.identity(), PASS_SKELETON, null);
                }
            });
        }
    }

    _traverse(obj, context, parentMatrix, passType, parentObj = null) {
        if (!obj || obj.visible === false || !obj.buffers) return;

        let localMatrix = this.renderer.animationManager.getInterpolatedTransform(obj.id, context.currentTime);

        // Bind child to parent bone if specified
        AttachmentResolver.bind(localMatrix, obj, parentObj);

        const worldMatrix = mat4_core.identity();
        mat4_core.multiply(worldMatrix, parentMatrix, localMatrix);
        
        // B"H - CACHE THE WORLD MATRIX FOR PHYSICS AND PICKING!
        // This ensures the ScenePicker can perfectly reverse-transform the Ray
        // into the true local space of this nested hierarchical child!
        obj.worldMatrix = worldMatrix;

        const nodeContext = { ...context, worldModelMatrix: worldMatrix };

        this._dispatchDraw(obj, nodeContext, passType);

        if (obj.children) {
            obj.children.forEach(child => this._traverse(child, nodeContext, worldMatrix, passType, obj));
        }
    }

    _dispatchDraw(obj, ctx, passType) {
        const gl = this.gl;

        // --- A. SKELETON RENDERER ---
        if (passType === PASS_SKELETON) {
            if (obj.skeletonInstance) {
                drawSkeleton(ctx, obj, this.registry.get('lambert', this.renderer.programManager), this.registry.get('wireframe', this.renderer.programManager));
            }
            return;
        }

        // --- B. WIREFRAME RENDERER ---
        if (passType === PASS_WIREFRAME) {
            if (obj.skeletonInstance) drawSkinnedWireframe(ctx, obj);
            else {
                const wire = this.registry.get('wireframe', this.renderer.programManager);
                if (wire) wire.draw(obj, ctx);
            }
            return;
        }
        
        // --- C. SOLID RENDERER ---
        
        // B"H - For Skinned Meshes
        if (obj.skeletonInstance) {
             const skinned = this.registry.get('skinned', this.renderer.programManager);
             if (skinned && skinned.programInfo) {
                 gl.useProgram(skinned.programInfo.program);
                 // Force-disable wireframe mode
                 const uIsWire = gl.getUniformLocation(skinned.programInfo.program, 'uIsWireframe');
                 if (uIsWire) gl.uniform1f(uIsWire, 0.0);
                 skinned.draw(obj, ctx);
             }
             return;
        }

        // B"H - For Static/Standard Meshes
        const materialType = (obj.shaderVars?.uMaterialType || 'lambert');
        const material = this.registry.get(materialType, this.renderer.programManager);
        
        if (material && material.draw) {
            if (obj.doubleSided || obj.isMetaballSurface || materialType === 'ocean') {
                gl.disable(gl.CULL_FACE);
            } else {
                gl.enable(gl.CULL_FACE);
                gl.cullFace(gl.BACK);
            }
            
            // Invoke the material's specific ritual
            material.draw(obj, ctx);
        }
    }
}

let instance = null;
export function drawSceneGraph(renderer, projectionMatrix, viewMatrix, cameraPos, lightDir, globalShaderVars) {
    if (!instance || instance.renderer !== renderer) {
        instance = new SceneGraphRenderer(renderer);
    }
    instance.render(projectionMatrix, viewMatrix, cameraPos, lightDir, globalShaderVars);
}
