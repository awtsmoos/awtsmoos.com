# Designing with the Aleph-Beis

B"H

> "God looked into the Torah and created the world." — Zohar
>
> The letters are older than the world. This guide shows how to design with them.

## The idea

Every Hebrew letter carries a traditional meaning — oneness, house, kindness,
door, revelation, connection, and so on through all twenty-two. Each meaning
becomes one **design principle**, and each principle is encoded two ways:

1. **As constraints** in the Design OS constraint language (`letters.mjs`),
   so a design program can literally declare `hei.clarity = "on"` and be held
   to measurable rules (contrast ratios, type scales, spacing rhythms).
2. **As verifiers** (`checks.mjs`), so any solved design can be audited:
   which letters does it embody, which does it violate, which are silent?

Silence is not a violation. A check only applies when the design defines the
tokens the principle speaks about.

## Quick start

```js
import { checkDesign, designWithLetters, describeLetters } from "./index.mjs";

// Audit a design against all 22 letters
const report = checkDesign(`
  body.fontSize = 16px
  body.lineHeight = 28px
  title.fontSize = 64px
  section.fontSize = 32px
  body.color = #2b2118
  body.background = #fff8ee
`);
console.log(report.score); // { passed: 22, applicable: 22, ratio: 1 }
for (const l of report.letters.filter((x) => x.applicable && !x.pass))
  console.log("VIOLATION:", l.detail);

// Build with the letters: design first, letters fill and verify
const built = designWithLetters(mySource, ["aleph", "hei", "gimmel", "tav"]);
```

## The composition rule

When letter principles are appended to a design program, **the designer's own
source comes first**. The solver honors the first `=` definition it sees, so:

- Letter `=` lines only fill what the design leaves unsaid (defaults).
- Letter inequalities (`>=`, `<=`, `>`, `<`, `!=`) still verify what the
  design does say — a cramped line-height fails `gimmel` even though the
  designer wrote it.

The designer's word is first; the letters fill what is unsaid and judge what
is said.

## The twenty-two principles

Each letter: its traditional meaning, the design principle drawn from it, the
constraints that encode it, and the sources for the meaning.

---

### א Aleph (1) — Unity

*The silent letter; denotes the oneness of God (Alufo shel olam). Chief of all letters, it did not clamor for honor at creation. Read as 'aluf binah' — master understanding.*

One clear hierarchy, never fragmented. The eye meets a single order of importance: title above section above body, each unmistakably ranked. As the Aleph is One, the layout is one.

```
aleph.unity = "on"
title.fontSize > section.fontSize
section.fontSize > body.fontSize
```

Sources: Alphabet of Rabbi Akiva; Shabbat 104a; Sefer Yetzirah

### ב Beis (2) — Containment

*House (bayit); blessing (berachah); understanding (binah). Value two: with creation begins multiplicity — and the world becomes a dwelling place.*

Content dwells in clear containers, as the world dwells in the house. Bounded measure, breathing padding — nothing spills formlessly across the page.

```
beis.containment = "on"
container.maxWidth <= 1280px
container.padding >= 12px
```

Sources: Alphabet of Rabbi Akiva; Bereishis Rabbah 1

### ג Gimmel (3) — Generosity

*Camel — motion and balance between opposites; gemilut chasadim, loving-kindness. Its leg stretches forward: the giver runs after the poor (the daled) to give.*

Give the content room to breathe. Generous line-height and section spacing — the design gives to the reader the way the gimmel runs to give.

```
gimmel.generosity = "on"
body.lineHeight >= 1.6 * body.fontSize
section.spacing >= 24px
```

Sources: Shabbat 104a; Alphabet of Rabbi Akiva

### ד Daled (4) — Openness

*Door (delet); the poor person (dal), who waits behind the door for kindness. The door is the threshold between outside and in.*

Every door opens. Every interactive element is reachable and operable — visible focus, generous touch targets. No one is left standing outside the door.

```
daled.openness = "on"
focus.visible = "on"
interactive.minTouch >= 44px
```

Sources: Shabbat 104a; Alphabet of Rabbi Akiva

