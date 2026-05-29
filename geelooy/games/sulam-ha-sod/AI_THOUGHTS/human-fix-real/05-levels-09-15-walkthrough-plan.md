B"H

# Levels 9-15 manual pass

## Findings

Active campaign files are:

- `level09-chochmah.js`
- `level10-keter.js`
- `level11-daas.js`
- `level12-ayin.js`
- `level13-atika.js`
- `level14-einsof.js`
- `level15-razor-ayin.js`

Manual route walk:

- Levels 9-12 are readable but use a lot of fast boosters, ice, baitShift, dodgePlatform, and orbit pressure in sequence.
- Level 9 has duplicated trick platforms and duplicated trick coins/fake coins.
- Levels 13-15 contain duplicated platform bands/end shelves. They still pass tests, but human reading suffers because visual clutter looks like accidental geometry.
- Levels 13-15 are meant to be harsh, so the goal is not easy mode. The goal is removing accidental duplication and giving recovery width after high-speed tricks.

## Fix strategy

- Rewrite complete files only.
- Preserve names, laws, coins, keys, enemies, triggers, and level identities.
- Widen main route shelves from around 190-240 to roughly 205-285 where needed.
- Widen/lower early sky route supports to match the active 2-8 readability language.
- Remove duplicated trick/platform/fake entries.
- Slightly reduce boost speeds, rotor throw, enemy speed, runner speed, and falling tooth speed.
- Keep the final levels sharper than 1-8.

## Expected result

Levels 9-15 should feel like the next chapter: faster and more demanding than 1-8, but no longer noisy with accidental duplicates or stacked unreadable speed pressure.

Chapter: The Awtsmoos entered the hall of flash and crown. It did not quench the fire; it arranged the flames into letters the player can read while running.
