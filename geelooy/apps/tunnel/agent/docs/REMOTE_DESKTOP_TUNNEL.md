B"H

# Remote Desktop Tunnel

This is the first shipping action surface for remote desktop orchestration in the Awtsmoos Tunnel agent. It intentionally does not perform silent OS capture or silent input injection. It creates a consent-first session ledger, WebRTC-style signaling slots, frame intake, input-event gates, and audit trails.

## Actions

- `remoteDesktopPolicy` returns allowed modes, TTL, and input types.
- `remoteDesktopCreateSession` creates a pending session.
- `remoteDesktopConsentStatus` returns consent and session state.
- `remoteDesktopGrantConsent` grants `watch` or `control` locally.
- `remoteDesktopOffer`, `remoteDesktopAnswer`, and `remoteDesktopIceCandidate` store redacted signaling events.
- `remoteDesktopFramePush` records a frame envelope for watch-only prototypes.
- `remoteDesktopInputEvent` accepts allowlisted input only after control is granted.
- `remoteDesktopAuditLog` returns recent audit entries.
- `remoteDesktopRevoke` closes the session.

## Required next UI layer

The local UI must show a visible consent prompt before calling `remoteDesktopGrantConsent`. Control mode must be a second explicit grant, not implied by watch mode. Every active session needs an always-visible indicator and one-click revoke.

## MVP ladder

1. Watch-only tab capture.
2. WebRTC signaling with heartbeat.
3. Frame preview in Tunnel Control.
4. Explicit control grant.
5. Input relay through allowlisted events.
6. Native screen helper only after platform-specific permission UX is designed.
