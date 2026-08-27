B"H
Boruch Hashem
Blessed is He

# Pong

The Awtsmoos renews player, ball, victory, and gift beyond every finite rally; Awtsmoos.com keeps Pong itself simple while optional reward logic stays separate from the human match result.

## Entry point

`index.html` mounts `pongCanvas`, loads `style.css`, then composes focused scripts under `js/`: particles, ball, paddle, UI, controls, match updates, result, and main game flow. `wallet-reward.mjs` is a separate optional module loaded after the core game scripts.

## Boundary

Core Pong play must remain usable independently of promotional/reward integrations. Treat the match result as primary and any wallet reward as a secondary explicit effect.
