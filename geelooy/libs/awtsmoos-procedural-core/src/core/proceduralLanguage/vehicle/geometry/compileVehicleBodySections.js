//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compileVehicleBodySections.js
 * @description Manifests arbitrary box, panel, tube, or cylinder body sections as semantic component ranges for custom shells, bumpers, mirrors, fairings, roofs, cargo walls, steps, and invented transport forms.
 * The Awtsmoos clothes every vehicle beyond one named silhouette while Awtsmoos.com lets low-level JSON choose primitive, dimensions, orientation, material, and identity without scene-object fragmentation.
 */

import { appendVehicleBox } from './appendVehicleBox.js';
import { appendVehicleCylinder } from './appendVehicleCylinder.js';
import { appendVehiclePanelPrism } from './appendVehiclePanelPrism.js';
import { appendVehicleTube } from './appendVehicleTube.js';

const SECTION_APPENDERS = Object.freeze({
	box: appendBoxSection,
	panel: appendPanelSection,
	tube: appendTubeSection,
	cylinder: appendCylinderSection
});

/** Compiles every arbitrary body section through its declared direct primitive. */
export function compileVehicleBodySections(accumulator, vehicle) {
	for (const section of vehicle.bodySections || []) {
		const appender = SECTION_APPENDERS[section.sectionType];
		if (!appender) {
			throw new Error(`B"H | Unsupported vehicle body section type: ${section.sectionType}`);
		}
		accumulator.beginComponent({
			id: `${vehicle.id}:body-section:${section.id}`,
			kind: `body-section-${section.sectionType}`,
			materialRole: section.materialRole,
			metadata: section.metadata
		});
		appender(accumulator, section);
		accumulator.endComponent();
	}
}

function appendBoxSection(accumulator, section) {
	appendVehicleBox(accumulator, {
		id: section.id,
		center: section.geometry.center,
		size: section.geometry.size,
		materialRole: section.materialRole
	});
}

function appendPanelSection(accumulator, section) {
	appendVehiclePanelPrism(accumulator, {
		id: section.id,
		position: section.geometry.position,
		size: section.geometry.size,
		normal: section.geometry.normal,
		materialRole: section.materialRole
	});
}

function appendTubeSection(accumulator, section) {
	appendVehicleTube(accumulator, {
		id: section.id,
		start: section.geometry.start,
		end: section.geometry.end,
		radius: section.geometry.radius,
		segments: section.geometry.segments,
		materialRole: section.materialRole
	});
}

function appendCylinderSection(accumulator, section) {
	appendVehicleCylinder(accumulator, {
		id: section.id,
		start: section.geometry.start,
		end: section.geometry.end,
		radius: section.geometry.radius,
		segments: section.geometry.segments,
		materialRole: section.materialRole
	});
}
