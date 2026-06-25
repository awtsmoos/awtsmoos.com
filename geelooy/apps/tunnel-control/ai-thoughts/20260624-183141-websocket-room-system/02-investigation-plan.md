B"H

# Investigation plan

1. Search existing WebSocket code.
2. Inspect live.js frontend websocket implementation.
3. Inspect live route backend and route registration.
4. Decide whether to add mission-room websocket route or reuse existing live stream route safely.
5. Implement smallest stable version: client-side room websocket adapter with fallback polling.
6. If backend route is easy and safe, add `mission-room-stream` endpoint.
