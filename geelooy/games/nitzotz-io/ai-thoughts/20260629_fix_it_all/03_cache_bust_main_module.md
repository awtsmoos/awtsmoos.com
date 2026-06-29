B"H

# Cache-bust revelation

Browser reload showed fresh HTML but window.nitzotzDebug was still false, proving that the ES module itself could remain cached even when index.html had a fresh query. The index file was rewritten again as a whole-file artifact via script transformation to reference ./js/main.js?v=20260629_fixit_debug1.
