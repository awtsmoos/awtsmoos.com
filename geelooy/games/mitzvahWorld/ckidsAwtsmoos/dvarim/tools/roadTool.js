//B"H
import Tool from "../tool.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import * as THREE from '/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export default class RoadTool extends Tool {
    async shoot() {
        const ray = new THREE.Raycaster(this.olam.player.getRayStart(), this.olam.player.getRayDirection());
        const hit = this.olam.worldOctree.rayIntersect(ray.ray);
        if (hit && hit.distance < 10) {
            const road = new THREE.Mesh(new THREE.BoxGeometry(4, 0.1, 4), new THREE.MeshLambertMaterial({ color: 0x333333 }));
            road.position.copy(hit.point); road.userData.isRoad = true;
            this.olam.scene.add(road); this.olam.worldOctree.addObject(road);
        }
    }
}