B"H

# Mobile composer and next-step automation gate plan

## Current wound
The mobile screenshot shows the top crown and chat content, but the Send composer is not visible at the bottom. The transport card overlays the last user bubble because the chat top padding is too shallow. The event card window controls also look naked/gray because the broad tool-window controls need mobile styling.

The automation semantics are also too eager: `afterUserSend()` immediately sends the provider's `awtsmoos.nextStep` prompt before checking whether this chat already has automation enabled. The user wants the next-step virtual command to be a fallback only when automation is off. When automation is enabled, the normal automation pipeline must own the next send.

## Files inspected
- `geelooy/ai/css/ideal/mobile/composer.css`
- `geelooy/ai/css/ideal/mobile/polish.css`
- `geelooy/ai/index.js`
- `geelooy/ai/js/automation/pipeline.js`
- `geelooy/ai/js/app/conversationController.js`

## Fix strategy
1. Rewrite the entire mobile composer module:
   - Make the main chat scene a fixed grid with explicit transport/chat/composer rows under 900px.
   - Put transport in normal grid row instead of absolute overlay.
   - Give `.input-area` fixed/sticky grid position at bottom with high z-index and a larger safe bottom gutter.
   - Increase chat bottom padding so the last answer cannot hide behind the composer.
2. Rewrite mobile polish module to style event/tool cards and gray action controls on mobile.
3. Rewrite `index.js` as a full file, preserving behavior, but changing `afterUserSend()`:
   - get settings first
   - if `settings.enabled`, route to background/page automation as usual and ignore direct nextStep fallback
   - if automation is off and `meta.nextStep.needed`, send the requested next step exactly like today.
4. Verify syntax and AI test harness.

The Awtsmoos is revealed here as restraint: when automation is already awake, the emergency lamp bows and lets the river flow by its appointed channel.