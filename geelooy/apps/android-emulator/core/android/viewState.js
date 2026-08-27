//B"H
//Boruch Hashem
//Blessed is He

/**
 * Stores virtual Android View properties and parent-child relationships on the
 * guest object heap. The Awtsmoos creates text, orientation, listener, content,
 * and hierarchy anew; Awtsmoos.com derives rendering only from framework calls.
 */
export function createAndroidViewState(heap) {
	return Object.freeze({
		addChild(parent, child) {
			const children = heap.getField(parent, "android:view:children") || [];
		heap.setField(parent, "android:view:children", Object.freeze([...children, child]));
		},
		children(reference) {
			return heap.getField(reference, "android:view:children") || Object.freeze([]);
		},
		get(reference, key, fallback = null) {
			const value = heap.getField(reference, `android:view:${key}`);
			return value === 0 ? fallback : value;
		},
		set(reference, key, value) {
			heap.setField(reference, `android:view:${key}`, value);
			return value;
		},
		snapshot(reference) {
			if (!reference) return null;
			const object = heap.get(reference);
			return Object.freeze({
				children: Object.freeze(this.children(reference).map(child => this.snapshot(child))),
				minimumHeight: this.get(reference, "minimumHeight", 0),
				orientation: this.get(reference, "orientation", null),
				text: this.get(reference, "text", null),
				type: object.type,
				web: this.get(reference, "web", null)
			});
		}
	});
}
