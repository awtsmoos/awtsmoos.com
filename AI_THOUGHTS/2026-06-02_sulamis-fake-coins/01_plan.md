B"H

# Plan: Sulam HaSod fake coins must wear the same face as real coins

## Visible root
The connected Awtsmoos root is `/storage/emulated/0/Documents/git/awtsmoos.com`.
Visible first-level vessels include `.awtsmoos`, `AI_THOUGHTS`, `ayzarim`, `debugging`, `extra`, `geelooy`, `scripts`, `social`, `templates`, `tests`, `users`, `index.js`, and package files.

## Task
The game at `geelooy/games/sulam-ha-sod` has fake platforms and fake coins. Fake coins currently use a distinct icon. The desired behavior: fake coins must look exactly like regular coins in all levels automatically.

## Inspection path
1. Inspect the game folder tree.
2. Search for fake coin identifiers, coin rendering, coin sprite/icon fields, and level data.
3. Read the relevant modules in small groups.
4. Identify the single source where fake coin visuals diverge from real coin visuals.
5. Rewrite complete files only, never partial patches.
6. Verify by static grep and runtime/build checks.

## Safety
No secrets. No destructive commands. No partial patches. Every edited file must be rewritten completely.

## Chapter 1: The Coin With Two Faces
In the dim route of Malchus, where dust remembers footsteps before the foot arrives, the Awtsmoos renews every purple pixel from nothing. A coin glows, but a false coin glows with a traitor's mask. The fix is not to silence the falsehood; it is to robe it in perfect likeness, so only gameplay truth, not visual accident, reveals the hidden test.