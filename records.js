/*
 * Vorgangsverwaltung + automatische Zwischenspeicherung.
 *
 * Jede Wohnungsabnahme ist ein "Vorgang" (Record) in IndexedDB. Bei jeder
 * Eingabe wird der komplette Formularstand (inkl. dynamisch hinzugefügter
 * Zeilen) automatisch gespeichert, zusätzlich sofort beim Wechsel in den
 * Hintergrund (iPadOS beendet PWAs aggressiv). Die zuletzt erzeugte PDF wird
 * ebenfalls im Vorgang gesichert und kann erneut heruntergeladen werden.
 *
 * Benötigt window.AbnahmeForm aus form.js (serialize / restore / clearForm).
 */
(function () {
  const api = window.AbnahmeForm;
  const form = document.getElementById('abnahme-form');
  if (!api || !form || !window.indexedDB) return;

  const DB_NAME = 'abnahme_db';
  const STORE = 'records';
  const CURRENT_KEY = 'abnahme_current_record_id';
  const SAVE_DELAY = 600; // ms nach der letzten Eingabe

  // ---------- IndexedDB ----------
  let dbPromise = null;
  const openDB = () => {
    if (!dbPromise) {
      dbPromise = new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = () => {
          const db = req.result;
          if (!db.objectStoreNames.contains(STORE)) {
            db.createObjectStore(STORE, { keyPath: 'id' });
          }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    }
    return dbPromise;
  };

  const putRecord = async (rec) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const t = db.transaction(STORE, 'readwrite');
      t.objectStore(STORE).put(rec);
      t.oncomplete = () => resolve();
      t.onerror = () => reject(t.error);
      t.onabort = () => reject(t.error);
    });
  };

  const removeRecord = async (id) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const t = db.transaction(STORE, 'readwrite');
      t.objectStore(STORE).delete(id);
      t.oncomplete = () => resolve();
      t.onerror = () => reject(t.error);
      t.onabort = () => reject(t.error);
    });
  };

  const getAllRecords = async () => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const req = db.transaction(STORE, 'readonly').objectStore(STORE).getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  };

  // ---------- Zustand ----------
  let records = [];
  let current = null;
  let saveTimer = null;

  const makeRecord = () => ({
    id: 'r' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    state: { dynamic: [], values: {} },
    pdf: null
  });

  const firstValue = (rec, name) => {
    const arr = rec.state && rec.state.values ? rec.state.values[name] : null;
    return Array.isArray(arr) ? String(arr[0] || '').trim() : '';
  };

  const labelOf = (rec) => {
    const parts = [
      firstValue(rec, 'straße_hausnummer'),
      firstValue(rec, 'wohnung_nr_etage_objekt')
    ].filter(Boolean);
    let label = parts.join(', ');
    const datum = firstValue(rec, 'datum');
    if (/^\d{4}-\d{2}-\d{2}$/.test(datum)) {
      const [y, m, d] = datum.split('-');
      label = (label ? label + ' ' : '') + `(${d}.${m}.${y})`;
    }
    return label || 'Neue Abnahme';
  };

  // ---------- UI: Vorgangsleiste über dem Formular ----------
  const bar = document.createElement('div');
  bar.className = 'record-bar no-print';

  const barLabel = document.createElement('label');
  barLabel.textContent = 'Abnahme:';
  barLabel.htmlFor = 'record-select';

  const sel = document.createElement('select');
  sel.id = 'record-select';

  const btnNew = document.createElement('button');
  btnNew.type = 'button';
  btnNew.id = 'record-new';
  btnNew.textContent = 'Neue Abnahme';

  const btnDup = document.createElement('button');
  btnDup.type = 'button';
  btnDup.id = 'record-duplicate';
  btnDup.textContent = 'Duplizieren';
  btnDup.title = 'Neue Abnahme mit Adresse, Zählernummern und Ausstattung dieses Vorgangs anlegen – Stände, Namen und Mängel bleiben leer';

  const btnPdf = document.createElement('button');
  btnPdf.type = 'button';
  btnPdf.id = 'record-pdf';
  btnPdf.textContent = 'Letzte PDF';
  btnPdf.title = 'Zuletzt erzeugte PDF dieses Vorgangs erneut herunterladen';
  btnPdf.style.display = 'none';

  const btnDelete = document.createElement('button');
  btnDelete.type = 'button';
  btnDelete.id = 'record-delete';
  btnDelete.className = 'remove-btn';
  btnDelete.textContent = 'Löschen';

  const status = document.createElement('span');
  status.id = 'record-status';

  bar.appendChild(barLabel);
  bar.appendChild(sel);
  bar.appendChild(btnNew);
  bar.appendChild(btnDup);
  bar.appendChild(btnPdf);
  bar.appendChild(btnDelete);
  bar.appendChild(status);
  form.parentNode.insertBefore(bar, form);

  const setStatus = (t) => { status.textContent = t || ''; };

  const rebuildSelect = () => {
    records.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    sel.innerHTML = '';
    records.forEach(r => {
      const o = document.createElement('option');
      o.value = r.id;
      o.textContent = labelOf(r);
      sel.appendChild(o);
    });
    if (current) sel.value = current.id;
  };

  const updateCurrentOption = () => {
    if (!current) return;
    const o = sel.querySelector(`option[value="${current.id}"]`);
    if (o) o.textContent = labelOf(current);
  };

  const updatePdfButton = () => {
    btnPdf.style.display = (current && current.pdf && current.pdf.bytes) ? '' : 'none';
  };

  // ---------- Automatisches Zwischenspeichern ----------
  const doSave = async () => {
    if (!current) return;
    current.state = api.serialize();
    current.updatedAt = Date.now();
    try {
      await putRecord(current);
      const t = new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
      setStatus(`Automatisch zwischengespeichert um ${t} Uhr`);
      updateCurrentOption();
    } catch (e) {
      console.error('Zwischenspeichern fehlgeschlagen:', e);
      setStatus('Achtung: Zwischenspeichern fehlgeschlagen!');
    }
  };

  const scheduleSave = () => {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(doSave, SAVE_DELAY);
  };

  const flushSave = () => {
    clearTimeout(saveTimer);
    return doSave();
  };

  form.addEventListener('input', scheduleSave);
  form.addEventListener('change', scheduleSave);
  document.addEventListener('abnahme:changed', scheduleSave);

  // Sofort sichern, wenn die App in den Hintergrund geht / beendet wird
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushSave();
  });
  window.addEventListener('pagehide', () => flushSave());

  // Safari: Beim Zurücknavigieren (z.B. aus einer PDF-Ansicht) stellt der
  // Browser Formularfelder selbst wieder her bzw. leert sie dabei. Kurz danach
  // unseren gesicherten Stand erneut anwenden - der ist die einzige Wahrheit.
  window.addEventListener('pageshow', (e) => {
    if (e.persisted && current) {
      setTimeout(() => {
        api.restore(current.state || { dynamic: [], values: {} });
        updatePdfButton();
      }, 80);
    }
  });

  // ---------- Vorgänge aktivieren / wechseln / anlegen / löschen ----------
  const activate = (rec) => {
    current = rec;
    try { localStorage.setItem(CURRENT_KEY, rec.id); } catch (e) { }
    api.restore(rec.state || { dynamic: [], values: {} });
    sel.value = rec.id;
    updatePdfButton();
    setStatus('');
  };

  sel.addEventListener('change', async () => {
    const rec = records.find(r => r.id === sel.value);
    if (!rec || (current && rec.id === current.id)) return;
    await flushSave();
    activate(rec);
  });

  btnNew.addEventListener('click', async () => {
    await flushSave();
    const rec = makeRecord();
    records.unshift(rec);
    try { await putRecord(rec); } catch (e) { console.error(e); }
    current = rec;
    rebuildSelect();
    activate(rec);
  });

  // ---------- Vorgang duplizieren (Wohnungs-Stammdaten übernehmen) ----------
  // Übernommen werden: Adresse, alle Zähler-/Schlüsselnummern, Boden-/Wandarten
  // und die hinzugefügten Zeilen. Alles Vorgangsbezogene (Datum, Namen, Stände,
  // Mängel, Anmerkungen, neue Anschrift) startet leer.
  const templateFrom = (rec) => {
    const KEEP_EXACT = ['wohnung_nr_etage_objekt', 'straße_hausnummer', 'plz_ort'];
    const keepName = (n) =>
      KEEP_EXACT.includes(n) ||
      /(_nr|_nummer)$/.test(n) ||
      /^(boden_|boeden_|waende_)/.test(n);

    const src = (rec.state && rec.state.values) ? rec.state.values : {};
    const values = {};
    Object.keys(src).forEach(n => {
      if (keepName(n) && Array.isArray(src[n])) values[n] = src[n].slice();
    });

    const dynamic = (rec.state && Array.isArray(rec.state.dynamic))
      ? rec.state.dynamic.map(d => ({ section: d.section, option: d.option }))
      : [];

    return { dynamic, values };
  };

  btnDup.addEventListener('click', async () => {
    if (!current) return;
    await flushSave();
    const rec = makeRecord();
    rec.state = templateFrom(current);
    records.unshift(rec);
    try { await putRecord(rec); } catch (e) { console.error(e); }
    current = rec;
    rebuildSelect();
    activate(rec);
    setStatus('Vorgang dupliziert – Nummern/Ausstattung übernommen, Stände und Namen sind leer.');
  });

  btnDelete.addEventListener('click', async () => {
    if (!current) return;
    if (!confirm(`Diese Abnahme endgültig löschen?\n\n${labelOf(current)}`)) return;
    clearTimeout(saveTimer);
    const oldId = current.id;
    try { await removeRecord(oldId); } catch (e) { console.error(e); }
    records = records.filter(r => r.id !== oldId);
    current = null;
    if (!records.length) {
      const rec = makeRecord();
      records.push(rec);
      try { await putRecord(rec); } catch (e) { }
    }
    rebuildSelect();
    activate(records[0]);
  });

  // ---------- PDF im Vorgang sichern + erneut laden ----------
  document.addEventListener('abnahme:pdf', async (e) => {
    if (!current || !e.detail || !e.detail.bytes) return;
    clearTimeout(saveTimer);
    current.state = api.serialize();
    current.pdf = {
      bytes: e.detail.bytes, // Uint8Array: strukturklonbar, auch in älterem Safari zuverlässig
      filename: e.detail.filename || 'Wohnungsabnahmeprotokoll.pdf',
      createdAt: Date.now()
    };
    current.updatedAt = Date.now();
    try {
      await putRecord(current);
      updatePdfButton();
      updateCurrentOption();
      setStatus('PDF im Vorgang gesichert – über "Letzte PDF" jederzeit erneut abrufbar.');
    } catch (err) {
      console.error('PDF konnte nicht gesichert werden:', err);
    }
  });

  btnPdf.addEventListener('click', () => {
    if (!current || !current.pdf || !current.pdf.bytes) return;
    const filename = current.pdf.filename || 'Wohnungsabnahmeprotokoll.pdf';

    // Wie beim Erzeugen: PDF direkt anzeigen/herunterladen; gespeichert wird
    // über das Teilen-Menü der PDF-Ansicht. Kein revokeObjectURL (s. form.js).
    const blob = new Blob([current.pdf.bytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
  });

  // ---------- Start: letzten Vorgang laden oder neuen anlegen ----------
  (async () => {
    try {
      records = await getAllRecords();
    } catch (e) {
      console.error('Vorgänge konnten nicht geladen werden:', e);
      records = [];
    }

    let wanted = null;
    try { wanted = localStorage.getItem(CURRENT_KEY); } catch (e) { }

    let rec = records.find(r => r.id === wanted) || null;
    if (!rec && records.length) {
      records.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      rec = records[0];
    }
    if (!rec) {
      rec = makeRecord();
      records.push(rec);
      try { await putRecord(rec); } catch (e) { }
    }
    current = rec;
    rebuildSelect();
    activate(rec);
  })();
})();
