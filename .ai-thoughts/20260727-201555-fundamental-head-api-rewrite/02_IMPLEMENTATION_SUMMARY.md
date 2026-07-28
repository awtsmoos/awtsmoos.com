# B"H — Implementation Summary

The old renderer positioned eyes, brows, nose, mouth, cheeks, beard, and ears on
unrelated private grids, then translated the entire feature group to compensate.
That system was replaced by `StableFaceLandmarkLayout`, a normalized anatomical
map derived from the actual skull shell.

All primary facial systems now consume the same skull landmarks. The feature-group
translation hack is gone. Mouth articulation and beard apertures share the same
mouth geometry, while blinking, gaze, brows, phonemes, serialization, and production
export remain live.

Character identities were re-authored against that API:

- Ari: broad rounded skull, open circular eyes, small crown kippah, visible hair,
  loose peyot, cheek-following beard, and a larger readable laugh.
- Dovid: compact tapered skull, hooded sideways eyes, unequal brows, jaw-bound short
  beard, compact torso, and organic unequal crossed-arm overlap.
- Miriam: soft oval skull, separated attentive eyes, side fringe, skull-following
  wrap, visible bun, rose lips, centered overshirt, weighted skirt, and pocket pose.

The final render remains original editable vector geometry in the authoritative
production graph. No reference pixels are embedded anywhere in character data.
