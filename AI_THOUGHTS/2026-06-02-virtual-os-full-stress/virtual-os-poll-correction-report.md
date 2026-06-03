B"H
# Virtual OS poll correction
OK: true
Public app: http://localhost:8080/apps/virtual-os-stress-light-counter/
```json
{
  "checks": {
    "jsonValidateOk": true,
    "packageInfoOk": true,
    "spawnOk": true,
    "statusComplete": true,
    "resultOk": true,
    "outputHasText": true,
    "publicAppOk": true
  },
  "publicApp": {
    "ok": true,
    "status": 200,
    "hasButton": true,
    "bytes": 507,
    "title": "Light Counter"
  },
  "result": {
    "ok": true,
    "status": "complete",
    "text": "POLL_TASK_OK"
  }
}
```