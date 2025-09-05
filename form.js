(function () {
  const sections = Array.isArray(window.form_sections) ? window.form_sections : [];
  const root = document.getElementById('sections-root');
  const form = document.getElementById('abnahme-form');
  const out = document.getElementById('submitted');

  // ---------- Hilfen ----------
  const el = (tag, cls) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    return n;
  };

  // simple uid counter for input IDs
  let __uid = 0;
  const uid = (prefix = 'f') => `${prefix}_${(++__uid).toString(36)}`;

  // iPad-/Tastatur-Hilfen + dezimale Eingaben
  const applyInputHints = (input, name, type) => {
    const nm = String(name || '').toLowerCase();

    const isDecimal =
      /betrag|summe|rate|eur|stand/.test(nm) ||             // generisch: *betrag, *summe, *rate, *eur, *stand
      /_stand$/.test(nm);                                   // z.B. warmwasser_stand, strom_stand

    // Felder, die rein ganzzahlig sind (Zählwerte, IDs)
    const isInteger =
      /^anzahl_/.test(nm) ||                                // z.B. anzahl_hausschluessel
      /(_nr$|_nummer$)/.test(nm);                           // z.B. hausschluessel_nummer

    if (isDecimal) {
      if (input.tagName === 'INPUT' && input.type === 'number') input.type = 'text';
      input.inputMode = 'decimal';       // iOS zeigt , an; . lässt sich trotzdem eingeben
      input.autocomplete = 'off';
      return;
    }

    // 2) Integerfelder: echte numerische Tastatur + pattern für reine Ziffern
    if (type === 'number' || isInteger) {
      input.inputMode = 'numeric';
      input.pattern = '\\d*';
      input.autocomplete = 'off';
      return;
    }
  };

  const addLabelInput = (wrap, label, name, type = 'text', preset, options) => {
    const row = el('div', 'form-group');

    // ID erzeugen & Label verknüpfen
    const id = uid(name);
    const l = el('label');
    l.textContent = label;
    l.htmlFor = id;
    row.appendChild(l);

    let input;
    if (type === 'textarea') {
      input = document.createElement('textarea');
    } else if (type === 'checkbox') {
      input = document.createElement('input');
      input.type = 'checkbox';
      if (preset === true) input.checked = true;
      input.style.width = 'auto';
    } else if (type === 'select') {
      input = document.createElement('select');
      (options || []).forEach(opt => {
        const o = document.createElement('option');
        // unterstützt ["A","B"] und [{ value, label }]
        o.value = String(opt?.value ?? opt);
        o.textContent = String(opt?.label ?? opt);
        input.appendChild(o);
      });
    } else {
      input = document.createElement('input');
      input.type = type || 'text';
    }

    input.name = name;
    input.id = id;
    applyInputHints(input, name, type);

    row.appendChild(input);
    wrap.appendChild(row);
  };

  const makeAddFieldUI = (section, idx) => {
    if (!section.options) return null;

    const wrap = el('div', 'field-selector');
    const sel = document.createElement('select');
    sel.id = `select-${idx}`;
    sel.dataset.sectionTitle = section.title || '';

    const def = document.createElement('option');
    def.value = '';
    def.textContent = '-- Feld auswählen --';
    // (Optional: deaktivieren, wenn du magst)
    // def.disabled = true; def.hidden = true; def.selected = true;
    sel.appendChild(def);

    section.options.forEach(o => {
      const opt = document.createElement('option');
      opt.value = o.name;
      opt.textContent = o.label;
      opt.dataset.type = o.type || 'text';
      if (o.subfields) opt.dataset.subfields = JSON.stringify(o.subfields);
      if (o.fields) opt.dataset.fields = JSON.stringify(o.fields);
      sel.appendChild(opt);
    });

    const addBtn = el('button', 'add-btn');
    addBtn.type = 'button';
    addBtn.textContent = '+';
    addBtn.dataset.section = String(idx);

    wrap.appendChild(sel);
    wrap.appendChild(addBtn);

    return { ui: wrap, select: sel, addBtn };
  };

  // ---------- Rendering ----------
  sections.forEach((section, i) => {
    const h2 = document.createElement('h2');
    h2.textContent = section.title || '';
    root.appendChild(h2);

    // Feste Felder
    if (Array.isArray(section.fields)) {
      section.fields.forEach(f =>
        addLabelInput(root, f.label, f.name, f.type, f.checked, f.options)
      );
    }

    // Dynamische Optionen
    if (Array.isArray(section.options) && section.options.length) {
      const { ui, select, addBtn } = makeAddFieldUI(section, i) || {};
      const container = el('div');
      container.id = `fields-container-${i}`;

      if (ui) root.appendChild(ui);
      root.appendChild(container);

      if (addBtn) {
        addBtn.addEventListener('click', () => {
          const optEl = select.selectedOptions[0];
          if (!optEl || !optEl.value) return;

          const sectionTitle = (select.dataset.sectionTitle || '').trim();
          const type = optEl.dataset.type;
          const label = optEl.textContent;
          const subfields = optEl.dataset.subfields ? JSON.parse(optEl.dataset.subfields) : [];

          // --- Spezial: Weitere Räume ---
          if (sectionTitle === 'Weitere Räume') {
            const card = el('div', 'field-item');
            card.style.flexDirection = 'column';
            card.style.alignItems = 'stretch';

            const head = el('div');
            head.style.display = 'flex';
            head.style.alignItems = 'center';
            head.style.gap = '10px';

            const strong = document.createElement('strong');
            strong.textContent = label;

            const removeRoomBtn = el('button', 'remove-btn');
            removeRoomBtn.type = 'button';
            removeRoomBtn.textContent = 'Entfernen';
            removeRoomBtn.addEventListener('click', () => card.remove());

            head.appendChild(strong);
            head.appendChild(removeRoomBtn);
            card.appendChild(head);

            // Die 3 Felder aus option.fields rendern
            const fields = Array.isArray(subfields) && subfields.length && subfields[0]?.label
              ? subfields
              : (optEl.dataset.fields ? JSON.parse(optEl.dataset.fields) : []);

            let optionObj = null;
            if (!fields.length && Array.isArray(section.options)) {
              optionObj = section.options.find(o => o.name === optEl.value || o.label === label);
            }
            const finalFields = fields.length ? fields : (optionObj?.fields || []);

            finalFields.forEach(f => {
              addLabelInput(card, f.label, f.name, f.type, f.checked, f.options);
            });

            container.appendChild(card);
            select.value = '';
            return;
          }

          // --- Standard: Gruppe mit Subfeldern oder Einzel-Feld ---
          if (type === 'multi' && Array.isArray(subfields) && subfields.length) {
            const wrap = el('div', 'field-item');
            const strong = document.createElement('strong');
            strong.textContent = label;
            wrap.appendChild(strong);

            subfields.forEach(sf => {
              // Label + ID-Verknüpfung
              const id = uid(sf.name);
              const lab = document.createElement('label');
              lab.textContent = sf.label;
              lab.htmlFor = id;
              wrap.appendChild(lab);

              let input;
              if (sf.type === 'checkbox') {
                input = document.createElement('input');
                input.type = 'checkbox';
                if (sf.checked) input.checked = true;
                input.style.width = 'auto';
              } else if (sf.type === 'textarea') {
                input = document.createElement('textarea');
              } else {
                input = document.createElement('input');
                input.type = sf.type || 'text';
              }
              input.name = sf.name;
              input.id = id;
              applyInputHints(input, sf.name, sf.type);
              wrap.appendChild(input);
            });

            const rm = el('button', 'remove-btn');
            rm.type = 'button';
            rm.textContent = 'Entfernen';
            rm.addEventListener('click', () => wrap.remove());
            wrap.appendChild(rm);

            container.appendChild(wrap);
          } else {
            const row = el('div', 'field-item');

            const id = uid(optEl.value);
            const lab = document.createElement('label');
            lab.textContent = label;
            lab.htmlFor = id;
            row.appendChild(lab);

            const input = document.createElement('input');
            input.name = optEl.value;
            input.type = type || 'text';
            input.id = id;
            applyInputHints(input, optEl.value, type);
            row.appendChild(input);

            const rm = el('button', 'remove-btn');
            rm.type = 'button';
            rm.textContent = 'Entfernen';
            rm.addEventListener('click', () => row.remove());
            row.appendChild(rm);

            container.appendChild(row);
          }

          select.value = '';
        });
      }
    }
  });

  // ---------- Dynamik "ohne Beanstandungen" (Ja/Nein) ----------
  (function setupOhneBeanstandungen() {
    const select = form.querySelector('select[name="ohne_beanstandungen"]');
    if (!select) return;

    // Dynamisches Feld bei Auswahl "Nein"
    const selectRow = select.closest('.form-group');

    const ensureMaengelTextarea = () => {
      let wrap = form.querySelector('#maengel_dynamic_wrap');
      if (!wrap) {
        wrap = document.createElement('div');
        wrap.id = 'maengel_dynamic_wrap';
        wrap.className = 'form-group';
        // Label + ID
        const id = uid('maengel_liste');
        const lab = document.createElement('label');
        lab.textContent = 'Die Wohnung weist folgende Mängel auf:';
        lab.htmlFor = id;
        wrap.appendChild(lab);
        // Textarea
        const ta = document.createElement('textarea');
        ta.name = 'maengel_liste';
        ta.id = id;
        wrap.appendChild(ta);

        // NACH der Select-Zeile einsetzen
        if (selectRow && selectRow.parentNode) {
          selectRow.parentNode.insertBefore(wrap, selectRow.nextSibling);
        } else {
          form.appendChild(wrap);
        }
      }
    };

    const removeMaengelTextarea = () => {
      const wrap = form.querySelector('#maengel_dynamic_wrap');
      if (wrap) wrap.remove();
    };

    const onChange = () => {
      if (select.value === 'Nein') {
        ensureMaengelTextarea();
      } else {
        removeMaengelTextarea();
      }
    };

    select.addEventListener('change', onChange);

    // Initialzustand
    onChange();
  })();

  // ---------- Speichern (Anzeige + LocalStorage) ----------
  document.getElementById('save-btn')?.addEventListener('click', () => {
    const fd = new FormData(form);
    const entries = {};
    for (const [k, v] of fd.entries()) entries[k] = v;

    form.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      if (!entries.hasOwnProperty(cb.name)) {
        entries[cb.name] = cb.checked ? 'on' : '';
      }
    });

    const ul = document.createElement('ul');
    Object.entries(entries).forEach(([k, v]) => {
      if (String(v).trim() === '') return;
      const li = document.createElement('li');
      li.textContent = `${k}: ${v}`;
      ul.appendChild(li);
    });

    out.innerHTML = '<h2>Eingegebene Daten:</h2>';
    out.appendChild(ul);
    out.style.display = 'block';

    try {
      localStorage.setItem('abnahme_form_data', JSON.stringify(entries));
    } catch (e) { }
  });

  // ---------- Reset ----------
  document.getElementById('reset-btn')?.addEventListener('click', () => {
    if (!confirm('Alle Eingaben löschen?')) return;
    form.reset();
    [...root.querySelectorAll('[id^="fields-container-"]')].forEach(c => c.innerHTML = '');
    out.style.display = 'none';
    try { localStorage.removeItem('abnahme_form_data'); } catch (e) { }
    // Dynamisches Feld nach Reset entfernen
    document.querySelector('#maengel_dynamic_wrap')?.remove();
  });

  // ---------- Laden (falls vorhanden) ----------
  (function restore() {
    try {
      const raw = localStorage.getItem('abnahme_form_data');
      if (!raw) return;
      const data = JSON.parse(raw);
      form.querySelectorAll('input, textarea, select').forEach(inp => {
        if (!inp.name) return;
        if (inp.type === 'checkbox') {
          inp.checked = data[inp.name] === 'on';
        } else if (data[inp.name] != null) {
          inp.value = data[inp.name];
        }
      });
      // Falls "Nein" gespeichert war, dynamisches Feld sicherstellen + Wert setzen
      const sel = form.querySelector('select[name="ohne_beanstandungen"]');
      if (sel && sel.value === 'Nein') {
        const selectRow = sel.closest('.form-group');
        let wrap = form.querySelector('#maengel_dynamic_wrap');
        if (!wrap) {
          wrap = document.createElement('div');
          wrap.id = 'maengel_dynamic_wrap';
          wrap.className = 'form-group';
          const id = uid('maengel_liste');
          const lab = document.createElement('label');
          lab.textContent = 'Die Wohnung weist folgende Mängel auf:';
          lab.htmlFor = id;
          wrap.appendChild(lab);
          const ta = document.createElement('textarea');
          ta.name = 'maengel_liste';
          ta.id = id;
          wrap.appendChild(ta);
          if (selectRow && selectRow.parentNode) {
            selectRow.parentNode.insertBefore(wrap, selectRow.nextSibling);
          } else {
            form.appendChild(wrap);
          }
        }
        const ta = form.querySelector('textarea[name="maengel_liste"]');
        if (ta && typeof data['maengel_liste'] === 'string') ta.value = data['maengel_liste'];
      }
    } catch (e) { }
  })();

  // ---------- Echte PDF mit pdf-lib ----------
  document.getElementById('pdf-btn')?.addEventListener('click', async () => {
    if (!window.PDFLib) {
      alert('PDF-Bibliothek (pdf-lib) nicht geladen. Bitte vendor/pdf-lib.min.js einbinden.');
      return;
    }

    const { PDFDocument, StandardFonts, rgb } = PDFLib;

    // ==== Farb-/Layout-Vorgaben ====
    const COLOR_PRIMARY = rgb(0x00 / 255, 0x77 / 255, 0xb6 / 255);      // #0077b6
    const COLOR_PRIMARY_DARK = rgb(0x02 / 255, 0x3e / 255, 0x8a / 255); // #023e8a
    const COLOR_SECTION_BG = rgb(0xf7 / 255, 0xfa / 255, 0xff / 255);   // #f7faff
    const COLOR_BORDER = rgb(0xdd / 255, 0xdd / 255, 0xdd / 255);       // #dddddd
    const COLOR_TEXT = rgb(0, 0, 0);

    // dezentes Grau für Footer-Text
    const COLOR_MUTED = rgb(0.45, 0.45, 0.45);

    // --- Footer: Trennlinie + Seitenzahl "Seite XX von YY" (rechts unten) ---
    const drawFooterForAllPages = (pdf, font) => {
      const pages = pdf.getPages();
      const fs = 9;                 // Schriftgröße Footer
      const textY = 10;             // Y-Position der Seitenzahl
      const lineY = MARGIN - 6;     // Trennlinie knapp unterhalb des Inhaltsbereichs

      pages.forEach((p, i) => {
        const total = pages.length;
        const cur = String(i + 1).padStart(2, '0');
        const tot = String(total).padStart(2, '0');
        const label = `Seite ${cur} von ${tot}`;

        p.drawLine({
          start: { x: MARGIN, y: lineY },
          end: { x: PAGE_W - MARGIN, y: lineY },
          thickness: 0.5,
          color: COLOR_BORDER
        });

        const tw = font.widthOfTextAtSize(label, fs);
        p.drawText(label, {
          x: PAGE_W - MARGIN - tw,
          y: textY,
          size: fs,
          font,
          color: COLOR_MUTED
        });
      });
    };


    const PAGE_W = 595;  // A4
    const PAGE_H = 842;
    const MARGIN = 36;   // ~13mm
    const COL_LABEL_W = 210;
    const COL_VALUE_W = PAGE_W - 2 * MARGIN - COL_LABEL_W;

    try {
      // ---- Daten einsammeln (Mehrfach-Unterstützung) ----
      const fd = new FormData(form);
      const data = {};
      for (const [k, v] of fd.entries()) {
        if (k in data) {
          if (Array.isArray(data[k])) data[k].push(v);
          else data[k] = [data[k], v];
        } else {
          data[k] = v;
        }
      }
      const asStr = x => (x ?? '').toString().trim();
      const isOn = x => asStr(x).toLowerCase() === 'on';

      // ISO-zu-DE-Datum
      const isISODate = s => /^\d{4}-\d{2}-\d{2}$/.test(s);
      const toDE = s => {
        const str = asStr(s);
        if (!isISODate(str)) return str;
        const [y, m, d] = str.split('-');
        return `${d}.${m}.${y}`;
      };


      // ---- PDF anlegen
      const pdf = await PDFDocument.create();

      // Fonts
      let fontRegular = null, fontBold = null;
      try {
        const fontBytes = await fetch('./fonts/DejaVuSans.ttf', { cache: 'force-cache' }).then(r => r.ok ? r.arrayBuffer() : Promise.reject());
        fontRegular = await pdf.embedFont(fontBytes, { subset: true });
        fontBold = fontRegular;
      } catch (_) {
        fontRegular = await pdf.embedFont(StandardFonts.Helvetica);
        fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
      }


      // ==== Logo laden (robust) ====
      let logoImg = null;
      let logoNaturalW = 0, logoNaturalH = 0;

      try {
        // Cache-Busting gegen SW/HTTP-Caches
        const logoURL = new URL(`./img/logo.png?v=${Date.now()}`, location.href).toString();
        const resp = await fetch(logoURL, { cache: 'no-store' });
        if (resp.ok) {
          const bytes = await resp.arrayBuffer();
          try {
            logoImg = await pdf.embedPng(bytes);
          } catch {
            logoImg = await pdf.embedJpg(bytes);
          }
          logoNaturalW = logoImg.width;
          logoNaturalH = logoImg.height;
        } else {
          console.warn('Logo konnte nicht geladen werden (HTTP):', resp.status);
        }
      } catch (e) {
        console.warn('Logo konnte nicht geladen werden:', e);
      }

      // ==== Header mit dynamischer Höhe ====
      const drawHeader = () => {
        const LOGO_MAX_W = 90;   // ~3.2 cm
        const LOGO_MAX_H = 28;   // ~1.0 cm
        const GAP = 8;

        // Farbband oben
        page.drawRectangle({ x: 0, y: PAGE_H - 6, width: PAGE_W, height: 6, color: COLOR_PRIMARY });

        // Logo skalieren, oben links
        let logoW = 0, logoH = 0;
        if (logoImg) {
          const LOGO_H = 40;
          const scale = LOGO_H / logoImg.height;
          const LOGO_W = logoImg.width * scale;

          // Titel-Geometrie (wie bisher)
          const tSize = 18;
          const titleBaselineY = PAGE_H - MARGIN - 10;
          const ASCENT = 0.8, DESCENT = 0.2;
          const titleCenterY = titleBaselineY + (ASCENT - DESCENT) * tSize / 2 - DESCENT * tSize;

          // Feinjustierung: positiver Wert verschiebt nach oben
          const LOGO_OFFSET_Y = 6;   // ← hier 2–4 px ausprobieren

          const yLogo = titleCenterY - LOGO_H / 2 + LOGO_OFFSET_Y;

          page.drawImage(logoImg, {
            x: MARGIN,
            y: yLogo,
            width: LOGO_W,
            height: LOGO_H
          });
        }

        // Titel, rechts von Logo, kollisionsfrei)
        const title = 'Wohnungsabnahmeprotokoll';
        const tSize = 18;
        const tW = textW(title, tSize, true);
        const titleY = PAGE_H - MARGIN - 10;
        const titleXLeftLimit = MARGIN + (logoW ? (logoW + GAP) : 0);
        const titleX = Math.max(titleXLeftLimit, PAGE_W - MARGIN - tW);
        drawText(title, titleX, titleY, tSize, COLOR_PRIMARY_DARK, true);

        // feine Linie unter Kopf; Unterkante = unterer Rand von Logo/Titel minus Luft
        const logoBottom = logoW ? (titleY - (logoH - 6)) : titleY;
        const titleBottom = titleY - tSize;
        const contentTopY = Math.min(logoBottom, titleBottom) - 8;

        page.drawLine({
          start: { x: MARGIN, y: contentTopY },
          end: { x: PAGE_W - MARGIN, y: contentTopY },
          thickness: 0.5,
          color: COLOR_BORDER
        });

        // Cursor unterhalb des höchsten Elements fortsetzen
        cursorY = contentTopY - 10; // zusätzliche Luft
      };


      // ——— Helpers
      const newPage = () => pdf.addPage([PAGE_W, PAGE_H]);
      let page = newPage();
      let cursorY = PAGE_H - MARGIN;

      const textW = (t, size = 10, bold = false) => (bold ? fontBold : fontRegular).widthOfTextAtSize(t, size);
      const drawText = (t, x, y, size = 10, color = COLOR_TEXT, bold = false) => {
        page.drawText(t, { x, y, size, font: bold ? fontBold : fontRegular, color });
      };
      const ensureSpace = (need) => {
        if (cursorY - need < MARGIN) {
          page = newPage();
          cursorY = PAGE_H - MARGIN;
          drawHeader(); // Kopf auch auf Folgeseiten
          cursorY -= 16; // etwas Luft
        }
      };

      // Enter-Zeilenumbrüche
      const wrap = (txt, maxW, size = 10, bold = false) => {
        const paras = String(txt ?? '')
          .replace(/\r\n/g, '\n')
          .replace(/\r/g, '\n')
          .split('\n');

        const out = [];
        for (const para of paras) {
          if (para === '') { out.push(''); continue; }  // leere Zeile erhalten
          const words = para.split(/\s+/);
          let line = '';
          for (const w of words) {
            const test = line ? line + ' ' + w : w;
            if (textW(test, size, bold) <= maxW) {
              line = test;
            } else {
              if (line) out.push(line);
              line = w;
            }
          }
          out.push(line);
        }
        return out;
      };

      // --- Layout-Messung für saubere Seitenumbrüche ---
      const CELL_PAD = 6;
      const FONT_SIZE = 10;
      const SECTION_HEADER_H = 22 + 6; // drawSectionHeader: Höhe + Abstand


      const measureRowH = (lab, val) => {
        const labLines = wrap(lab, COL_LABEL_W - 2 * CELL_PAD, FONT_SIZE);
        const valLines = Array.isArray(val)
          ? val.flatMap(v => wrap(String(v), COL_VALUE_W - 2 * CELL_PAD, FONT_SIZE))
          : wrap(val, COL_VALUE_W - 2 * CELL_PAD, FONT_SIZE);
        const lines = Math.max(labLines.length, valLines.length);
        return lines * (FONT_SIZE + 3) + 2 * CELL_PAD;
      };

      const measureKVTableHeight = (rows) =>
        rows.reduce((sum, r) => sum + measureRowH(r[0], r[1]), 0) + 8;

      drawHeader();

      // Abschnitts-Header (hell hinterlegt + linke Farbmarke)
      const drawSectionHeader = (title) => {
        const h = 22;
        ensureSpace(h + 10);
        page.drawRectangle({
          x: MARGIN, y: cursorY - h,
          width: PAGE_W - 2 * MARGIN, height: h,
          color: COLOR_SECTION_BG
        });
        page.drawRectangle({
          x: MARGIN, y: cursorY - h, width: 4, height: h, color: COLOR_PRIMARY
        });
        drawText(title, MARGIN + 10, cursorY - 14, 12, COLOR_PRIMARY_DARK, true);
        cursorY -= h + 6;
      };

      // 2-Spalten-Tabelle
      const drawKVTable = (rows) => {
        if (!rows.length) return;

        const tableX = MARGIN, tableW = PAGE_W - 2 * MARGIN;
        let y = cursorY;

        rows.forEach(([lab, val]) => {
          const rowH = measureRowH(lab, val);

          // obere Linie
          page.drawLine({ start: { x: tableX, y }, end: { x: tableX + tableW, y }, thickness: 0.5, color: COLOR_BORDER });

          // vertikale Trennlinie
          page.drawLine({ start: { x: tableX + COL_LABEL_W, y }, end: { x: tableX + COL_LABEL_W, y: y - rowH }, thickness: 0.5, color: COLOR_BORDER });

          // Label
          let txtY = y - CELL_PAD - FONT_SIZE;
          wrap(lab, COL_LABEL_W - 2 * CELL_PAD, FONT_SIZE).forEach(line => {
            drawText(line, tableX + CELL_PAD, txtY, FONT_SIZE, COLOR_TEXT);
            txtY -= (FONT_SIZE + 3);
          });

          // Value
          txtY = y - CELL_PAD - FONT_SIZE;
          const valLines = Array.isArray(val)
            ? val.flatMap(v => wrap(String(v), COL_VALUE_W - 2 * CELL_PAD, FONT_SIZE))
            : wrap(val, COL_VALUE_W - 2 * CELL_PAD, FONT_SIZE);
          valLines.forEach(line => {
            drawText(line, tableX + COL_LABEL_W + CELL_PAD, txtY, FONT_SIZE, COLOR_TEXT);
            txtY -= (FONT_SIZE + 3);
          });

          // untere Linie
          page.drawLine({ start: { x: tableX, y: y - rowH }, end: { x: tableX + tableW, y: y - rowH }, thickness: 0.5, color: COLOR_BORDER });

          y -= rowH;
        });

        cursorY = y - 8; // Endabstand
      };

      // Hilfsfunktionen für Mehrfachwerte
      const countOf = (name) => {
        const v = data[name];
        if (Array.isArray(v)) return v.length;
        return asStr(v) ? 1 : 0;
      };
      const valueAt = (name, i) => {
        const v = data[name];
        if (Array.isArray(v)) return v[i];
        return i === 0 ? v : undefined;
      };

      // ===== Inhalt aus form_sections =====
      window.form_sections.forEach(section => {
        const rows = [];

        // ---- Sonderlogik für "Mängelregelung" ----
        let skipOtherFieldsInThisSection = false;
        const isMaengel = section.title === 'Mängelregelung';
        if (isMaengel) {
          const sel = asStr(data['ohne_beanstandungen']);
          if (sel) {
            // Immer die Auswahl in die Tabelle schreiben
            rows.push(['Die Wohnungsabnahme erfolgte ohne Beanstandungen', sel]);

            if (sel === 'Ja') {
              // Wenn Ja: NUR diese eine Zeile ausgeben (sonst nichts aus diesem Abschnitt)
              skipOtherFieldsInThisSection = true;
            } else {
              // Wenn Nein: zusätzlich dynamisches Textarea (falls vorhanden)
              const liste = asStr(data['maengel_liste']);
              if (liste) {
                rows.push(['Die Wohnung weist folgende Mängel auf', liste]);
              }
            }
          }
        }

        // feste Felder
        if (!(isMaengel && skipOtherFieldsInThisSection)) {
          (section.fields || []).forEach(f => {
            if (isMaengel && f.name === 'ohne_beanstandungen') return;

            const v = data[f.name];
            if (Array.isArray(v)) {
              v.forEach((vv, i) => { if (asStr(vv)) rows.push([`${f.label} (${i + 1})`, toDE(vv)]); });
            } else if (asStr(v)) {
              rows.push([f.label, toDE(v)]);
            }
          });
        }

        // optionale Gruppen
        (section.options || []).forEach(opt => {
          const sub = opt.subfields || [];
          const fld = opt.fields || []; // „Weitere Räume“

          if (sub.length) {
            const maxN = Math.max(0, ...sub.map(sf => countOf(sf.name)));
            for (let i = 0; i < maxN; i++) {
              const inner = [];
              sub.forEach(sf => {
                const vi = valueAt(sf.name, i);
                const s = asStr(vi);
                if (sf.type === 'checkbox') { if (isOn(s)) inner.push(`${sf.label}: Ja`); }
                else if (s) inner.push(`${sf.label}: ${toDE(s)}`);
              });
              if (inner.length) rows.push([maxN > 1 ? `${opt.label} (${i + 1})` : opt.label, inner]);
            }
          } else if (fld.length) {
            const maxN = Math.max(0, ...fld.map(f => countOf(f.name)));
            for (let i = 0; i < maxN; i++) {
              const inner = [];
              fld.forEach(f => {
                const vi = valueAt(f.name, i);
                const s = asStr(vi);
                if (f.type === 'checkbox') { if (isOn(s)) inner.push(`${f.label}: Ja`); }
                else if (s) inner.push(`${f.label}: ${s}`);
              });
              if (inner.length) rows.push([maxN > 1 ? `${opt.label} (${i + 1})` : opt.label, inner]);
            }
          } else {
            const v = data[opt.name];
            if (Array.isArray(v)) {
              v.forEach((vv, i) => { if (asStr(vv)) rows.push([`${opt.label} (${i + 1})`, vv]); });
            } else if (asStr(v)) {
              rows.push([opt.label, v]);
            }
          }
        });

        if (!rows.length) return;

        // Einleitungszeile
        const introMap = {
          //'Schlüsselrückgabe': 'Der Mieter hat folgende Schlüssel zurückgegeben:',
          'Zählerstände': 'Folgende Zählerstände wurden bei der Wohnungsabnahme von beiden Parteien abgelesen:',
          'Neue Anschrift des Mieters': 'Dem Mieter ist bekannt, dass die Betriebskostenrechnung an seine neue Anschrift übersandt wird und etwaige Nachzahlungen zu begleichen sind.'
        };
        const introRows = introMap[section.title] ? [['', introMap[section.title]]] : [];

        // VORAB: Gesamtplatz berechnen und Seite ggf. wechseln
        const need = SECTION_HEADER_H + measureKVTableHeight(introRows) + measureKVTableHeight(rows);
        ensureSpace(need);

        // Jetzt zeichnen
        drawSectionHeader(section.title);
        if (introRows.length) drawKVTable(introRows);
        drawKVTable(rows);
      });

      // ===== Unterschriftenbereich =====
      const rawDate = data['datum'];
      let header = 'Dresden, den .............................';
      if (asStr(rawDate)) {
        try {
          const d = new Date(rawDate);
          const dd = String(d.getDate()).padStart(2, '0');
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const yyyy = d.getFullYear();
          header = `Dresden, den ${dd}.${mm}.${yyyy}`;
        } catch (e) { }
      }

      const gap = 16;
      const fieldH = 90;
      const halfW = (PAGE_W - 2 * MARGIN - gap) / 2;

      // VORAB-Platz für Unterschriften prüfen
      const needSig = SECTION_HEADER_H + measureKVTableHeight([['', header]]) + fieldH + 30;
      ensureSpace(needSig);

      // Zeichnen
      drawSectionHeader('Unterschriften');
      drawKVTable([['', header]]);

      const topY = cursorY - 6;
      const drawSignBox = (x, y, w, h, legend) => {
        const PAD_TOP = 12;
        const PAD_X = 14;
        const fs = 9;

        // Rahmen
        page.drawRectangle({
          x, y: y - h, width: w, height: h,
          borderWidth: 1, borderColor: COLOR_TEXT
        });

        // Label-Zeilen mit Padding umbrechen
        const lines = wrap(legend, w - 2 * PAD_X, fs, true);

        // Start-Baseline
        let baseline = y - PAD_TOP - fs;
        lines.forEach(line => {
          const lw = textW(line, fs, true);
          const cx = x + (w - lw) / 2;
          drawText(line, cx, baseline, fs, COLOR_TEXT, true);
          baseline -= (fs + 2);
        });

        // Signaturlinie unten
        const signLineY = y - h + 26;
        page.drawLine({
          start: { x: x + 20, y: signLineY },
          end: { x: x + w - 20, y: signLineY },
          thickness: 0.8, color: COLOR_TEXT
        });
      };

      drawSignBox(MARGIN, topY, halfW, fieldH, 'Unterschrift des Vermieters bzw. seines Bevollmächtigten');
      drawSignBox(MARGIN + halfW + gap, topY, halfW, fieldH, 'Unterschrift des Mieters bzw. seines Bevollmächtigten');
      cursorY = topY - fieldH - 30;

     // Footer + Download
      drawFooterForAllPages(pdf, fontRegular);
      const pdfBytes = await pdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'Wohnungsabnahmeprotokoll.pdf';
      document.body.appendChild(a); a.click(); a.remove();
      try { URL.revokeObjectURL(url); } catch { }
    } catch (err) {
      console.error('PDF-Fehler:', err);
      alert('PDF-Erstellung fehlgeschlagen. Siehe Konsole für Details.');
    }
  });

  if (navigator.serviceWorker && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage('getVersion');
    navigator.serviceWorker.addEventListener('message', e => {
      if (e.data?.type === 'version') {
        const vi = document.getElementById('version-info');
        if (vi) vi.textContent = 'Version: ' + e.data.version;
      }
    });
  }

})();
