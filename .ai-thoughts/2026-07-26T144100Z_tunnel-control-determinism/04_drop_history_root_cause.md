B"H
Boruch Hashem
Blessed is He

# Tunnel Drop History Root Cause

## Direct Runtime Evidence

The live liveness timeline recorded a maximum event-loop stall of `33265ms`, an open circuit, and connection generation `4` while the tunnel remained supervised. The keepalive interval was `25000ms`. This is positive evidence that the control process stopped servicing timers and socket work long enough to cross a heartbeat boundary.

## Git Ancestry Evidence

Two previous repairs existed outside the ancestry of the installer branch:

- `f8d4da2a6`: stall-aware probe and grace after local timer suspension.
- `091b32b2b`: stronger timer-drift recovery that resets the silence clock before death judgment.

Neither commit is an ancestor of the current repair base. The current source therefore retained the older transport liveness implementation, which compares total inbound silence to `deadIdleMs` immediately after a delayed timer wakes.

## Exact Failure Mechanism

1. The socket has already been quiet for part of the 75-second death window.
2. A synchronous main-thread stall delays the 15-second liveness timer by 33.265 seconds.
3. When the event loop wakes, the old implementation sees the accumulated idle duration exceed 75 seconds.
4. It declares the transport dead even though the timer itself was suspended locally.
5. The outer connection runtime closes the socket and creates another generation.

The server already tolerates six missed heartbeats and five minutes of fresh evidence. The missing protection is therefore the unmerged client-side timer-drift distinction.

## Permanent Repair Boundary

- Restore timer-drift-aware client liveness from the strongest historical design.
- Treat a delayed timer as local suspension, reset the silence clock, and emit one recovery ping.
- Preserve genuine half-open detection when regular interval ticks continue without inbound evidence.
- Add a regression reproducing the observed `33265ms` stall.
- Require the new settings module in release inventory.
- Add the stall regression to focused and full self-preservation suites.
- Verify the generated installer bundle contains and executes the protection.

No installed runtime file will be changed during this source repair.
