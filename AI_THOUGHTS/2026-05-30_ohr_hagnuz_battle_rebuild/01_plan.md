B"H

# Ohr Hagnuz battle rebuild plan

The battle must stop being an 800x600 debug chamber and become a portrait-first RPG command scene.

## Working facts inspected
- The project root is awtsmoos.com.
- The target folder is geelooy/games/ohr-hagnuz.
- Current battle renderer imports BattleTheme, BattleCards, BattleStage, BattleMoveCards, and BattleMoveLayout.
- Current renderer uses fixed desktop coordinates and glyph combatants.

## Immediate coding plan
1. Replace the battle layout module with a responsive layout engine that accepts canvas dimensions.
2. Replace theme tokens with richer visual language: midnight, gold, purple, glass, bloom, font stacks.
3. Rewrite stat cards for real RPG mobile hierarchy.
4. Rewrite stage to be full-canvas and dimensional, not boxed 800x600.
5. Rewrite move cards as premium response cards with touch target scale.
6. Add sprite-style combatant presenter instead of tiny glyph presentation in battle renderer.
7. Rewrite BattleRenderer to orchestrate zones from layout, not own coordinates.
8. Verify imports with node syntax checks.

## Safety
No partial patching. Every modified file is rewritten in full. No secret files. No destructive commands.
