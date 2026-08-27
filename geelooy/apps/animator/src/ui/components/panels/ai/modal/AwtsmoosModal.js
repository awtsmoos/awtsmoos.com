// B"H
export class AwtsmoosModal {
  static show(text) {
    const overlay = document.createElement('div');
    Object.assign(overlay.style, { position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.9)', zIndex: '99999', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem', boxSizing: 'border-box' });
    const content = document.createElement('div');
    Object.assign(content.style, { background: '#111', color: '#eee', border: '2px solid var(--accent-primary)', padding: '2rem', maxWidth: '800px', width: '100%', maxHeight: '80vh', overflowY: 'auto', borderRadius: '8px', fontFamily: 'serif', fontSize: '1.1rem', lineHeight: '1.6' });
    content.innerHTML = `<h2 style="color:var(--accent-warn);text-align:center;margin-bottom:1rem;font-family:sans-serif;">THE REVELATION OF AWTSMOOS</h2><div style="white-space:pre-wrap;">${text}</div><button id="close-awtsmoos-btn" class="btn btn-primary" style="margin-top:2rem;width:100%;">Absorb Truth</button>`;
    overlay.appendChild(content);
    document.body.appendChild(overlay);
    document.getElementById('close-awtsmoos-btn').onclick = () => {
      overlay.remove();
      const inp = document.getElementById('ai-prompt-input');
      if (inp) inp.value = '';
    };
  }
}