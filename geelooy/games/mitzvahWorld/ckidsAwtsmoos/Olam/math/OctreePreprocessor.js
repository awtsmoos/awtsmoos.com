// B"H
import * as THREE from '/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { GLTFExporter } from '/games/scripts/jsm/exporters/GLTFExporter.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

/**
 * @typedef {Object} PreprocessorOptions
 * @property {number} [maxTrianglesPerNode=5000] - The maximum number of triangles a leaf node can contain before it's split.
 * @property {boolean} [includeNormals=true] - Whether to compute and include normals in the exported chunks for lighting.
 */

/**
 * The OctreePreprocessor takes a Three.js scene and recursively subdivides its geometry
 * into an octree structure. It generates a manifest file and a set of in-memory GLB chunks
 * accessible via Blob URLs, perfectly formatted for use with the dynamic OctreeWorld streaming system.
 */
export class OctreePreprocessor {
    #options;
    #exporter = new GLTFExporter();
    #blobCache = new Map();

    /**
     * @param {PreprocessorOptions} [options={}] - Configuration for the preprocessing.
     */
    constructor(options = {}) {
        this.#options = {
            maxTrianglesPerNode: 5000,
            includeNormals: true,
            ...options
        };
    }

    /**
     * The main entry point for processing a scene.
     * @param {THREE.Scene | THREE.Group} scene - The loaded 3D model to process.
     * @returns {Promise<{manifest: object, blobMap: Map<string, Blob>}>} - A promise that resolves with the manifest and the blob map.
     */
    async process(scene) {
        // B"H: silent

        if (!scene) {
            throw new Error("Input scene cannot be null.");
        }

        this.cleanup(); // Clean up any old blobs before starting.

        const { triangles, sceneBox } = this.#extractAllTriangles(scene);

        if (triangles.length === 0) {
            console.warn('B"H:\n Scene contains no processable geometry.');
            return { manifest: { bounds: { min: [0,0,0], max: [0,0,0] }, children: null }, blobMap: this.#blobCache };
        }
        
        const manifest = {
            bounds: {
                min: sceneBox.min.toArray(),
                max: sceneBox.max.toArray()
            },
            data: null,
            children: []
        };
        
        await this.#recursiveSplit(manifest, triangles);

        // B"H: silent

        return { manifest, blobMap: this.#blobCache };
    }

    /**
     * Traverses the scene graph, extracts all triangles, and converts their vertices to world space.
     * @param {THREE.Object3D} scene
     * @returns {{triangles: THREE.Triangle[], sceneBox: THREE.Box3}}
     */
    #extractAllTriangles(scene) {
        const triangles = [];
        const sceneBox = new THREE.Box3();
        
        scene.updateWorldMatrix(true, true);

        scene.traverse(object => {
            if (object.isMesh) {
                const geometry = object.geometry;
                const positionAttribute = geometry.getAttribute('position');
                const indexAttribute = geometry.getIndex();

                if (!positionAttribute) return;

                if (indexAttribute) {
                    // Handle indexed geometry
                    for (let i = 0; i < indexAttribute.count; i += 3) {
                        const iA = indexAttribute.getX(i);
                        const iB = indexAttribute.getX(i + 1);
                        const iC = indexAttribute.getX(i + 2);

                        const vA = new THREE.Vector3().fromBufferAttribute(positionAttribute, iA).applyMatrix4(object.matrixWorld);
                        const vB = new THREE.Vector3().fromBufferAttribute(positionAttribute, iB).applyMatrix4(object.matrixWorld);
                        const vC = new THREE.Vector3().fromBufferAttribute(positionAttribute, iC).applyMatrix4(object.matrixWorld);
                        
                        triangles.push(new THREE.Triangle(vA, vB, vC));
                        sceneBox.expandByPoint(vA).expandByPoint(vB).expandByPoint(vC);
                    }
                } else {
                    // Handle non-indexed geometry
                    for (let i = 0; i < positionAttribute.count; i += 3) {
                        const vA = new THREE.Vector3().fromBufferAttribute(positionAttribute, i).applyMatrix4(object.matrixWorld);
                        const vB = new THREE.Vector3().fromBufferAttribute(positionAttribute, i + 1).applyMatrix4(object.matrixWorld);
                        const vC = new THREE.Vector3().fromBufferAttribute(positionAttribute, i + 2).applyMatrix4(object.matrixWorld);
                        
                        triangles.push(new THREE.Triangle(vA, vB, vC));
                        sceneBox.expandByPoint(vA).expandByPoint(vB).expandByPoint(vC);
                    }
                }
            }
        });

        return { triangles, sceneBox };
    }

    /**
     * Recursively subdivides a node's geometry until it's simple enough to be a leaf.
     * @param {object} manifestNode - The current node in the manifest being processed.
     * @param {THREE.Triangle[]} triangles - The triangles within this node's bounds.
     */
    async #recursiveSplit(manifestNode, triangles) {
        if (triangles.length <= this.#options.maxTrianglesPerNode) {
            // This is a leaf node.
            if (triangles.length > 0) {
                manifestNode.data = await this.#createGltfBlobUrl(triangles);
            }
            manifestNode.children = null; // Ensure leaf nodes have null children
            return;
        }

        // This node is too complex, split it.
        const parentBox = new THREE.Box3().setFromArray([...manifestNode.bounds.min, ...manifestNode.bounds.max]);
        const childBoxes = this.#createChildBoxes(parentBox);
        const childTriangles = Array.from({ length: 8 }, () => []);
        
        for (const triangle of triangles) {
            for (let i = 0; i < 8; i++) {
                if (childBoxes[i].intersectsTriangle(triangle)) {
                    childTriangles[i].push(triangle);
                }
            }
        }
        
        const childPromises = [];
        for (let i = 0; i < 8; i++) {
            if (childTriangles[i].length > 0) {
                const childNode = {
                    bounds: { min: childBoxes[i].min.toArray(), max: childBoxes[i].max.toArray() },
                    data: null,
                    children: []
                };
                manifestNode.children.push(childNode);
                childPromises.push(this.#recursiveSplit(childNode, childTriangles[i]));
            }
        }

        await Promise.all(childPromises);
    }
    
    #createChildBoxes(parentBox) {
        const halfSize = parentBox.getSize(new THREE.Vector3()).multiplyScalar(0.5);
        const center = parentBox.getCenter(new THREE.Vector3());
        const boxes = [];
        for (let i = 0; i < 8; i++) {
            const min = parentBox.min.clone();
            if (i & 1) min.x = center.x;
            if (i & 2) min.y = center.y;
            if (i & 4) min.z = center.z;
            const max = min.clone().add(halfSize);
            boxes.push(new THREE.Box3(min, max));
        }
        return boxes;
    }

    /**
     * Creates a GLB from a set of triangles and returns a Blob URL.
     * @param {THREE.Triangle[]} triangles
     * @returns {Promise<string>}
     */
    async #createGltfBlobUrl(triangles) {
        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        for (const tri of triangles) {
            vertices.push(tri.a.x, tri.a.y, tri.a.z);
            vertices.push(tri.b.x, tri.b.y, tri.b.z);
            vertices.push(tri.c.x, tri.c.y, tri.c.z);
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        if (this.#options.includeNormals) {
            geometry.computeVertexNormals();
        }

        const material = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.1, roughness: 0.8 });
        const mesh = new THREE.Mesh(geometry, material);

        return new Promise((resolve, reject) => {
            this.#exporter.parse(mesh, (glb) => {
                const blob = new Blob([glb], { type: 'model/gltf-binary' });
                const url = URL.createObjectURL(blob);
                this.#blobCache.set(url, blob);
                resolve(url);
            }, (error) => {
                console.error("B\"H: GLTFExporter failed.", error);
                reject(error);
            }, { binary: true });
        });
    }

    /**
     * Revokes all previously created Blob URLs to free up memory.
     * Call this when you are done with a processed model and want to process a new one.
     */
    cleanup() {
        for (const url of this.#blobCache.keys()) {
            URL.revokeObjectURL(url);
        }
        this.#blobCache.clear();
        // B"H: silent

    }
}