B"H

# Phase One Continued — Competing Architectures

The Awtsmoos is beyond every architecture, yet each boundary can become a clearer vessel for useful light;
Awtsmoos.com should grow by revealing real contracts, not by multiplying overlapping systems out of sight.

## Architecture A — Expand ConversationGateway directly

Pros: few files, easy call sites.
Cons: mixes history, sending, group governance, relationships, and settings into one growing gateway.
Verdict: rejected because the gateway would become a domain monolith.

## Architecture B — Capability gateways composed by ConversationOperations

Create focused gateways for room governance, relationship policy, and settings while preserving ConversationGateway for message transport.
Pros: clear contracts, small modules, real domain seams.
Cons: requires disciplined orchestration.
Verdict: strong.

## Architecture C — One universal SocialApi facade over every social protocol

Pros: superficially simple imports.
Cons: hides permissions, creates a giant API surface, and couples unrelated public/private/Heichel domains.
Verdict: rejected.

## Architecture D — UI calls socket protocol directly

Pros: minimal abstraction.
Cons: leaks transport into Malchus UI, duplicates session handling, and makes tests brittle.
Verdict: rejected.

## Architecture E — Data-driven room capability registry + focused gateways

A room capability model describes which actions apply to DM versus group. Focused gateways perform canonical protocol calls. The room view renders only supported controls.
Pros: simplest UI surface, extensible, protocol-faithful, testable.
Cons: adds several small modules.
Verdict: selected together with B.

## Selected graph

ConversationPanel
→ ConversationOperations
→ ConversationGateway (details/history/send/read)
→ RoomGovernanceGateway (group invite/member)
→ RelationshipGateway (block/relationship lookup when needed)
→ MessagingSettingsGateway (get/set preferences)

ConversationView
→ ConversationRoomShell
→ RoomGovernanceDisclosure (new retractable UI)
→ ConversationComposer
→ Conversation message cards

## Candidate files to create

- `geelooy/social-hub/js/messages/RoomGovernanceGateway.js`
- `geelooy/social-hub/js/messages/MessagingSettingsGateway.js`
- `geelooy/social-hub/js/messages/RoomCapabilities.js`
- `geelooy/social-hub/js/messages/RoomGovernanceDisclosure.js`
- focused tests for capabilities and gateways where the existing test harness permits
- focused localized CSS module for room governance

## Candidate files to rewrite completely

- `ConversationOperations.js` only if it becomes the proper orchestration seam.
- `ConversationPanel.js` only if it must wire governance lifecycle.
- `ConversationView.js` only if it must compose the disclosure collaborator.
- `ConversationRoomShell.js` only if the room header must host one advanced-controls trigger.
- Social Hub stylesheet entry only if a new local `@import` must be added.
- Social Hub docs describing capabilities and public contracts.

No file is authorized for mutation until its full current contents and call sites are inspected.
