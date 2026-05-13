
//B"H
import * as THREE from '/games/scripts/build/three.module.js';
import Heeooleey from '../chayim/heeooleey.js';
import MinimapIcons from './minimap/MinimapIcons.js';

const arrayToObject = ([x, y, z]) => ({ x, y, z });

export default class MinimapPostprocessing extends Heeooleey {
    constructor({renderer, scene, camera, olam}) {
        super();
        this.olam = olam;
        this.renderer = renderer;
        this.scene = scene;

        this.size = new THREE.Vector2(300, 300);
        this.captured = false;
        this.itemSize = 25;
        this.maxRendererSize = 2345;
        this.prevCamPos = new THREE.Vector2();
        this.needsPositionUpdate = null;
        this.minimapCamera = null;
        this.sceneBoundingBox = null;
        this._zoom = 6;
        
        // B"H: Temporal governor
        this._lastScrollSync = 0;
        
        this.iconManager = new MinimapIcons(this);

        this.on("update minimap camera", async ({position, rotation, targetPosition}) => {
            if (!this.minimapCamera) {
                this.render();
            }
            if (!this.minimapCamera) return;

            this.playerPosition = position;
            if (position) {
                if(position.equals(this.prevCamPos)) return;
                this.needsPositionUpdate = { position, targetPosition };
                this.prevCamPos = position;
            }

            if(!this.captured) {
                await this.captureScene();
                this.captured = true;
            }

            if(this.captured) {
                if(this.minimapCamera) await this.updateScroll();
                return false;
            }
        });
    }

    get zoom() { return this._zoom; }
    set zoom(zoomLevel) {
        if(zoomLevel < 1) return;
        this._zoom = zoomLevel;
        if(this.minimapCamera) this.captureScene();
    }
    
    // Delegate item methods to manager
    async setMinimapItems(items, category) { return this.iconManager.setMinimapItems(items, category); }
    async setMinimapItem(item, category) { return this.iconManager.setMinimapItem(item, category); }
    async removeMinimapItem(item, category) { return this.iconManager.removeMinimapItem(item, category); }
    async updateItemPositions(category) { return this.iconManager.updateItemPositions(category); }

    async updateScroll() {
        if(!this.playerPosition || !this.minimapCamera) return;
        
        // B"H: We limit the intense payload to 10 frames a second.
        const now = Date.now();
        if (now - this._lastScrollSync < 100) return;
        this._lastScrollSync = now;

        await this.olam.ayshPeula("update minimap scroll", {
            center: this.playerPosition,
            minimapCamera: this.serializeOrthographicCamera(this.minimapCamera),
            sceneBoundingBox: this.sceneBoundingBox
        });
    }

    serializeOrthographicCamera(camera) {
        const euler = new THREE.Euler().setFromQuaternion(camera.quaternion);
        return {
            position: arrayToObject(camera.position.toArray()),
            rotation: arrayToObject(euler.toArray()),
            left: camera.left, right: camera.right, top: camera.top, bottom: camera.bottom,
            near: camera.near, far: camera.far
        };
    }

