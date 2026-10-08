//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file The 22 Hebrew letters as design principles.
 * @description Each letter of the aleph-beis carries a traditional meaning
 * (Talmud, Midrash, Sefer Yetzirah, the kabbalistic tradition). This module
 * maps every letter to one design principle and encodes that principle in
 * the Design OS constraint language, so a design can literally be built
 * "with the aleph-beis".
 *
 * Meanings below are paraphrased from traditional sources (cited per letter),
 * not invented. Where traditions differ, the most widely taught reading is used.
 *
 * Each record:
 *   key            machine key, also the DSL namespace (e.g. aleph.unity)
 *   hebrew         the letter itself
 *   name           English name
 *   gematria       numerical value
 *   meaning        traditional meaning (researched)
 *   sources        traditional sources for the meaning
 *   principle      design principle name
 *   principleDetail how the principle applies to visual design
 *   constraints    DSL source encoding the principle. Namespaced declarations
 *                  (aleph.unity = "on") are always satisfiable; inequalities
 *                  over design tokens are verified wherever those tokens exist
 *                  and are vacuous where they do not.
 */

export const LETTERS = [
	{
		key: "aleph",
		hebrew: "א",
		name: "Aleph",
		gematria: 1,
		meaning:
			"The silent letter; denotes the oneness of God (Alufo shel olam). " +
			"Chief of all letters, it did not clamor for honor at creation. " +
			"Read as 'aluf binah' — master understanding.",
		sources: ["Alphabet of Rabbi Akiva", "Shabbat 104a", "Sefer Yetzirah"],
		principle: "Unity",
		principleDetail:
			"One clear hierarchy, never fragmented. The eye meets a single " +
			"order of importance: title above section above body, each " +
			"unmistakably ranked. As the Aleph is One, the layout is one.",
		constraints: `
aleph.unity = "on"
title.fontSize > section.fontSize
section.fontSize > body.fontSize
`.trim(),
	},
	{
		key: "beis",
		hebrew: "ב",
		name: "Beis",
		gematria: 2,
		meaning:
			"House (bayit); blessing (berachah); understanding (binah). " +
			"Value two: with creation begins multiplicity — and the world " +
			"becomes a dwelling place.",
		sources: ["Alphabet of Rabbi Akiva", "Bereishis Rabbah 1"],
		principle: "Containment",
		principleDetail:
			"Content dwells in clear containers, as the world dwells in the " +
			"house. Bounded measure, breathing padding — nothing spills " +
			"formlessly across the page.",
		constraints: `
beis.containment = "on"
container.maxWidth <= 1280px
container.padding >= 12px
`.trim(),
	},
	{
		key: "gimmel",
		hebrew: "ג",
		name: "Gimmel",
		gematria: 3,
		meaning:
			"Camel — motion and balance between opposites; gemilut chasadim, " +
			"loving-kindness. Its leg stretches forward: the giver runs " +
			"after the poor (the daled) to give.",
		sources: ["Shabbat 104a", "Alphabet of Rabbi Akiva"],
		principle: "Generosity",
		principleDetail:
			"Give the content room to breathe. Generous line-height and " +
			"section spacing — the design gives to the reader the way the " +
			"gimmel runs to give.",
		constraints: `
gimmel.generosity = "on"
body.lineHeight >= 1.6 * body.fontSize
section.spacing >= 24px
`.trim(),
	},
	{
		key: "daled",
		hebrew: "ד",
		name: "Daled",
		gematria: 4,
		meaning:
			"Door (delet); the poor person (dal), who waits behind the door " +
			"for kindness. The door is the threshold between outside and in.",
		sources: ["Shabbat 104a", "Alphabet of Rabbi Akiva"],
		principle: "Openness",
		principleDetail:
			"Every door opens. Every interactive element is reachable and " +
			"operable — visible focus, generous touch targets. No one is " +
			"left standing outside the door.",
		constraints: `
daled.openness = "on"
focus.visible = "on"
interactive.minTouch >= 44px
`.trim(),
	},
	{
		key: "hei",
		hebrew: "ה",
		name: "Hei",
		gematria: 5,
		meaning:
			"Behold; revelation. The letter of God's name — the breath that " +
			"reveals. What was hidden becomes seen.",
		sources: ["Shabbat 104a", "Zohar"],
		principle: "Clarity",
		principleDetail:
			"Nothing hidden, everything revealed. Text stands in full " +
			"contrast against its ground — body text at 4.5:1, titles at " +
			"7:1. Behold the words: they can actually be read.",
		constraints: `
hei.clarity = "on"
contrast(body.color, body.background) >= 4.5
contrast(title.color, title.background) >= 7.0
`.trim(),
	},
	{
		key: "vav",
		hebrew: "ו",
		name: "Vav",
		gematria: 6,
		meaning:
			"Hook; the word 'and'. The connector — it joins heaven and " +
			"earth, one thing to the next. Also a letter of the Divine name.",
		sources: ["Shabbat 104a", "Sefer Yetzirah"],
		principle: "Connection",
		principleDetail:
			"One rhythm ties all spacing together. Every gap derives from a " +
			"single base unit, the way the vav hooks each word to the next. " +
			"No arbitrary distances.",
		constraints: `
vav.connection = "on"
section.spacing = 3 * space.unit
container.padding = 2 * space.unit
`.trim(),
	},
	{
		key: "zayin",
		hebrew: "ז",
		name: "Zayin",
		gematria: 7,
		meaning:
			"Weapon; also sustenance (mazon) held in God's hand; crowned " +
			"letter. Sharp, decisive, exact.",
		sources: ["Shabbat 104a", "Alphabet of Rabbi Akiva"],
		principle: "Precision",
		principleDetail:
			"Sharp and exact — no blurry half-pixels. Type sizes land on " +
			"whole pixels so every edge renders crisp, like the edge of " +
			"the zayin's sword.",
		constraints: `
zayin.precision = "on"
`.trim(),
	},
	{
		key: "ches",
		hebrew: "ח",
		name: "Ches",
		gematria: 8,
		meaning:
			"Fence; enclosure; life (chai). The fence guards the garden — " +
			"protection that makes life inside possible.",
		sources: ["Sefer Yetzirah", "Maharal"],
		principle: "Protection",
		principleDetail:
			"The fence guards the text: content has defined boundaries — a " +
			"bounded container with real padding — so lines never run wild " +
			"and the reader rests inside a protected space.",
		constraints: `
ches.protection = "on"
`.trim(),
	},
	{
		key: "tes",
		hebrew: "ט",
		name: "Tes",
		gematria: 9,
		meaning:
			"Goodness (tov); clay (tit) — the earth from which resurrection " +
			"comes. The good that is buried and rises.",
		sources: ["Alphabet of Rabbi Akiva", "Shabbat 104a"],
		principle: "Goodness",
		principleDetail:
			"The design does good: it honors those who need stillness. " +
			"Reduced-motion preferences are respected — no animation " +
			"assaults the sensitive reader.",
		constraints: `
tes.goodness = "on"
motion.reduced = "respect"
`.trim(),
	},
	{
		key: "yud",
		hebrew: "י",
		name: "Yud",
		gematria: 10,
		meaning:
			"Hand (yad); the smallest letter — a single point, the dot from " +
			"which all writing begins. Humility that starts everything.",
		sources: ["Alphabet of Rabbi Akiva", "Menachos 29b"],
		principle: "Humility",
		principleDetail:
			"Small text is cared for like large text. Footnotes and " +
			"captions stay legible (never below 12px) yet humbly smaller " +
			"than the body — the yud does not pretend to be an aleph.",
		constraints: `
yud.humility = "on"
footnote.fontSize >= 12px
footnote.fontSize < body.fontSize
`.trim(),
	},
	{
		key: "kaf",
		hebrew: "כ",
		name: "Kaf",
		gematria: 20,
		meaning:
			"Palm (kaf) — the hollow of the hand that gives and receives. " +
			"Bent in humility, straight in dignity: two forms, one hand.",
		sources: ["Alphabet of Rabbi Akiva"],
		principle: "Receptivity",
		principleDetail:
			"The open palm receives every guest: the layout holds together " +
			"at the smallest phone width. Bent or straight, humble or " +
			"upright — every device is welcomed.",
		constraints: `
kaf.receptivity = "on"
layout.minWidth <= 360px
`.trim(),
	},
	{
		key: "lamed",
		hebrew: "ל",
		name: "Lamed",
		gematria: 30,
		meaning:
			"Learning (limud); heart (lev). The tallest letter — it alone " +
			"rises above the line, reaching upward.",
		sources: ["Alphabet of Rabbi Akiva", "Sefer Yetzirah"],
		principle: "Aspiration",
		principleDetail:
			"Reach upward. The title rises high above the body — at least " +
			"twice its size — lifting the reader's eyes and heart the way " +
			"the lamed rises above every other letter.",
		constraints: `
lamed.aspiration = "on"
title.fontSize >= 2 * body.fontSize
`.trim(),
	},
	{
		key: "mem",
		hebrew: "מ",
		name: "Mem",
		gematria: 40,
		meaning:
			"Water (mayim); kingdom (malchut). Open mem reveals, closed mem " +
			"conceals — both are water, both are true.",
		sources: ["Alphabet of Rabbi Akiva", "Shabbat 104a"],
		principle: "Flow",
		principleDetail:
			"Content flows like water. Text containers never dam the flow " +
			"with fixed heights; the layout is fluid, open and closed " +
			"states both honored.",
		constraints: `
mem.flow = "on"
layout.fluid = "on"
`.trim(),
	},
	{
		key: "nun",
		hebrew: "נ",
		name: "Nun",
		gematria: 50,
		meaning:
			"Fish — it lives in the deep; falling (nofel) and rising; the " +
			"light (ner) of God is the soul of man; fifty gates of " +
			"understanding.",
		sources: ["Alphabet of Rabbi Akiva", "Mishlei 20:27"],
		principle: "Depth",
		principleDetail:
			"Go deep and return. A page that descends into depth must " +
			"surface again with a clear ending — the footer closes the " +
			"dive, as the fish returns from the deep.",
		constraints: `
nun.depth = "on"
footer.present = "on"
`.trim(),
	},
	{
		key: "samech",
		hebrew: "ס",
		name: "Samech",
		gematria: 60,
		meaning:
			"Support — 'God supports (somech) all who fall.' The closed " +
			"circle: what is inside is held, nothing drops through.",
		sources: ["Tehillim 145:14", "Alphabet of Rabbi Akiva"],
		principle: "Support",
		principleDetail:
			"Nothing is left unsupported. Type always lands on a fallback " +
			"stack — if the first choice falls, the next catches it, the " +
			"way the samech catches all who fall.",
		constraints: `
samech.support = "on"
`.trim(),
	},
	{
		key: "ayin",
		hebrew: "ע",
		name: "Ayin",
		gematria: 70,
		meaning: "Eye. The organ of sight — what the eye meets first, and how it travels.",
		sources: ["Sefer Yetzirah", "Alphabet of Rabbi Akiva"],
		principle: "Vision",
		principleDetail:
			"Guide the eye: the most important element carries the " +
			"strongest contrast. The title outshines the body, so the eye " +
			"lands where it matters first.",
		constraints: `
ayin.vision = "on"
contrast(title.color, title.background) >= contrast(body.color, body.background)
`.trim(),
	},
	{
		key: "pei",
		hebrew: "פ",
		name: "Pei",
		gematria: 80,
		meaning: "Mouth (peh). Speech — the vessel of the voice; what is spoken must be heard.",
		sources: ["Sefer Yetzirah", "Alphabet of Rabbi Akiva"],
		principle: "Voice",
		principleDetail:
			"The design speaks: body text at a full, audible 16px or more. " +
			"A mouth that whispers is no mouth — type too small to read is " +
			"type that does not speak.",
		constraints: `
pei.voice = "on"
body.fontSize >= 16px
`.trim(),
	},
	{
		key: "tzadi",
		hebrew: "צ",
		name: "Tzadi",
		gematria: 90,
		meaning:
			"The righteous one (tzaddik) — bent in this world, straight in " +
			"the next. Justice: the balanced scale.",
		sources: ["Alphabet of Rabbi Akiva", "Shabbat 104a"],
		principle: "Balance",
		principleDetail:
			"Balanced and just: symmetric breathing room, left equal to " +
			"right. Nothing lopsided, nothing favoring one side — the " +
			"tzaddik's scale hangs even.",
		constraints: `
tzadi.balance = "on"
container.paddingLeft = container.paddingRight
`.trim(),
	},
	{
		key: "kuf",
		hebrew: "ק",
		name: "Kuf",
		gematria: 100,
		meaning:
			"Holy (kadosh) — set apart; the back of the head, the unseen. " +
			"Holiness is separation: the sacred is not mixed with the mundane.",
		sources: ["Shabbat 104a", "Zohar"],
		principle: "Sanctity",
		principleDetail:
			"The sacred is set apart. Holy content — verses, names, " +
			"blessings — receives generous surrounding space, separated " +
			"from the ordinary flow as the kadosh is separated.",
		constraints: `
kuf.sanctity = "on"
sacred.spacing >= 48px
`.trim(),
	},
	{
		key: "reish",
		hebrew: "ר",
		name: "Reish",
		gematria: 200,
		meaning:
			"Head (rosh); beginning. The head leads the body; every journey " +
			"starts with a single head.",
		sources: ["Sefer Yetzirah", "Alphabet of Rabbi Akiva"],
		principle: "Leadership",
		principleDetail:
			"One head leads: exactly one title crowns the page. Two heads " +
			"argue; one head leads the reader in a clear direction from " +
			"the very beginning.",
		constraints: `
reish.leadership = "on"
title.count = 1
`.trim(),
	},
	{
		key: "shin",
		hebrew: "ש",
		name: "Shin",
		gematria: 300,
		meaning:
			"Tooth (shen); Shaddai — the name written on the mezuzah; fire. " +
			"Three flames rising from one base: energy with a single root.",
		sources: ["Sefer Yetzirah", "Zohar", "Menachos 29b"],
		principle: "Energy",
		principleDetail:
			"Warmth and vitality: the accent color carries fire — warm, " +
			"red-dominant, alive. Three flames, one root: energy in " +
			"service of the whole, never decoration for its own sake.",
		constraints: `
shin.energy = "on"
accent.warmth = "fire"
`.trim(),
	},
	{
		key: "tav",
		hebrew: "ת",
		name: "Tav",
		gematria: 400,
		meaning:
			"Mark, sign; truth (emes: aleph-mem-tav) — its letters stand on " +
			"broad bases, so truth stands firm while falsehood (sheker) " +
			"falls. The last letter: completion, the seal.",
		sources: ["Shabbat 104a", "Alphabet of Rabbi Akiva"],
		principle: "Truth",
		principleDetail:
			"True and finished: the layout stands firm — no shifting under " +
			"the reader's eyes, no loose ends. Like the letters of emes, " +
			"the design has broad bases and does not fall.",
		constraints: `
tav.truth = "on"
layout.shift = "none"
`.trim(),
	},
];

/** Look up a letter by its key. */
export function getLetter(key) {
	return LETTERS.find((l) => l.key === key) || null;
}

/** All letter keys in aleph-beis order. */
export function listLetters() {
	return LETTERS.map((l) => l.key);
}