### ה Hei (5) — Clarity

*Behold; revelation. The letter of God's name — the breath that reveals. What was hidden becomes seen.*

Nothing hidden, everything revealed. Text stands in full contrast against its ground — body text at 4.5:1, titles at 7:1. Behold the words: they can actually be read.

```
hei.clarity = "on"
contrast(body.color, body.background) >= 4.5
contrast(title.color, title.background) >= 7.0
```

Sources: Shabbat 104a; Zohar

### ו Vav (6) — Connection

*Hook; the word 'and'. The connector — it joins heaven and earth, one thing to the next. Also a letter of the Divine name.*

One rhythm ties all spacing together. Every gap derives from a single base unit, the way the vav hooks each word to the next. No arbitrary distances.

```
vav.connection = "on"
section.spacing = 3 * space.unit
container.padding = 2 * space.unit
```

Sources: Shabbat 104a; Sefer Yetzirah

### ז Zayin (7) — Precision

*Weapon; also sustenance (mazon) held in God's hand; crowned letter. Sharp, decisive, exact.*

Sharp and exact — no blurry half-pixels. Type sizes land on whole pixels so every edge renders crisp, like the edge of the zayin's sword.

```
zayin.precision = "on"
```

Sources: Shabbat 104a; Alphabet of Rabbi Akiva

### ח Ches (8) — Protection

*Fence; enclosure; life (chai). The fence guards the garden — protection that makes life inside possible.*

The fence guards the text: content has defined boundaries — a bounded container with real padding — so lines never run wild and the reader rests inside a protected space.

```
ches.protection = "on"
```

Sources: Sefer Yetzirah; Maharal

### ט Tes (9) — Goodness

*Goodness (tov); clay (tit) — the earth from which resurrection comes. The good that is buried and rises.*

The design does good: it honors those who need stillness. Reduced-motion preferences are respected — no animation assaults the sensitive reader.

```
tes.goodness = "on"
motion.reduced = "respect"
```

Sources: Alphabet of Rabbi Akiva; Shabbat 104a

### י Yud (10) — Humility

*Hand (yad); the smallest letter — a single point, the dot from which all writing begins. Humility that starts everything.*

Small text is cared for like large text. Footnotes and captions stay legible (never below 12px) yet humbly smaller than the body — the yud does not pretend to be an aleph.

```
yud.humility = "on"
footnote.fontSize >= 12px
footnote.fontSize < body.fontSize
```

Sources: Alphabet of Rabbi Akiva; Menachos 29b

### כ Kaf (20) — Receptivity

*Palm (kaf) — the hollow of the hand that gives and receives. Bent in humility, straight in dignity: two forms, one hand.*

The open palm receives every guest: the layout holds together at the smallest phone width. Bent or straight, humble or upright — every device is welcomed.

```
kaf.receptivity = "on"
layout.minWidth <= 360px
```

Sources: Alphabet of Rabbi Akiva

### ל Lamed (30) — Aspiration

*Learning (limud); heart (lev). The tallest letter — it alone rises above the line, reaching upward.*

Reach upward. The title rises high above the body — at least twice its size — lifting the reader's eyes and heart the way the lamed rises above every other letter.

```
lamed.aspiration = "on"
title.fontSize >= 2 * body.fontSize
```

Sources: Alphabet of Rabbi Akiva; Sefer Yetzirah

### מ Mem (40) — Flow

*Water (mayim); kingdom (malchut). Open mem reveals, closed mem conceals — both are water, both are true.*

Content flows like water. Text containers never dam the flow with fixed heights; the layout is fluid, open and closed states both honored.

```
mem.flow = "on"
layout.fluid = "on"
```

Sources: Alphabet of Rabbi Akiva; Shabbat 104a

### נ Nun (50) — Depth

*Fish — it lives in the deep; falling (nofel) and rising; the light (ner) of God is the soul of man; fifty gates of understanding.*

Go deep and return. A page that descends into depth must surface again with a clear ending — the footer closes the dive, as the fish returns from the deep.

```
nun.depth = "on"
footer.present = "on"
```

Sources: Alphabet of Rabbi Akiva; Mishlei 20:27

