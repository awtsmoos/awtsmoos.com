// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module HeichelArchetypeContractTest
 * @description
 * The Awtsmoos verifies one searchable roof and distinct Written/Oral source
 * constellations derived from real Ikar data rather than fabricated feed cards.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = path => readFileSync(`geelooy/${path}`, "utf8");
const roof = read("heichelos/heichel/modules/ui/blueprints/layout-roof.js");
const shell = read("heichelos/heichel/modules/ui/blueprints/layout-shell.js");
const archetypes = read("heichelos/heichel/modules/cosmic/card-archetypes.js");
const interactions = read("heichelos/heichel/modules/cosmic/interactions.js");
const manifest = read("style/heichelos/heichel/cosmic-profile/index.css");
const topbar = read("style/heichelos/heichel/cosmic-profile/topbar.css");
const responsive = read("style/heichelos/heichel/cosmic-profile/roof-responsive.css");
const cover = read("style/heichelos/heichel/cosmic-profile/cover-effects.css");
const constellation = read("style/heichelos/heichel/cosmic-profile/series-constellation.css");

const SOURCES = Object.freeze({
	"heichelos/heichel/modules/ui/blueprints/layout-roof.js": roof,
	"heichelos/heichel/modules/ui/blueprints/layout-shell.js": shell,
	"heichelos/heichel/modules/cosmic/card-archetypes.js": archetypes,
	"heichelos/heichel/modules/cosmic/interactions.js": interactions,
	"style/heichelos/heichel/cosmic-profile/topbar.css": topbar,
	"style/heichelos/heichel/cosmic-profile/roof-responsive.css": responsive,
	"style/heichelos/heichel/cosmic-profile/cover-effects.css": cover,
	"style/heichelos/heichel/cosmic-profile/series-constellation.css": constellation
});

test("the roof contains real searchable and identity controls", () => {
	assert.match(roof, /class: 'heichel-global-search'/);
	assert.match(roof, /action: '\/search'/);
	assert.match(roof, /method: 'get'/);
	assert.match(roof, /name: 'q'/);
	assert.match(roof, /heichel-roof-messages/);
	assert.match(roof, /heichel-roof-profile/);
	assert.match(roof, /topbarHeichelTitle/);
	assert.match(roof, /topbarHeichelContext/);
	assert.match(shell, /export \{ topbar \} from '.\/layout-roof\.js'/);
});

test("real series titles select Written and Oral archetypes", () => {
	assert.match(archetypes, /includes\('written'\)/);
	assert.match(archetypes, /includes\('oral'\)/);
	assert.match(archetypes, /dataset\.seriesArchetype/);
	assert.match(archetypes, /series-source-constellation/);
	assert.match(interactions, /import \{ markCosmicCard \}/);
	assert.match(interactions, /forEach\(markCosmicCard\)/);
});

test("Written and Oral constellations use distinct semantic colors", () => {
	assert.match(constellation, /data-series-archetype="written"/);
	assert.match(constellation, /data-series-archetype="oral"/);
	assert.match(constellation, /Canonical written source/);
	assert.match(constellation, /Living oral tradition/);
	assert.match(constellation, /heichel-cosmic-cyan-core/);
	assert.match(constellation, /heichel-cosmic-magenta-core/);
	assert.match(constellation, /series-source-constellation i:nth-child\(5\)/);
});

test("the roof and source lattice are loaded by the final manifest", () => {
	for (const name of ["topbar", "roof-responsive", "cover-effects", "series-constellation"]) {
		assert.ok(manifest.includes(`./${name}.css`), `manifest missing ${name}`);
	}
	assert.match(topbar, /grid-template-columns: auto minmax\(16rem, 1fr\)/);
	assert.match(responsive, /@media \(max-width: 35rem\)/);
	assert.match(cover, /content: "א  ב  ג/);
});

test("every focused source remains under 120 lines", () => {
	for (const [path, source] of Object.entries(SOURCES)) {
		assert.ok(source.split("\n").length <= 120, `${path} exceeds 120 lines`);
	}
});
