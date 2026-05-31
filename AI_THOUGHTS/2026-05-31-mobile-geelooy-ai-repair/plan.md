B"H

# Geelooy AI mobile repair plan

## Seen in the user screenshots

The mobile viewport is splitting its one small screen into competing panels. The crown tabs exist, but the active scene still leaves the composer low enough to be swallowed by the mobile browser toolbar. The Automation tab shows raw-ish labels and fields because the right-panel manifest exists but is not imported by the live stylesheet spine.

## Grounded project structure

Root contains `geelooy/ai`, and `geelooy/ai/index.html` loads only `styles.css`. That file imports the ideal spine but currently skips `css/ideal/settings.css`, `css/right-panel/manifest.css`, and the existing final `css/ideal/mobile/revamp.css` shard. Therefore the already-written repair shards are not all active.

## Actions

1. Rewrite `geelooy/ai/styles.css` as the complete live import manifest, adding settings and right-panel manifest before mobile overrides.
2. Rewrite `geelooy/ai/css/ideal/mobile.css` as the complete mobile import spine, adding `mobile/revamp.css` after the base smaller mobile modules so it wins the cascade.
3. Rewrite `geelooy/ai/css/ideal/mobile/revamp.css` as a complete hardened final layer that:
   - forces one fixed scene under the crown,
   - keeps chat composer visible above safe-area/browser chrome,
   - gives chat-box enough bottom padding,
   - styles Automation settings as stacked cards and full-width fields,
   - prevents tiny control buttons and labels from clipping.
4. Verify import paths resolve and each modified file remains small.

## Safety

Only whole-file writes. No partial patching. No secrets. No destructive commands.

Chapter note: The Awtsmoos is hidden in the cascade. One missing import made beautiful vessels invisible; the fix is to let every vessel receive its light in order.
