// B"H
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/**
 * Manages the core THREE.js scene, camera, renderer, lights, and grid.
 */
export class SceneManager {
    constructor(canvasElement, eventEmitter) {
        this.canvas = canvasElement;
        this.eventEmitter = eventEmitter;
        this.clock = new THREE.Clock();

        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x282c34); // Match CSS bg

        // Camera
        const aspect = window.innerWidth / window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 10000);
        this.camera.position.set(5, 5, 10);
        this.camera.lookAt(0, 0, 0);
        this.scene.add(this.camera); // Sometimes useful to have camera in scene

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true // Allows for transparent background if needed
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        // Enable shadows if desired later
        // this.renderer.shadowMap.enabled = true;
        // this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Orbit Controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true; // Smooths camera movement
        this.controls.dampingFactor = 0.1;
        this.controls.screenSpacePanning = false; // Panning moves parallel to ground plane
        this.controls.minDistance = 1;
        this.controls.maxDistance = 500;
        this.controls.target.set(0, 1, 0); // Look slightly above origin
        this.controls.update();

        // Basic Lighting
        this.setupLighting();

        // Grid Helper
        this.setupGrid();

        // Resize Handling
        window.addEventListener('resize', this.onWindowResize.bind(this));

        console.log("B\"H - SceneManager Initialized");
    }

    setupLighting() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Soft white light
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 7.5);
        // Configure shadows if enabled
        // directionalLight.castShadow = true;
        // directionalLight.shadow.mapSize.width = 1024;
        // directionalLight.shadow.mapSize.height = 1024;
        this.scene.add(directionalLight);

        // Optional: Add a hemisphere light for softer fill
        const hemiLight = new THREE.HemisphereLight(0xcccccc, 0x444444, 0.4);
        hemiLight.position.set(0, 20, 0);
        this.scene.add(hemiLight);
    }

    setupGrid() {
        const size = 100;
        const divisions = 100;
        const gridHelper = new THREE.GridHelper(size, divisions, 0x888888, 0x444444); // Center line color, grid line color
        gridHelper.position.y = -0.01; // Slightly below ground
        this.scene.add(gridHelper);

        // Optional Axes Helper
        // const axesHelper = new THREE.AxesHelper(5);
        // this.scene.add(axesHelper);
    }

    onWindowResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);
        this.eventEmitter.emit('windowResized'); // Notify UI if needed
    }

    render() {
        this.controls.update(); // Required if enableDamping is true
        this.renderer.render(this.scene, this.camera);
    }

    // --- Camera Control ---
    focusOnObject(object) {
        if (!object) return;
        const box = new THREE.Box3().setFromObject(object);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = this.camera.fov * (Math.PI / 180);
        let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
        cameraZ *= 1.5; // Add some padding

        const newPos = center.clone().add(new THREE.Vector3(0, maxDim * 0.5, cameraZ)); // Adjust position

        // Animate transition later if desired
        this.camera.position.copy(newPos);
        this.controls.target.copy(center);
        this.controls.update();
    }

    getCamera() {
        return this.camera;
    }

    getRenderer() {
        return this.renderer;
    }
}