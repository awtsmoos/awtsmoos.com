# B"H Canvas Conformance First Wave

Total: 22
Passed: 22
Failed: 0

## Failed cases
- none

## canvas2d-state-and-transform
Pass: true
- PASS runtime ok
- PASS restored alpha
- PASS transform changed
- PASS save/restore recorded
- PASS transform recorded
Commands: createTexture, save, translate, rotate, scale, fillRect, restore, fillRect

## path2d-curves-clip-and-fill-rules
Pass: true
- PASS runtime ok
- PASS clip recorded
- PASS fill path recorded
- PASS stroke path recorded
- PASS curves preserved
Commands: createTexture, clip, fillPath, strokePath

## image-data-and-draw-image
Pass: true
- PASS runtime ok
- PASS offscreen texture exists
- PASS image data recorded
- PASS draw image recorded
Commands: createTexture, createTexture, fillRect, getImageData, putImageData, drawImageTexture

## worker-offscreen-roundtrip
Pass: true
- PASS runtime ok
- PASS worker replied
- PASS worker canvas texture exists
- PASS worker drawImage recorded
Commands: createTexture, createTexture, fillRect, drawImageTexture

## webgl-command-capture-baseline
Pass: true
- PASS runtime ok
- PASS webgl texture exists
- PASS webgl clear recorded
- PASS webgl draw recorded
Commands: createTexture, webgl.clearColor, webgl.clear, webgl.drawArrays
