B"H
# Virtual OS correction stress

OK: false
Public app: http://localhost:8080/apps/virtual-os-stress-light-counter/

```json
{
  "checks": {
    "jsonValidateOk": true,
    "packageInfoOk": true,
    "spawnOk": true,
    "statusOk": true,
    "resultOk": false,
    "outputReadOk": true,
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
    "ok": false,
    "status": "running",
    "text": "",
    "error": null
  }
}
```