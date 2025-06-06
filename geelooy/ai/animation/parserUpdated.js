//B"H
// B"H
(async () => {
  const parser = new DOMParser();
  const toTitle = name => name.replace(/\s/g, "_");
  const sefarim = Array.from(document.querySelectorAll("table a"))
    .map(a => a.textContent.trim())
    .filter(t => /^ספר /.test(t) || /^[^ ]+$/.test(t)) // only short Hebrew book names
    .map(t => t.replace(/^ספר /, "").trim());

  const apiUrl = title =>
    `https://he.wikisource.org/w/api.php?action=parse&format=json&origin=*&page=${encodeURIComponent(title)}`;

  const fetchPage = async title => {
    const res = await fetch(apiUrl(title));
    const data = await res.json();
    return {
      html: parser.parseFromString(data.parse.text["*"], "text/html"),
      raw: data
    };
  };

  const clean = doc => doc.body?.innerText?.trim() || "";

  const getSeferUrls = sefer => ({
    taamim: `ספר_${toTitle(sefer)}/טעמים`,
    rashi: `רש\"י_מנוקד_על_המקרא/ספר_${toTitle(sefer)}`,
    onkelos: `תרגום_אונקלוס_(תאג')/ספר_${toTitle(sefer)}`
  });

  async function saveFile(dir, name, content) {
    const fileHandle = await dir.getFileHandle(name, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();
  }

  const dir = await window.showDirectoryPicker();

  for (let sefer of sefarim) {
    const urls = getSeferUrls(sefer);
    console.log(`📥 Fetching ${sefer}...`);

    try {
      const [taamim, rashi, onkelos] = await Promise.all([
        fetchPage(urls.taamim),
        fetchPage(urls.rashi),
        fetchPage(urls.onkelos)
      ]);

      const data = {
        sefer,
        timestamp: new Date().toISOString(),
        urls,
        content: {
          scripture_clean: clean(taamim.html),
          rashi_clean: clean(rashi.html),
          onkelos_clean: clean(onkelos.html)
        },
        raw_html: {
          taamim: taamim.raw,
          rashi: rashi.raw,
          onkelos: onkelos.raw
        }
      };

      await saveFile(dir, `${sefer}.json`, JSON.stringify(data, null, 2));
      console.log(`✅ Saved ${sefer}.json`);
    } catch (e) {
      console.warn(`⚠️ Failed ${sefer}`, e);
    }
  }

  console.log("🎉 All complete");
})();
