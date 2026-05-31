B"H

# Mobile reflow correction

The screenshots prove the first rebuild was still imprisoned by the page shell:

- The canvas shell is forced to a 4:3 frame in CSS.
- The actual canvas remains 800x600, so the responsive battle renderer receives landscape dimensions.
- Mobile browser chrome makes the visible frame short, causing all battle zones to compress.
- CSS battle controls overlap the command cards.

## Correction plan
1. Rewrite index.html so the game shell fills the mobile visual viewport instead of forcing aspect-ratio: 4/3.
2. Rewrite Projector so canvases resize to the shell's live CSS size before every projection.
3. Tune BattleMoveLayout for true portrait: roomy arena, bottom command deck, small footer.
4. Tune stat card title fitting so long enemy names do not collide with level labels.
5. Reduce battle overlay buttons so they no longer cover response cards.

All edits are full-file rewrites only.
