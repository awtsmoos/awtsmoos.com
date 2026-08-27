// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos hides immense creative possibility inside a small declarative map;
 * Awtsmoos.com can reorder, retract, and extend the studio without burying meaning inside compressed HTML traps.
 */
import { PanelDefinitionFactory as Panel } from "./PanelDefinitionFactory.js";

const range = (min, max, value, output, step = "1") => ({
	type: "range",
	min,
	max,
	step,
	value,
	output
});

export const EIN_SOF_PANEL_DEFINITIONS = Object.freeze([
	Panel.panel("Gevulot", "Caption & output", [
		Panel.field("batchInput", "Caption batch", {
			type: "textarea",
			rows: 6,
			placeholder: "Separate captions with a blank line."
		}, true),
		Panel.field("headerInput", "Header", {
			type: "text",
			placeholder: "Optional heading"
		}, true),
		Panel.switch(
			"useDirectoryPicker",
			"Choose a save folder before rendering",
			"directoryPickerContainer"
		)
	], true),
	Panel.panel("Tzimtzum", "Caption vessel", [
		Panel.randomized("boxColor", "Box color", {
			type: "color",
			value: "#101018"
		}),
		Panel.randomized("boxOpacity", "Opacity", range("0", "1", "0.75", true, "0.05"), {
			min: "0.6",
			max: "0.9"
		}),
		Panel.randomized("boxPadding", "Padding", range("0", "200", "50", true), {
			min: "30",
			max: "80"
		}),
		Panel.randomized("boxRadius", "Radius", range("0", "300", "20", true), {
			min: "0",
			max: "60"
		})
	]),
	Panel.panel("Olam Yetzirah", "Particle field", [
		Panel.randomized("particleDensity", "Density", range("100", "5000", "1800", true), {
			min: "1000",
			max: "3000"
		}),
		Panel.randomized("minParticleSize", "Min size", range("1", "50", "10", true), {
			min: "5",
			max: "15"
		}),
		Panel.randomized("maxParticleSize", "Max size", range("10", "150", "90", true), {
			min: "70",
			max: "120"
		}),
		Panel.field("particleStyle", "Style", {
			type: "select",
			options: [["fragmented", "Fragmented"], ["full", "Full"]]
		}),
		Panel.field("particleChars", "Characters", {
			type: "textarea",
			rows: 3,
			value: "אבגדהוזחטיכלמנסעפצקרשת"
		}, true)
	]),
	Panel.panel("Kavim v'Sefirot", "Connections", [
		Panel.field("networkType", "Algorithm", {
			type: "select",
			options: [["web", "Fine Web"], ["arcs", "Energy Arcs"], ["synapse", "Neural Synapse"], ["none", "None"]]
		}),
		Panel.randomized("connectionDensity", "Density", range("0", "10", "4", true), {
			min: "2",
			max: "6"
		})
	]),
	Panel.panel("Marot Elokim", "Atmosphere", [
		Panel.randomized("baseBgColor", "Background", {
			type: "color",
			value: "#0A0814"
		}),
		Panel.randomized("filmGrain", "Film grain", range("0", "50", "25", true), {
			min: "15",
			max: "35"
		}),
		Panel.randomized("bloomIntensity", "Bloom", range("0", "30", "10", true), {
			min: "5",
			max: "15"
		})
	])
]);
