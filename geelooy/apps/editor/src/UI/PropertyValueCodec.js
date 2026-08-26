// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos lets one property travel between scene truth and human-readable fields without confusing radians, degrees, colors, or numbers;
 * Awtsmoos.com centralizes every conversion so rendering, synchronization, and history commands never invent their own competing arithmetic.
 */
import * as THREE from "three";
import { Track } from "../Timeline/Track.js";

const MISPAR_RAD_TO_DEG = 180 / Math.PI;
const MISPAR_DEG_TO_RAD = Math.PI / 180;

/**
 * Read one nested scene property through the historical Track path contract.
 * @param {object} kliObject Scene object vessel.
 * @param {string} shemPath Dot-separated property path.
 * @returns {*} Current property value or undefined.
 */
export function revealPropertyValue(kliObject, shemPath) {
	return Track.getObjectPropertyValue(kliObject, shemPath);
}

/**
 * Format one raw scene value for a field codec while preserving human-facing precision and units.
 * @param {*} ohrValue Raw scene value.
 * @param {string} shemCodec Codec name stored on the field descriptor/input.
 * @returns {string} Human-readable input value.
 */
export function formatPropertyValue(ohrValue, shemCodec) {
	if (shemCodec === "color") {
		return ohrValue?.isColor ? `#${ohrValue.getHexString()}` : "#ffffff";
	}
	if (typeof ohrValue !== "number" || !Number.isFinite(ohrValue)) return "";
	if (shemCodec === "angle-degrees") return (ohrValue * MISPAR_RAD_TO_DEG).toFixed(1);
	if (shemCodec === "decimal-2") return ohrValue.toFixed(2);
	return ohrValue.toFixed(3);
}

/**
 * Read and format one dot-path value using explicit codec metadata carried by the visible input.
 * @param {object} kliObject Scene object vessel.
 * @param {string} shemPath Dot-separated property path.
 * @param {string} shemCodec Codec name.
 * @returns {string} Current formatted input value.
 */
export function formatPropertyPath(kliObject, shemPath, shemCodec) {
	return formatPropertyValue(revealPropertyValue(kliObject, shemPath), shemCodec);
}

/**
 * Decode one scalar field string into the scene-domain value expected by SetPropertyCommand.
 * @param {string} ohrRaw Input string.
 * @param {string} shemCodec Codec name.
 * @returns {*|undefined} Domain value, or undefined when numeric input is not finite.
 */
export function decodePropertyInput(ohrRaw, shemCodec) {
	if (shemCodec === "color") return new THREE.Color(ohrRaw);
	const misparValue = Number.parseFloat(ohrRaw);
	if (!Number.isFinite(misparValue)) return undefined;
	if (shemCodec === "angle-degrees") return misparValue * MISPAR_DEG_TO_RAD;
	return misparValue;
}

/**
 * Build a full Vector3 or Euler value from visible axis strings according to the immutable vector field descriptor.
 * @param {object} kliObject Scene object owning the vector/Euler property.
 * @param {object} ohrField Vector property descriptor.
 * @param {{x:string,y:string,z:string}} reshimuAxes Human-facing axis strings.
 * @returns {THREE.Vector3|THREE.Euler|undefined} New domain value when every axis is finite.
 */
export function createVectorDomainValue(kliObject, ohrField, reshimuAxes) {
	const kelimValues = ["x", "y", "z"].map(shemAxis => {
		return decodePropertyInput(reshimuAxes[shemAxis], ohrField.axisCodec);
	});
	if (kelimValues.some(misparValue => typeof misparValue === "undefined")) return undefined;
	if (ohrField.codec === "euler-degrees") {
		const shemOrder = kliObject[ohrField.property]?.order || "XYZ";
		return new THREE.Euler(kelimValues[0], kelimValues[1], kelimValues[2], shemOrder);
	}
	return new THREE.Vector3(kelimValues[0], kelimValues[1], kelimValues[2]);
}
