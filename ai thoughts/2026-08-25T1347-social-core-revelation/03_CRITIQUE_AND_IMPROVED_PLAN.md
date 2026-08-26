B"H

# Phase Two — Critique and Improved Plan

The Awtsmoos renews both possibility and boundary; Chesed without Gevurah becomes flood, Gevurah without Chesed becomes stone;
Awtsmoos.com should reveal social power through measured capability, so every advanced room remains calm when left alone.

## Twenty improvements to the first plan

1. Do not expose group controls to DMs; derive capabilities from canonical `conversation.kind`.
2. Do not invent role names until actual group detail payloads confirm them.
3. Keep message transport and room governance in separate gateways.
4. Centralize session readiness so gateways do not diverge in open-session behavior.
5. Keep room controls closed by default on mobile.
6. Use native disclosure semantics where practical before custom modal infrastructure.
7. Avoid fixed positioning unless the existing Social Hub shell already owns an overlay layer.
8. Add `aria-expanded`, `aria-controls`, and clear status copy for advanced controls.
9. Render member actions only when server-provided capability/role evidence permits them.
10. Avoid optimistic membership mutation unless the canonical store has a proven update contract.
11. Re-fetch room details after successful governance mutations rather than guessing local truth.
12. Keep invitation input bounded and explicitly validated before transport.
13. Provide busy and error states without replacing the message history.
14. Ensure advanced controls never intercept message scrolling when closed.
15. Add reduced-motion behavior to disclosure animation.
16. Add focus-visible and active states to every new trigger, action, field, and member control.
17. Add long-name overflow protection to member lists and room metadata.
18. Keep all selectors beneath `.social-hub-document` plus a room-specific class.
19. Preserve current URL/history behavior and composer lifecycle completely.
20. Document the public gateway method shapes so later Heichel/mail integrations can reuse the same API philosophy.

## Improved architecture

Rather than make `ConversationOperations` know every protocol event, add a small `ConversationRoomService` that composes:

- existing `ConversationGateway` for message/history/read;
- `RoomGovernanceGateway` for group invite/member actions;
- `MessagingSettingsGateway` for private-messaging preferences.

`ConversationPanel` remains the lifecycle owner but receives one room-service object. The UI receives a normalized room capability model rather than raw protocol constants.

## Data flow

1. Open room.
2. Fetch canonical details/history through existing operations.
3. Derive `RoomCapabilities` from canonical room details + actor alias.
4. Render room identity and one compact “Room” disclosure trigger.
5. Opening disclosure lazily fetches settings or deeper governance state only if required.
6. Mutations call focused gateway methods.
7. After mutation, re-fetch canonical room details.
8. Re-render only the governance disclosure and room identity; preserve message scroll/composer state.

## Risk boundary

If current server details do not expose enough role/member authority to safely render destructive group-member controls, this wave will limit itself to non-destructive group invitations plus settings/block controls whose protocol contract is fully discoverable. Capability truth wins over feature ambition.