    async captureScene() {
        if(!this.playerPosition) return;
        
        // Reset camera position to player position
        this.minimapCamera.position.copy(this.playerPosition);
  
        if(!this.sceneBoundingBox) {
            this.sceneBoundingBox = new THREE.Box3().setFromObject(this.scene);
            this.sceneSize = new THREE.Vector3();
            this.sceneBoundingBox.getSize(this.sceneSize);
        }
        
        const aspectRatio = this.sceneSize.x / this.sceneSize.y;
        const desiredRendererSize = new THREE.Vector2();
    
        if (aspectRatio >= 1) {
            desiredRendererSize.x = this.maxRendererSize;
            desiredRendererSize.y = this.maxRendererSize / aspectRatio;
        } else {
            desiredRendererSize.y = this.maxRendererSize;
            desiredRendererSize.x = this.maxRendererSize * aspectRatio;
        }
    
        if(!desiredRendererSize.equals(this.size)) {
            this.renderer.setSize(desiredRendererSize.x, desiredRendererSize.y, false);
            this.renderer.getSize(this.size);
            this.olam.htmlAction({
                shaym: "raw map",
                properties: { style: { width: desiredRendererSize.x+"px", height: desiredRendererSize.y+"px" } }
            });
        }
        
        const maxSceneDimension = Math.max(this.sceneSize.x, this.sceneSize.y, this.sceneSize.z);
        const zoomFactor = Math.pow(2, this.zoom);
        
        this.minimapCamera.position.y += maxSceneDimension / zoomFactor;
        this.minimapCamera.far = this.minimapCamera.position.y * 2;
        
        const halfHeight = maxSceneDimension / zoomFactor;
        const halfWidth = halfHeight * aspectRatio;
    
        this.minimapCamera.left = -halfWidth;
        this.minimapCamera.right = halfWidth;
        this.minimapCamera.top = halfHeight;
        this.minimapCamera.bottom = -halfHeight;
        this.minimapCamera.aspect = aspectRatio;
        this.minimapCamera.updateProjectionMatrix();
    
        const oldFog = this.scene.fog;
        this.scene.fog = null;

        this.playerPosition = this?.olam?.chossid?.mesh?.position || this.playerPosition;
        
        await this.updateScroll();
        await this.render();
        
        this.scene.fog = oldFog;
    }

    resize() {
        const newSize = new THREE.Vector2();
        this.renderer.getSize(newSize);
        this.size.copy(newSize);
    }

    async render() {
        if(!this.renderer || !this.scene) return;
        
        if (!this.minimapCamera) {
            const size = new THREE.Vector2();
            this.renderer.getSize(size);
            this.size.clone(size);
            const aspectRatio = size.x / size.y;
            const frustumSize = 100;
            const halfFrustumSize = frustumSize * 0.5;
        
            this.minimapCamera = new THREE.OrthographicCamera(
                -halfFrustumSize * aspectRatio, halfFrustumSize * aspectRatio,
                halfFrustumSize, -halfFrustumSize, 1, 1000
            );
  
            this.minimapCamera.layers.set(2);
            this.minimapCamera.position.set(0, 50, 0);
            this.minimapCamera.lookAt(this.scene.position);
            this.minimapCamera.updateProjectionMatrix();
        
            this.scene.add(this.minimapCamera);
        }

        if(this.needsPositionUpdate) {
            const { position } = this.needsPositionUpdate;
            this.minimapCamera.position.x = position.x;
            this.minimapCamera.position.z = position.z;
            this.minimapCamera.updateMatrixWorld();
            this.prevCamPos.copy(position);
            this.needsPositionUpdate = null;
        }
        
        await this.updateItemPositions();
        this.renderer.render(this.scene, this.minimapCamera);
    }
    
    worldToMinimap(worldX, worldZ) {
        const worldBox = this.getCameraWorldBoundingBox(this.minimapCamera);
        if(!worldBox) return null;
        
        const canvasWidth = this.size.x;
        const canvasHeight = this.size.y;
        const scaleX = canvasWidth / (worldBox.max.x - worldBox.min.x);
        const scaleZ = canvasHeight / (worldBox.max.z - worldBox.min.z);

        return { 
            x: (worldX - worldBox.min.x) * scaleX, 
            y: (worldZ - worldBox.min.z) * scaleZ 
        };
    }

    getCameraWorldBoundingBox(camera) {
        if(!camera) return null;
        const min = new THREE.Vector3(camera.left, camera.bottom, -camera.far);
        const max = new THREE.Vector3(camera.right, camera.top, camera.near);
        const box = new THREE.Box3(min, max);
        box.applyMatrix4(camera.matrixWorld);
        return box;
    }
}
