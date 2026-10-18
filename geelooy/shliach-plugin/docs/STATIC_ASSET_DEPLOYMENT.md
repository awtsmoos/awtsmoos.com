B"H

# Browser-only production deployment without tunnel interruption

The production deployment coordinator may fast-forward static assets beneath
`geelooy/games/mitzvahWorld/`, `geelooy/apps/rebbe/`, and
`geelooy/shliach-plugin/` without restarting `awtsmoos.service` or reloading
Nginx, **only** when *every* changed file is in those paths and live-service
health and ownership can be verified.

Changes to WebSocket code, runtime services, installers, API routes, deployment
scripts, or mixed static/server paths require a guarded activation. Backend
renames cannot masquerade as static-only changes. A static release marker is
bound to the precise Git commit and incumbent systemd process ID; the marker
expires automatically when that server generation changes.

A normal server restart still closes existing WebSockets. Preserve accepted
operation receipts and reconnect using the same approved device identity;
never blindly repeat an uncertain write.

## Verification contract

Record `systemctl show -P MainPID awtsmoos.service` before and after a
browser-only release. The PID must remain identical; the deploy record must
state `mode=static_no_restart`. Check the active WebSocket registration and
verify the precise commit in the static release marker. A repeated deployment
of the same commit must be a no-op and preserve that PID too.