### ס Samech (60) — Support

*Support — 'God supports (somech) all who fall.' The closed circle: what is inside is held, nothing drops through.*

Nothing is left unsupported. Type always lands on a fallback stack — if the first choice falls, the next catches it, the way the samech catches all who fall.

```
samech.support = "on"
```

Sources: Tehillim 145:14; Alphabet of Rabbi Akiva

### ע Ayin (70) — Vision

*Eye. The organ of sight — what the eye meets first, and how it travels.*

Guide the eye: the most important element carries the strongest contrast. The title outshines the body, so the eye lands where it matters first.

```
ayin.vision = "on"
contrast(title.color, title.background) >= contrast(body.color, body.background)
```

Sources: Sefer Yetzirah; Alphabet of Rabbi Akiva

### פ Pei (80) — Voice

*Mouth (peh). Speech — the vessel of the voice; what is spoken must be heard.*

The design speaks: body text at a full, audible 16px or more. A mouth that whispers is no mouth — type too small to read is type that does not speak.

```
pei.voice = "on"
body.fontSize >= 16px
```

Sources: Sefer Yetzirah; Alphabet of Rabbi Akiva

### צ Tzadi (90) — Balance

*The righteous one (tzaddik) — bent in this world, straight in the next. Justice: the balanced scale.*

Balanced and just: symmetric breathing room, left equal to right. Nothing lopsided, nothing favoring one side — the tzaddik's scale hangs even.

```
tzadi.balance = "on"
container.paddingLeft = container.paddingRight
```

Sources: Alphabet of Rabbi Akiva; Shabbat 104a

### ק Kuf (100) — Sanctity

*Holy (kadosh) — set apart; the back of the head, the unseen. Holiness is separation: the sacred is not mixed with the mundane.*

The sacred is set apart. Holy content — verses, names, blessings — receives generous surrounding space, separated from the ordinary flow as the kadosh is separated.

```
kuf.sanctity = "on"
sacred.spacing >= 48px
```

Sources: Shabbat 104a; Zohar

### ר Reish (200) — Leadership

*Head (rosh); beginning. The head leads the body; every journey starts with a single head.*

One head leads: exactly one title crowns the page. Two heads argue; one head leads the reader in a clear direction from the very beginning.

```
reish.leadership = "on"
title.count = 1
```

Sources: Sefer Yetzirah; Alphabet of Rabbi Akiva

### ש Shin (300) — Energy

*Tooth (shen); Shaddai — the name written on the mezuzah; fire. Three flames rising from one base: energy with a single root.*

Warmth and vitality: the accent color carries fire — warm, red-dominant, alive. Three flames, one root: energy in service of the whole, never decoration for its own sake.

```
shin.energy = "on"
accent.warmth = "fire"
```

Sources: Sefer Yetzirah; Zohar; Menachos 29b

### ת Tav (400) — Truth

*Mark, sign; truth (emes: aleph-mem-tav) — its letters stand on broad bases, so truth stands firm while falsehood (sheker) falls. The last letter: completion, the seal.*

True and finished: the layout stands firm — no shifting under the reader's eyes, no loose ends. Like the letters of emes, the design has broad bases and does not fall.

```
tav.truth = "on"
layout.shift = "none"
```

Sources: Shabbat 104a; Alphabet of Rabbi Akiva

---

## Reading the report

`checkDesign` returns per-letter results:

- **pass** — the design embodies the principle where it speaks.
- **applicable: false** — the design doesn't define the relevant tokens;
  silence is not a violation.
- **score** — passed / applicable. A design that defines nothing scores 1
  (vacuous); a design that defines much and honors it earns its score.

## Notes on the meanings

The meanings are paraphrased from traditional sources (Talmud Bavli Shabbat
104a, the Alphabet of Rabbi Akiva, Sefer Yetzirah, Zohar, Midrash). Where
traditions differ, the most widely taught reading is used. The mapping from
meaning to design principle is interpretive — that is the point: the letters
are a lens for seeing design, not a spec sheet.

*Designed with the aleph-beis, for the glory of the One who gave it.*
