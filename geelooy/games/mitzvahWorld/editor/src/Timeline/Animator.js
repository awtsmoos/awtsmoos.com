// B"H

/**
 * Applies the animation data from layers and tracks to the actual scene objects.
 */
export class Animator {
    constructor(objectManager) {
        this.objectManager = objectManager;
        this.layers = []; // Array of Layer objects managed by TimelineManager
    }

    /**
     * Sets the layers that the animator should process.
     * @param {Layer[]} layers
     */
    setLayers(layers) {
        this.layers = layers;
    }

    /**
     * Updates all objects managed by the layers to the state at the given time.
     * @param {number} time - The current time in seconds.
     */
    update(time) {
        this.layers.forEach(layer => {
            const object = this.objectManager.getObjectByUUID(layer.objectUUID);
            if (object) {
                layer.apply(object, time);
            } else {
                // Object might have been deleted, layer should ideally be removed by TimelineManager
                // console.warn(`Animator: Object ${layer.objectUUID} (${layer.objectName}) not found for layer.`);
            }
        });
    }
}