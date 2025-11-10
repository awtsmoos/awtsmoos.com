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
    this.scene.background = new THREE.Color(0x282c34);

    // Camera
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 10000);
    this.camera.position.set(5, 5, 10);
    this.camera.lookAt(0, 0, 0);
    this.scene.add(this.camera);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        antialias: true,
        alpha: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    // Orbit Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    
    // --- B"H FIX: Blender-style camera controls configuration ---
    this.controls.mouseButtons = {
        LEFT: THREE.MOUSE.ROTATE,    // Kept for consistency, but selection takes priority on click
        MIDDLE: THREE.MOUSE.ROTATE,  // Middle-click + drag to orbit
        RIGHT: THREE.MOUSE.PAN      // Right-click + drag to pan
    };
    // --- END OF FIX ---

    this.controls.touches = {
        ONE: THREE.TOUCH.ROTATE,
        TWO: THREE.TOUCH.DOLLY_PAN
    }
    this.controls.screenSpacePanning = true;
    this.controls.minDistance = 0.1;
    this.controls.maxDistance = 1000;
    this.controls.target.set(0, 1, 0);
    this.controls.update();

    // Setup
    this.setupLighting();
    this.setupGrid();
    this.setupEventListeners();

    console.log('B"H\n - SceneManager Initialized with Blender-like controls');
}

    setupEventListeners() {
        window.addEventListener('resize', this.onWindowResize.bind(this));
        this.eventEmitter.on('focusOnObjectRequest', this.focusOnObject.bind(this));
    }

    setupLighting() {
        this.scene.add(new THREE.AmbientLight(0xffffff, 0.5));
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 7.5);
        this.scene.add(directionalLight);
        const hemiLight = new THREE.HemisphereLight(0xcccccc, 0x444444, 0.4);
        hemiLight.position.set(0, 20, 0);
        this.scene.add(hemiLight);
    }

    setupGrid() {
        const gridHelper = new THREE.GridHelper(100, 100, 0x888888, 0x444444);
        gridHelper.position.y = -0.01;
        this.scene.add(gridHelper);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.eventEmitter.emit('windowResized');
    }

    render() {
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    focusOnObject(object) {
        if (!object) return;
        const box = new THREE.Box3().setFromObject(object);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = this.camera.fov * (Math.PI / 180);
        let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
        cameraZ *= 1.5; // Add some padding

        // Get the vector from the camera to the current target and normalize it
        const cameraToTarget = new THREE.Vector3().subVectors(this.camera.position, this.controls.target).normalize();
        
        // New camera position is the center of the object, backed up along the old view direction
        const newPos = center.clone().add(cameraToTarget.multiplyScalar(Math.max(cameraZ, 1))); // Ensure a minimum distance

        // For a smoother but potentially jarring transition, you can use: this.camera.position.copy(newPos);
        this.controls.target.copy(center);
        this.controls.update();
    }

    getCamera() { return this.camera; }
    getRenderer() { return this.renderer; }
}