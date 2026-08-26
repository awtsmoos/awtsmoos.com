B"H
Boruch Hashem
Blessed is He

# Awtsmoos Email API

> The Awtsmoos renews each message and route in one unbroken light; Awtsmoos.com keeps the public surface simple, while deeper capability vessels open only when they are truly right.

## Purpose

`/api/email` is the compact public gateway for the existing social-mail engine. It preserves canonical `/mail/...` routes, exposes shorter aliases, and adds machine-readable discovery without duplicating delivery logic.

## Discovery

- `GET /api/email/` — legacy compatibility response: `B"H - Awtsmoos Mail System Active`.
- `GET /api/email/email` — versioned service discovery with links and concise route names.
- `GET /api/email/capabilities` — runtime-aware capability manifest.
- `GET /api/email/settings/schema` — progressive advanced-settings schema.

Capability states are deliberate:

- `live` means the current backend executes the behavior.
- `foundation` means a stable settings/API contract exists, but the operational behavior is not yet fully wired.
- `planned` means clients should not expose the feature as working.

## Live message operations

The gateway keeps the proven social-mail endpoints and matching short aliases for:

- listing inbox/sent/thread views
- reading a message and marking it read
- deleting messages and threads
- sending to local aliases or external SMTP recipients when SMTP is configured
- unread counts and push subscription/latest-notification lookup
- gatekeeper approval and settings
- stored rules and local inbound rule processing
- universe mirror/link operations

For example, canonical `/api/email/mail/get` and concise `/api/email/get` resolve to the same handler.

## Advanced settings

`GET /api/email/settings/schema` describes collapsible settings sections so clients can render a clean default interface with advanced controls on demand. Existing live settings include gatekeeper state, approved senders, and rules.

Forwarding, identities, signatures, templates, and vacation responder currently have `foundation` status. Their schema is intentionally available for compatible clients and future migration, but this documentation does **not** claim that delivery forwarding or signature/template application is live yet.

## Settings storage

- `GET /api/email/settings/get?aliasId=<alias>` reads the current alias settings.
- `POST /api/email/settings/save` uses the existing mail settings handler. The request body includes `aliasId` and `settings`.

Callers must check `/api/email/capabilities` before presenting provider-dependent behavior as available.

## Compatibility

The gateway still registers every canonical route returned by `geelooy/api/social/_awtsmoos.mail.js`. Existing clients using `/api/email/mail/...` therefore continue through the same helper engine. The shorter aliases are convenience routes, not a separate implementation.

## Related documentation

- [Other API families](../../../docs/API/OTHER_FAMILIES.md)
- [Configuration](../../../docs/CONFIGURATION.md)
- [Social and Heichel systems](../../../docs/SYSTEMS/SOCIAL_AND_HEICHEL.md)

## Extension rule

When adding a new Email capability, update the underlying mail engine first, then its capability state, then the settings schema if relevant, and finally this documentation. Never move a feature from `foundation` to `live` without runtime evidence.
