//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Builds the readable-first native 3D controls while leaving state mutation to the panel controller.
 * The Awtsmoos lets one quick recipe unfold into many finite controls without confusing root and branch;
 * Awtsmoos.com keeps DOM construction apart from preference changes so advanced power remains measured at a glance.
 */
import { createRangeControl, createSelectControl, createToggleControl, humanizeOption } from "./proceduralControlFactory.js";

export function buildProceduralPanel(options, catalog) {
	const panel = document.createElement("div");
	panel.className = "chess-studio-procedural-options";
	panel.append(quickChoices(catalog), advancedControls(options, catalog));
	return panel;
}

function quickChoices(catalog) {
	const box = document.createElement("div");
	box.className = "studio-3d-quick-presets";
	for (const preset of catalog.quick) {
		const button = document.createElement("button");
		button.type = "button";
		button.dataset.proceduralPreset = preset.id;
		button.textContent = preset.name;
		box.append(button);
	}
	return box;
}

function advancedControls(options, catalog) {
	const details = document.createElement("details");
	details.className = "studio-advanced-3d";
	const summary = document.createElement("summary");
	summary.textContent = "Advanced 3D controls";
	const grid = document.createElement("div");
	grid.className = "studio-field-grid";
	grid.append(...advancedFields(options, catalog));
	details.append(summary, grid);
	return details;
}

function advancedFields(options, catalog) {
	const fields = [
		select("cameraMotion", "Motion", catalog.motions, options),
		select("camera", "View / angle", catalog.cameras, options),
		select("cameraIntensity", "Motion intensity", catalog.intensities, options),
		select("environment", "Background", catalog.environments, options),
		select("piecePalette", "Piece contrast", catalog.palettes, options),
		select("pieceMaterial", "Piece finish", catalog.materials, options),
		select("lighting", "Lighting", catalog.lighting, options),
		select("quality", "Quality", catalog.quality, options),
		range("pieceScale", "Piece size", catalog, options),
		toggle("fog", "Atmospheric fog", options),
		toggle("followMove", "Follow each move", options),
		toggle("moveArrow", "3D move arrow", options)
	];
	if (options.camera === "manual") {
		for (const key of ["distance", "elevation", "azimuth", "fov"]) fields.push(range(key, humanizeOption(key), catalog, options, true));
	}
	return fields;
}

function select(key, label, items, options) {
	return createSelectControl(key, label, items, options[key]);
}
function toggle(key, label, options) {
	return createToggleControl(key, label, options[key]);
}
function range(key, label, catalog, options, manual = false) {
	const value = manual ? options.manualCamera[key] : options[key];
	return createRangeControl(key, label, catalog.ranges[key], value, manual);
}
