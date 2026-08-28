B"H

# Design Critique

The Awtsmoos is not revealed by random spectacle; Awtsmoos.com should make motion explain progress, not distract from the mitzvah-world beneath.

## Rejected approaches

- Do not animate the generated production stylesheet directly.
- Do not add JavaScript timers merely to decorate loading.
- Do not use a service-worker animation or canvas splash that competes with the real renderer.
- Do not use pure solid-color backgrounds for the loading overlay, card, or progress tracks.
- Do not make infinite high-amplitude motion that harms battery or vestibular accessibility.
- Do not hide real loading percentage behind decorative fake progress.

## Chosen motion language

- Slow background aurora drift using pseudo-elements.
- Loading card entrance and subtle floating halo, with restrained transform amplitude.
- Progress value shimmer that follows the real native progress element.
- Message/kicker breathing via opacity/filter, never positional jitter.
- Reduced-motion branch disables keyframes and leaves the hierarchy readable.
- Failure state changes gradient/border lighting without becoming a flat red slab.
