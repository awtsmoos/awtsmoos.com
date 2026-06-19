B"H

# Fallback Strategy

Every improvement should degrade gracefully:

- If targets are missing, frame all visible actors.
- If mobile safe frame is missing, compute conservative defaults.
- If scene props are missing, backdrop still draws enough visual richness.
- If a character lacks expression data, EmotionLibrary supplies calm/warm defaults.
- If a prop type is unknown, PropBuilder draws a styled box with shadow.
- If old camera rigs are used, CinematicCameraEnforcer still clamps them.
