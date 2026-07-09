/*
 * Unterschriften-Erfassung direkt in der App (offline, kein Netz nötig).
 *
 * Nach "Als PDF erzeugen" öffnet form.js über window.AbnahmeSignature.collect(pdfBytes)
 * einen Dialog, der zuerst die fertige PDF seitenweise anzeigt (Vorschau über
 * das lokal mitgelieferte pdf.js -> funktioniert offline), damit der
 * Unterschreibende genau das Dokument prüfen kann, das er unterschreibt.
 * Darunter zwei Unterschriftenfelder (Vermieter / Mieter). Die Unterschriften
 * werden als PNG zurückgegeben und von form.js exakt in die Unterschriftsboxen
 * der PDF eingesetzt.
 *
 * collect(pdfBytes) liefert:
 *   { vermieter, mieter }  – Data-URLs oder null (Feld leer / übersprungen)
 *   null                   – Abbrechen gedrückt, PDF-Erzeugung stoppen
 */
(function () {

  // ---------- Unterschriftenfeld (Pencil / Finger / Maus) ----------
  function SigPad(canvas) {
    const ctx = canvas.getContext('2d');
    let drawing = false;
    let hasInk = false;
    let prev = null;

    // Interne Auflösung an Anzeigegröße + Retina anpassen (sonst versetzte Striche)
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.round(r.width * dpr));
      canvas.height = Math.max(1, Math.round(r.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#111';
      hasInk = false;
    };

    const pos = (e) => {
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };

    const down = (e) => {
      drawing = true;
      prev = pos(e);
      if (canvas.setPointerCapture) {
        try { canvas.setPointerCapture(e.pointerId); } catch (err) { }
      }
      e.preventDefault();
    };

    const move = (e) => {
      if (!drawing) return;
      const p = pos(e);
      ctx.beginPath();
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      prev = p;
      hasInk = true;
      e.preventDefault();
    };

    const up = () => { drawing = false; prev = null; };

    canvas.addEventListener('pointerdown', down);
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerup', up);
    canvas.addEventListener('pointercancel', up);

    this.resize = resize;
    this.clear = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      hasInk = false;
    };
    this.isEmpty = () => !hasInk;
    this.toDataURL = () => canvas.toDataURL('image/png');
  }

  window.SimpleSignaturePad = SigPad;

  // ---------- Dialog ----------
  let overlay = null;
  let padVermieter = null;
  let padMieter = null;
  let resolver = null;

  const build = () => {
    overlay = document.createElement('div');
    overlay.className = 'sig-overlay no-print';
    overlay.innerHTML = `
      <div class="sig-dialog">
        <h2>Protokoll prüfen &amp; unterschreiben</h2>
        <div class="sig-preview"></div>
        <p class="sig-hint">Bitte das Protokoll oben prüfen und anschließend mit Stift
        oder Finger unterschreiben. Die Unterschriften werden direkt in die PDF eingesetzt.</p>
        <div class="sig-field">
          <label>Unterschrift des Vermieters bzw. seines Bevollmächtigten</label>
          <canvas id="sig-canvas-vermieter"></canvas>
          <button type="button" class="sig-clear" data-pad="vermieter">Feld leeren</button>
        </div>
        <div class="sig-field">
          <label>Unterschrift des Mieters bzw. seines Bevollmächtigten</label>
          <canvas id="sig-canvas-mieter"></canvas>
          <button type="button" class="sig-clear" data-pad="mieter">Feld leeren</button>
        </div>
        <div class="sig-actions">
          <button type="button" id="sig-cancel">Abbrechen</button>
          <button type="button" id="sig-skip">Ohne Unterschrift fortfahren</button>
          <button type="button" id="sig-ok" class="submit-btn">Übernehmen</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);

    padVermieter = new SigPad(overlay.querySelector('#sig-canvas-vermieter'));
    padMieter = new SigPad(overlay.querySelector('#sig-canvas-mieter'));

    overlay.querySelectorAll('.sig-clear').forEach(btn => {
      btn.addEventListener('click', () => {
        (btn.dataset.pad === 'vermieter' ? padVermieter : padMieter).clear();
      });
    });

    const done = (result) => {
      overlay.style.display = 'none';
      const r = resolver;
      resolver = null;
      if (r) r(result);
    };

    overlay.querySelector('#sig-cancel').addEventListener('click', () => done(null));
    overlay.querySelector('#sig-skip').addEventListener('click', () => done({ vermieter: null, mieter: null }));
    overlay.querySelector('#sig-ok').addEventListener('click', () => done({
      vermieter: padVermieter.isEmpty() ? null : padVermieter.toDataURL(),
      mieter: padMieter.isEmpty() ? null : padMieter.toDataURL()
    }));
  };

  // ---------- PDF-Vorschau (pdf.js, lokal aus ./vendor/pdfjs) ----------
  const renderPreview = async (bytes) => {
    const holder = overlay.querySelector('.sig-preview');
    holder.innerHTML = '';
    if (!window.pdfjsLib || !bytes) {
      holder.innerHTML = '<p class="sig-hint">PDF-Vorschau nicht verfügbar.</p>';
      return;
    }
    try {
      pdfjsLib.GlobalWorkerOptions.workerSrc = './vendor/pdfjs/pdf.worker.min.js';
      // Kopie übergeben: pdf.js reicht den Puffer an seinen Worker weiter
      const doc = await pdfjsLib.getDocument({ data: bytes.slice() }).promise;
      const width = Math.max(200, holder.clientWidth - 22); // minus Innenabstand
      const dpr = window.devicePixelRatio || 1;
      for (let n = 1; n <= doc.numPages; n++) {
        const pdfPage = await doc.getPage(n);
        const base = pdfPage.getViewport({ scale: 1 });
        const vp = pdfPage.getViewport({ scale: (width / base.width) * dpr });
        const canvas = document.createElement('canvas');
        canvas.className = 'sig-preview-page';
        canvas.width = Math.floor(vp.width);
        canvas.height = Math.floor(vp.height);
        holder.appendChild(canvas);
        // intent 'print': rendert ohne requestAnimationFrame -> läuft auch
        // zuverlässig, wenn der Tab/die App gerade nicht im Vordergrund ist
        await pdfPage.render({ canvasContext: canvas.getContext('2d'), viewport: vp, intent: 'print' }).promise;
      }
    } catch (e) {
      console.error('PDF-Vorschau fehlgeschlagen:', e);
      holder.innerHTML = '<p class="sig-hint">PDF-Vorschau konnte nicht erstellt werden.</p>';
    }
  };

  const collect = (pdfBytes) => {
    if (!overlay) build();
    overlay.style.display = '';
    // Auflösung erst setzen, wenn der Dialog sichtbar ist (vorher wäre sie 0x0);
    // setzt die Felder gleichzeitig auf leer zurück.
    padVermieter.resize();
    padMieter.resize();
    renderPreview(pdfBytes); // rendert asynchron, während der Dialog schon offen ist
    return new Promise(res => { resolver = res; });
  };

  window.AbnahmeSignature = { collect };
})();
