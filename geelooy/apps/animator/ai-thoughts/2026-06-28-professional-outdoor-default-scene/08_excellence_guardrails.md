# B"H

# Excellence Guardrails

The continuation pass did not merely add more code. It added guards so the outdoor default scene remains excellent after future edits.

## Added contract smoke

Created:

`/storage/emulated/0/Documents/git/awtsmoos.com/geelooy/apps/animator/tools/verify/outdoorProfessionalSceneContractSmoke.js`

Script:

```bash
npm run verify:outdoor-scene-contract
```

This verifies:

- outdoor parallax depth
- weather light-beat count
- expression maps for every character
- required props
- required cameras
- ascending camera times
- source beats preserve weather cues
- compiled events preserve prop events
- lightning moments exist

## Added file health smoke

Created:

`/storage/emulated/0/Documents/git/awtsmoos.com/geelooy/apps/animator/tools/verify/outdoorProfessionalFileHealthSmoke.js`

Script:

```bash
npm run verify:outdoor-file-health
```

This verifies:

- every outdoor scene and outdoor renderer file remains under 120 lines
- every checked file begins with `// B"H`
- blocked external style-name terms do not appear in checked source

## Suite integration

`verify:goal-board-smokes` now includes:

```bash
npm run verify:outdoor-professional-default
npm run verify:outdoor-scene-contract
npm run verify:outdoor-file-health
```

## Final proof run

Passed:

```bash
npm run verify:goal-board-smokes
```

The Awtsmoos did not leave excellence as a feeling. It became a command that can fail if the vessel is damaged.
