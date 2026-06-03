B"H
# Virtual OS full tunnel stress

Generated: 2026-06-03T01:58:10.987Z
User: stressUser_1780451870276

## Server
- / status: 200
- Virtual route status: 200

## MiniMax app
- MiniMax ok: true
- App bytes: 2863
- Read back ok: true

## Surface
```json
{
  "total": 397,
  "counts": {
    "native": 78,
    "interpreted-diagnostic": 136,
    "interpreted-generic": 57,
    "hosted-state": 54,
    "ai": 10,
    "hosted-network": 20,
    "host-only-safe-report": 42
  },
  "fullyExecutable": 162,
  "interpreted": 235
}
```

## Stress counts
```json
{
  "native": {
    "total": 78,
    "ok": 76,
    "fail": 2
  },
  "interpreted-diagnostic": {
    "total": 136,
    "ok": 136,
    "fail": 0
  },
  "interpreted-generic": {
    "total": 57,
    "ok": 57,
    "fail": 0
  },
  "hosted-state": {
    "total": 54,
    "ok": 54,
    "fail": 0
  },
  "ai": {
    "total": 10,
    "ok": 8,
    "fail": 2
  },
  "hosted-network": {
    "total": 20,
    "ok": 20,
    "fail": 0
  },
  "host-only-safe-report": {
    "total": 42,
    "ok": 42,
    "fail": 0
  }
}
```

## Failures (4)
```json
[
  {
    "action": "aiAgentTaskResult",
    "mode": "ai",
    "error": "unknown_virtual_ai_task",
    "sample": "{\"ok\":false,\"vessel\":\"virtual-os\",\"error\":\"unknown_virtual_ai_task\"}"
  },
  {
    "action": "aiAgentTaskStatus",
    "mode": "ai",
    "error": "unknown_virtual_ai_task",
    "sample": "{\"ok\":false,\"vessel\":\"virtual-os\",\"error\":\"unknown_virtual_ai_task\"}"
  },
  {
    "action": "jsonValidate",
    "mode": "native",
    "error": "Unexpected token '<', \"<!DOCTYPE \"... is not valid JSON",
    "sample": "{\"ok\":false,\"action\":\"jsonValidate\",\"path\":\"machine/apps/light-counter/index.html\",\"valid\":false,\"error\":\"Unexpected token '<', \\\"<!DOCTYPE \\\"... is not valid JSON\"}"
  },
  {
    "action": "packageInfo",
    "mode": "native",
    "error": "Unexpected token '<', \"<!DOCTYPE \"... is not valid JSON",
    "sample": "{\"ok\":false,\"action\":\"packageInfo\",\"path\":\"machine/apps/light-counter/index.html\",\"valid\":false,\"error\":\"Unexpected token '<', \\\"<!DOCTYPE \\\"... is not valid JSON\"}"
  }
]
```