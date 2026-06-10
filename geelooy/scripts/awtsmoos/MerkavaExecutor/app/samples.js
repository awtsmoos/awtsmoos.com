// B"H
(function forgeSamples(root) {
  const forge = root.MerkavaForge = root.MerkavaForge || {};

  forge.seed = {
    html: `<article class="card"><h2>Awtsmoos Bytecode Garden</h2><p>The preview vessel begins as HTML, receives CSS robes, then JS breath.</p><button id="ignite">Ignite</button><output id="spark">waiting...</output></article>`,
    css: `.card{padding:28px;border-radius:24px;background:linear-gradient(135deg,#08111f,#14383a);box-shadow:0 24px 80px #0008;color:#eaffff}.card h2{color:#73fff2}.card button{border:0;border-radius:999px;padding:10px 16px;background:#73fff2;color:#001;font-weight:900}.card output{display:block;margin-top:16px}`,
    js: `const spark = document.getElementById("spark");
const button = document.getElementById("ignite");
let count = 0;
button.addEventListener("click", function awaken() {
  count = count + 1;
  spark.textContent = "B'H custom bytecode pulse #" + count;
});
syscall(0, "Preview app compiled and breathed into the vessel.");`
  };
})(window);
