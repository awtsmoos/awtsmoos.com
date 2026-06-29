# B"H — Bouncing Ball Web Encoding Benchmark

Goal: make encoding speed measurable, simple, and valuable.

Steps:
1. Add a browser WebCodecs benchmark that draws a bouncing ball on canvas.
2. Encode frames with `VideoEncoder` directly, measuring encode wall time.
3. Report fps, realtime factor, encoded bytes, Mbps, frame time, and a value grade.
4. Wire it into the Nesher Studio UI as a one-click benchmark.
5. Add a standalone benchmark page for easy Chrome testing.
6. Add Node smoke tests for deterministic renderer math and grading.

The benchmark does not pretend to be a final container mux. It tests the raw encoding vessel: how fast the browser can turn canvas frames into encoded chunks.
