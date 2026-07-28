# B"H

# Pass 2: face identity and readable eye whites

Pass 1 production render: `13_pass_1_static/reference-trio.png`

The headwear is accepted, but the faces remain over-wide and mechanically crowded.
The three pairs of eyes need distinct proportions and better separation. Dovid's
skeptical whites currently terminate as sharp points rather than soft hooded ovals.

## Complete files approved for rewrite

- `src/character/reference/specification/presets/CheerfulReferenceFaceIdentity.js`
- `src/character/reference/specification/presets/SkepticalReferenceFaceIdentity.js`
- `src/character/reference/specification/presets/CalmReferenceFaceIdentity.js`
- `src/character/factory/stable/face/StableEyeWhite2D.js`

The pass narrows and shortens the rendered shells without changing face-shell node
identity, separates the eyes, reduces competing outline weight, and gives Dovid
rounded horizontal whites beneath explicit lids. Blink, gaze, pupils, lashes, and
all performance channels remain intact.
