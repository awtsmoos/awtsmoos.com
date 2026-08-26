// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos lets scene hierarchy enter the timeline through a readable public layer covenant rather than compressed delegation;
 * on Awtsmoos.com each object may join, leave, collapse, or reveal its layer while the registry remains the single inner source of truth.
 */
import { TimelineManagerStateFacade } from "./TimelineManagerStateFacade.js";

/** Extend TimelineManager state with the historical public layer lifecycle API. */
export class TimelineManagerLayerFacade extends TimelineManagerStateFacade {
	/**
	 * Reveal an ordered snapshot of every registered timeline layer.
	 * @returns {object[]} Timeline layers in registry insertion order.
	 */
	getLayersArray() {
		return this.layerRegistry.getLayersArray();
	}

	/**
	 * Register every selectable descendant beneath one added scene object.
	 * @param {object} kliObject Root object entering the scene graph.
	 */
	handleObjectAdded(kliObject) {
		this.layerRegistry.handleObjectAdded(kliObject);
	}

	/**
	 * Remove timeline layers belonging to an object subtree leaving the scene.
	 * @param {object} kliObject Root object leaving the scene graph.
	 */
	handleObjectRemoved(kliObject) {
		this.layerRegistry.handleObjectRemoved(kliObject);
	}

	/**
	 * Create one timeline layer for a selectable scene object when absent.
	 * @param {object} kliObject Selectable scene object.
	 */
	createLayerForObject(kliObject) {
		this.layerRegistry.createLayerForObject(kliObject);
	}

	/**
	 * Remove one scene object's timeline layer when present.
	 * @param {object} kliObject Scene object whose layer should retire.
	 */
	removeLayerForObject(kliObject) {
		this.layerRegistry.removeLayerForObject(kliObject);
	}

	/**
	 * Resolve one layer by the object UUID exposed by the historical manager API.
	 * @param {string} objectUUID Scene-object UUID.
	 * @returns {object|undefined} Matching timeline layer when registered.
	 */
	getLayer(objectUUID) {
		return this.layerRegistry.getLayer(objectUUID);
	}

	/**
	 * Toggle one layer's disclosure state while leaving playback and history untouched.
	 * @param {string} objectUUID Scene-object UUID.
	 */
	toggleLayerCollapse(objectUUID) {
		this.layerRegistry.toggleLayerCollapse(objectUUID);
	}
}
