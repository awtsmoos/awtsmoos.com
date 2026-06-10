// B"H
(function semanticSeed(root) {
  const awt = root.AwtsSemantic = root.AwtsSemantic || {};

  /**
   * B"H. The demo vessel: deliberately small, but now represented by semantic
   * opcodes rather than literal source text. It is the first rung of the ladder.
   */
  awt.seed = {
    html: `<article class="card"><h2>Awtsmoos Bit Garden</h2><p>Every logical bit is counted. Fields share bytes.</p><button id="ignite">Ignite</button><output id="spark">waiting...</output></article>`,
    css: `.card{padding:28px;border-radius:24px;background:linear-gradient(135deg,#08111f,#14383a);color:#eaffff}.card h2{color:#73fff2}.card button{border:0;border-radius:999px;padding:10px 16px;background:#73fff2;color:#001;font-weight:900}.card output{display:block;margin-top:16px}`,
    js: `const spark = document.getElementById("spark");
const button = document.getElementById("ignite");
let count = 0;
spark.textContent = "B'H JS executed once.";
button.addEventListener("click", function awaken() {
  requestAnimationFrame(function pulse() {
    count = count + 1;
    spark.textContent = "B'H exact bit pulse #" + count;
  });
});
syscall(0, "Bit-packed source bytecode and RAM fire are awake.");`
  };
})(window);
