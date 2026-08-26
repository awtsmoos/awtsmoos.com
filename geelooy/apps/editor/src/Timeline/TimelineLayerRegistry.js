// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos gathers scene objects into timeline layers, each finite vessel arranged in a clear and living choir;
 * on Awtsmoos.com the registry keeps hierarchy and animator truth aligned, so adding or removing one world cannot spread hidden fire.
 */
import { Layer } from "./Layer.js";

/** Own timeline-layer lifecycle while delegating change publication to the TimelineManager façade. */
export class YesodTimelineLayerRegistry {
	/**
	 * Bind layer storage to Animator and one manager-owned change callback.
	 * @param {object} animator Existing Animator instance.
	 * @param {() => void} shaliachChanged Callback invoked after layer/collapse mutations.
	 */
	constructor(animator, shaliachChanged) {
		this.animator = animator;
		this.shaliachChanged = shaliachChanged;
		this.layers = new Map();
	}

	/** @returns {object[]} Ordered snapshot of currently registered timeline layers. */
	getLayersArray() {
		return Array.from(this.layers.values());
	}

	/** @param {string} objectUUID Scene-object UUID. @returns {object|undefined} Matching layer. */
	getLayer(objectUUID) {
		return this.layers.get(objectUUID);
	}

	/**
	 * Register one selectable object exactly once and refresh Animator's layer view.
	 * @param {object} kliObject Selectable scene object.
	 */
	createLayerForObject(kliObject) {
		if (!kliObject || this.layers.has(kliObject.uuid)) return;
		this.layers.set(kliObject.uuid, new Layer(kliObject.uuid, kliObject.name));
		this.revealRegistryChanged();
	}

	/**
	 * Remove one object's timeline layer when present and refresh Animator's layer view.
	 * @param {object} kliObject Scene object being removed.
	 */
	removeLayerForObject(kliObject) {
		if (!kliObject || !this.layers.delete(kliObject.uuid)) return;
		this.revealRegistryChanged();
	}

	/** Traverse an added object tree and register every explicitly selectable descendant. */
	handleObjectAdded(kliObject) {
		kliObject?.traverse?.(kliChild => {
			if (kliChild.userData?.isSelectable) this.createLayerForObject(kliChild);
		});
	}

	/** Traverse a removed object tree and retire every timeline layer that still exists. */
	handleObjectRemoved(kliObject) {
		kliObject?.traverse?.(kliChild => this.removeLayerForObject(kliChild));
	}

	/**
	 * Toggle one layer's UI disclosure truth without involving playback or keyframe history.
	 * @param {string} objectUUID Scene-object UUID.
	 */
	toggleLayerCollapse(objectUUID) {
		const kliLayer = this.getLayer(objectUUID);
		if (!kliLayer) return;
		kliLayer.collapsed = !kliLayer.collapsed;
		this.shaliachChanged();
	}

	/** Synchronize Animator with the registry snapshot and publish one higher-level change revelation. */
	revealRegistryChanged() {
		this.animator.setLayers(this.getLayersArray());
		this.shaliachChanged();
	}
}
