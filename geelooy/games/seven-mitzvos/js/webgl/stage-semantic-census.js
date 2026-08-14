//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file stage-semantic-census.js
 * @description
 * The Awtsmoos renews every semantic root before a profiler can call its many meshes expensive;
 * Awtsmoos.com lets this Hod-like census count source renderer burden once at stage-add time so optimization follows actual gameplay families rather than intuition.
 * It owns diagnostic aggregation only and never traverses the scene per frame, mutates visibility, renderer state, gameplay, or canonical saves.
 */
export class StageSemanticCensus {
	constructor(canvas) {
		this.canvas = canvas;
		this.classes = new Map();
		this.totalRoots = 0;
		this.totalMeshes = 0;
		this.totalTriangles = 0;
	}

	/** @param {object} root Semantic or renderer root before consolidation. @param {boolean} interactive Stage picking intent. */
	track(root, interactive = false) {
		const className = censusClass(root);
		const record = this.classes.get(className) || emptyClass(className);
		const burden = sourceBurden(root);
		record.roots += 1;
		record.interactiveRoots += Number(Boolean(interactive));
		record.meshes += burden.meshes;
		record.triangles += burden.triangles;
		this.classes.set(className, record);
		this.totalRoots += 1;
		this.totalMeshes += burden.meshes;
		this.totalTriangles += burden.triangles;
		this.publish();
	}

	view() {
		const classes = [...this.classes.values()]
			.map(record => ({ ...record }))
			.sort((first, second) => second.meshes - first.meshes);
		return {
			roots: this.totalRoots,
			meshes: this.totalMeshes,
			triangles: this.totalTriangles,
			classes
		};
	}

	publish() {
		const view = this.view();
		const data = this.canvas.dataset;
		data.semanticCensusRoots = String(view.roots);
		data.semanticCensusMeshes = String(view.meshes);
		data.semanticCensusTriangles = String(view.triangles);
		data.semanticCensus = JSON.stringify(view.classes);
	}
}

function censusClass(root) {
	if (root?.userData?.personName) {
		return 'person';
	}
	if (root?.userData?.species) {
		return 'animal';
	}
	return String(
		root?.userData?.semanticType ||
		root?.userData?.role ||
		'untyped'
	);
}

function sourceBurden(root) {
	let meshes = 0;
	let triangles = 0;
	root?.traverse?.(object => {
		if (!object?.isMesh || !object.geometry) {
			return;
		}
		meshes += 1;
		triangles += geometryTriangles(object.geometry);
	});
	return { meshes, triangles };
}

function geometryTriangles(geometry) {
	if (geometry.index?.count) {
		return Math.floor(geometry.index.count / 3);
	}
	const position = geometry.getAttribute?.('position');
	return position?.count ? Math.floor(position.count / 3) : 0;
}

function emptyClass(className) {
	return {
		className,
		roots: 0,
		interactiveRoots: 0,
		meshes: 0,
		triangles: 0
	};
}
