

/**
 * B"H
 * @file raycasting.js
 * Logic for the builder's ray.
 */
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";

export default {
    getRayStart() {
        if (this.olam && this.olam.ayin && this.olam.ayin.isFPS) {
            const pos = new THREE.Vector3();
            this.olam.ayin.camera.getWorldPosition(pos);
            pos.y -= 0.1; 
            return pos;
        } else {
            const pos = this.collider.end.clone();
            pos.y -= 0.4; 
            return pos;
        }
    },

    getRayDirection() {
        const direction = new THREE.Vector3();
        if (this.olam && this.olam.ayin && this.olam.ayin.isFPS) {
            this.olam.ayin.camera.getWorldDirection(direction);
        } else {
            const forward = new THREE.Vector3(0, 0, 1);
            if (this.modelMesh) {
                forward.applyQuaternion(this.modelMesh.quaternion);
            }
            direction.copy(forward);
        }
        return direction.normalize();
    },

    removeRay() {
        this.removeActiveObject();
        if (this.activeRay && this.activeRay.group && this.activeRay.group.parent) {
            this.activeRay.group.parent.remove(this.activeRay.group);
        }
        this.activeRay = null;
        this.olam.remove("setFPS");
    },

    async makeRay(length = 72) {
        if (this.activeRay) {
            this.removeRay();
            return; 
        }

        const rayGroup = new THREE.Group();
        const parent = this.olam.ayin.isFPS ? this.olam.ayin.camera : this.emptyCopy;
        
        parent.add(rayGroup);

        const worldStart = this.getRayStart();
        const localStart = parent.worldToLocal(worldStart.clone());
        rayGroup.position.copy(localStart);

        if (this.olam.ayin.isFPS) {
            rayGroup.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
        } else {
            rayGroup.quaternion.identity();
        }

        const geometry = new THREE.CylinderGeometry(0.015, 0.015, length, 8);
        const material = new THREE.MeshBasicMaterial({ color: 0x0000ff, transparent: true, opacity: 0.5 });
        const cylinderMesh = new THREE.Mesh(geometry, material);

        cylinderMesh.rotation.x = Math.PI / 2;
        cylinderMesh.position.z = length / 2;
        rayGroup.add(cylinderMesh);

        this.activeRay = { group: rayGroup, visual: cylinderMesh };

        if(this._fpsSwitchListener) {
            this.olam.remove("setFPS", this._fpsSwitchListener);
        }

        this._fpsSwitchListener = () => {
            const hadObject = !!this.activeObject;
            setTimeout(() => {
                this.removeRay();
                this.makeRay(length).then(() => {
                    if (hadObject) this.placeBlockOnRay();
                });
            }, 50);
        };

        this.olam.on("setFPS", this._fpsSwitchListener, { once: true });
    },

    updateRayColor() {
        if (!this.activeRay || !this.activeRay.visual) return;

        const item = this.getActiveItem();
        const mat = this.activeRay.visual.material;

        if (item && item.isPainter) {
            if(this.isPaintingMode) {
                mat.color.setHex(0xFFD700); // B"H: Gold for Active Painting Mode
                mat.opacity = 0.8;
            } else {
                mat.color.setHex(0x00ff00); // Green for Painter held but inactive
                mat.opacity = 0.5;
            }
        } else if (item && item.isBuildable) {
            mat.color.setHex(0x0000ff); // Blue for buildable
            mat.opacity = 0.5;
        } else if (item && item.className === 'Tool') {
            mat.color.setHex(0xff0000); // Red for tools
            mat.opacity = 0.8;
        } else {
            mat.color.setHex(0xffffff); // White (inactive)
            mat.opacity = 0.1;
        }
    }
};
