// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos tests that Properties exposes human-readable values while scene truth remains exact beneath the visible field;
 * on Awtsmoos.com manifests, codecs, commands, and semantic inputs share one contract so degrees never dissolve back into hidden radians.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { revealPropertyGroups } from "./src/UI/PropertyManifest.js";

/** Read one Properties source module as immutable contract evidence. */
function seferProperty(shemFile) {
	return readFileSync(new URL(`./src/UI/${shemFile}`, import.meta.url), "utf8");
}

const ohrCodec = seferProperty("PropertyValueCodec.js");
const ohrVector = seferProperty("PropertyVectorView.js");
const ohrField = seferProperty("PropertyFieldView.js");
const ohrSync = seferProperty("PropertyInputSync.js");
const ohrActions = seferProperty("PropertyActions.js");
const ohrPanel = seferProperty("PropertiesPanel.js");
const ohrCommand = readFileSync(new URL("./src/History/Commands/SetPropertyCommand.js", import.meta.url), "utf8");

test("property manifest reveals transform fields and only supported material controls", () => {
	const kliObject = {
		material: {
			isMaterial: true,
			type: "MeshStandardMaterial",
			color: {}, opacity: 1, roughness: 0.5
		}
	};
	const kelimGroups = revealPropertyGroups(kliObject);
	assert.equal(kelimGroups[0].key, "transform");
	assert.deepEqual(kelimGroups[0].fields.map(ohr => ohr.key), ["position", "rotation", "scale"]);
	assert.deepEqual(kelimGroups[1].fields.map(ohr => ohr.key), ["materialColor", "materialOpacity", "materialRoughness"]);
	assert.equal(kelimGroups[0].fields.find(ohr => ohr.key === "rotation").axisCodec, "angle-degrees");
});

test("degree/radian conversion is centralized in the codec instead of DOM-specific branches", () => {
	assert.match(ohrCodec, /MISPAR_RAD_TO_DEG = 180 \/ Math\.PI/);
	assert.match(ohrCodec, /MISPAR_DEG_TO_RAD = Math\.PI \/ 180/);
	assert.match(ohrCodec, /angle-degrees[\s\S]*MISPAR_RAD_TO_DEG/);
	assert.match(ohrCodec, /angle-degrees[\s\S]*MISPAR_DEG_TO_RAD/);
	assert.match(ohrCodec, /new THREE\.Euler/);
	assert.match(ohrCodec, /new THREE\.Vector3/);
});

test("every rendered property input carries explicit path and codec metadata", () => {
	assert.match(ohrField, /"data-path": ohrField\.path/);
	assert.match(ohrField, /"data-codec": ohrField\.codec/);
	assert.match(ohrVector, /"data-path": shemPath/);
	assert.match(ohrVector, /"data-codec": ohrField\.axisCodec/);
	assert.match(ohrSync, /input\[data-path\]\[data-codec\]/);
	assert.match(ohrSync, /document\.activeElement/);
});

test("property mutations flow through explicit ObjectManager injection and one history command", () => {
	assert.match(ohrActions, /new SetPropertyCommand\(/);
	assert.match(ohrActions, /this\.olamObjectManager/);
	assert.match(ohrActions, /this\.chochmahHistoryManager\.add/);
	assert.doesNotMatch(ohrCommand, /window\.MWA/);
	assert.match(ohrCommand, /this\.olamObjectManager = olamObjectManager/);
	assert.match(ohrCommand, /Track\.setObjectPropertyValue/);
	assert.match(ohrCommand, /emit\("objectTransformed"/);
});

test("PropertiesPanel is an orchestration façade rather than a field-building monolith", () => {
	assert.match(ohrPanel, /new YesodPropertyActions/);
	assert.match(ohrPanel, /new TiferesPropertyFieldView/);
	assert.match(ohrPanel, /new TiferesPropertyVectorView/);
	assert.match(ohrPanel, /new MalchusPropertyInputSync/);
	assert.match(ohrPanel, /revealPropertyGroups/);
	assert.doesNotMatch(ohrPanel, /new THREE\./);
});
