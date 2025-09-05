
window.form_sections = [
  {
    "title": "Allgemeine Daten",
    "fields": [
      { "label": "Datum", "name": "datum", "type": "date" },
      { "label": "zur Wohnung (Nr., Etage, Objekt)", "name": "wohnung_nr_etage_objekt", "type": "text" },
      { "label": "Straße, Hausnummer", "name": "straße_hausnummer", "type": "text" },
      { "label": "Postleitzahl, Ort", "name": "plz_ort", "type": "text" },
      { "label": "Übergebender (Mieter)", "name": "uebergebender", "type": "text" },
      { "label": "Übernehmender (Vermieter)", "name": "uebernehmender", "type": "text" }
    ]
  },

  /*
  {
    "title": "Schlüsselrückgabe",
    "fields": [
      { "label": "Haus-/Wohnungsschlüssel (Anzahl)", "name": "haus_schluessel", "type": "number" },
      { "label": "Haus-/Wohnungsschlüssel Nr.", "name": "haus_schluessel_nr", "type": "text" },
      { "label": "Briefkastenschlüssel (Anzahl)", "name": "brief_schluessel", "type": "number" },
      { "label": "Zimmerschlüssel (Anzahl)", "name": "zimmer_schluessel", "type": "number" }
    ]
  },
  */

    {
    "title": "Der Mieter hat folgende Schlüssel zurückgegeben",
    "options": [
      {
        "label": "Haus-/Wohnungsschlüssel",
        "name": "hausschluessel",
        "type": "multi",
        "subfields": [
          {"label": "Anzahl", "name": "anzahl_hausschluessel", "type": "number"},
          {"label": "Haus-/Wohnungsschlüssel Nr", "name": "hausschluessel_nummer", "type": "text"}
        ]
      },
      {
        "label": "Briefkastenschlüssel",
        "name": "briefkastenschluessel",
        "type": "multi",
        "subfields": [
          {"label": "Anzahl", "name": "anzahl_briefkastenschluessel", "type": "number"}
        ]
      },
      {
        "label": "Zimmerschlüssel",
        "name": "zimmerschluessel",
        "type": "multi",
        "subfields": [
          {"label": "Anzahl", "name": "anzahl_zimmerschluessel", "type": "number"},
          {"label": "Anmerkungen", "name": "zimmerschluessel_anmerkungen", "type": "text"}
        ]
      },
      {
        "label": "Kellerschlüssel",
        "name": "kellerschluessel",
        "type": "multi",
        "subfields": [
          {"label": "Anzahl", "name": "anzahl_kellerschluessel", "type": "number"},
          {"label": "Anmerkungen", "name": "kellerschluessel_anmerkungen", "type": "text"}
        ]
      },
      {
        "label": "Garagenschlüssel",
        "name": "garagenschluessel",
        "type": "multi",
        "subfields": [
          {"label": "Anzahl", "name": "anzahl_garagenschluessel", "type": "number"},
          {"label": "Anmerkungen", "name": "garagenschluessel_anmerkungen", "type": "text"}
        ]
      },
    ]
  },

  {
    "title": "Zählerstände",
    "options": [
      {
        "label": "Warmwasser",
        "name": "warmwasser",
        "type": "multi",
        "subfields": [
          { "label": "Zähler-Nr.", "name": "warmwasser_nr", "type": "text" },
          { "label": "Zählerstand", "name": "warmwasser_stand", "type": "text" }
        ]
      },
      {
        "label": "Kaltwasser",
        "name": "kaltwasser",
        "type": "multi",
        "subfields": [
          { "label": "Zähler-Nr.", "name": "kaltwasser_nr", "type": "text" },
          { "label": "Zählerstand", "name": "kaltwasser_stand", "type": "text" }
        ]
      },
      {
        "label": "Strom",
        "name": "strom",
        "type": "multi",
        "subfields": [
          { "label": "Zähler-Nr.", "name": "strom_nr", "type": "text" },
          { "label": "Zählerstand", "name": "strom_stand", "type": "text" }
        ]
      },
      {
        "label": "Heizung Bad",
        "name": "heizung_bad",
        "type": "multi",
        "subfields": [
          { "label": "Zähler-Nr.", "name": "heizung_bad_nr", "type": "text" },
          { "label": "Zählerstand", "name": "heizung_bad_stand", "type": "text" }
        ]
      },
      {
        "label": "Heizung Wohnzimmer",
        "name": "heizung_wohnzimmer",
        "type": "multi",
        "subfields": [
          { "label": "Zähler-Nr.", "name": "heizung_wohnzimmer_nr", "type": "text" },
          { "label": "Zählerstand", "name": "heizung_wohnzimmer_stand", "type": "text" }
        ]
      },
      {
        "label": "Heizung Schlafzimmer",
        "name": "heizung_schlafzimmer",
        "type": "multi",
        "subfields": [
          { "label": "Zähler-Nr.", "name": "heizung_schlafzimmer_nr", "type": "text" },
          { "label": "Zählerstand", "name": "heizung_schlafzimmer_stand", "type": "text" }
        ]
      },
      {
        "label": "Heizung Kinderzimmer",
        "name": "heizung_kinderzimmer",
        "type": "multi",
        "subfields": [
          { "label": "Zähler-Nr.", "name": "heizung_kinderzimmer_nr", "type": "text" },
          { "label": "Zählerstand", "name": "heizung_kinderzimmer_stand", "type": "text" }
        ]
      },
      {
        "label": "Heizung Küche",
        "name": "heizung_kueche",
        "type": "multi",
        "subfields": [
          { "label": "Zähler-Nr.", "name": "heizung_kueche_nr", "type": "text" },
          { "label": "Zählerstand", "name": "heizung_kueche_stand", "type": "text" }
        ]
      },
      {
        "label": "Heizung Diele",
        "name": "heizung_diele",
        "type": "multi",
        "subfields": [
          { "label": "Zähler-Nr.", "name": "heizung_diele_nr", "type": "text" },
          { "label": "Zählerstand", "name": "heizung_diele_stand", "type": "text" }
        ]
      }
    ]
  },

  {
    "title": "Ausstattung / Mängel - Bad",
    "fields":
      [
        {
          "label": "Art der Böden",
          "name": "boeden_bad",
          "type": "select",
          "options": ["Vinyl", "Laminat", "PVC-Belag", "Fliesen", "Parkett"]
        },
        {
          "label": "Art der Wände",
          "name": "waende_bad",
          "type": "select",
          "options": ["Raufaser", "Glattputz", "Rauputz", "Fliesen"]
        },
        { "label": "Anmerkungen", "name": "Anmerkungen_bad", "type": "textarea" }
      ],
    "options":
      [
        {
          "label": "Badewanne mit Wannenfüll- und Brausebatterie",
          "name": "badewanne",
          "type": "multi",
          "subfields": [
            { "label": "Vorhanden", "name": "badewanne_check", "type": "checkbox", "checked": true },
            { "label": "Mangel", "name": "badewanne_maengel", "type": "text" }
          ]
        },
        {
          "label": "Duschkabine mit Armatur",
          "name": "duschkabine",
          "type": "multi",
          "subfields": [
            { "label": "Vorhanden", "name": "duschkabine_check", "type": "checkbox", "checked": true },
            { "label": "Mangel", "name": "duschkabine_maengel", "type": "text" }
          ]
        },
        {
          "label": "Waschbecken mit Armatur",
          "name": "waschbecken",
          "type": "multi",
          "subfields": [
            { "label": "Vorhanden", "name": "waschbecken_check", "type": "checkbox", "checked": true },
            { "label": "Mangel", "name": "waschbecken_maengel", "type": "text" }
          ]
        },
        {
          "label": "WC-Anlage",
          "name": "wc",
          "type": "multi",
          "subfields": [
            { "label": "Vorhanden", "name": "wc_check", "type": "checkbox", "checked": true },
            { "label": "Mangel", "name": "wc_maengel", "type": "text" }
          ]
        },
        {
          "label": "Gäste-WC mit Handwaschbecken",
          "name": "gaeste_wc",
          "type": "multi",
          "subfields": [
            { "label": "Vorhanden", "name": "gaeste_wc_check", "type": "checkbox", "checked": true },
            { "label": "Mangel", "name": "gaeste_wc_maengel", "type": "text" }
          ]
        },
        {
          "label": "Glas-/Porzellan-/Kunststoffablage",
          "name": "ablage",
          "type": "multi",
          "subfields": [
            { "label": "Vorhanden", "name": "ablage_check", "type": "checkbox", "checked": true },
            { "label": "Mangel", "name": "ablage_maengel", "type": "text" }
          ]
        },
        {
          "label": "Doppelglashalter, verchromt, Kunststoff",
          "name": "doppelglashalter",
          "type": "multi",
          "subfields": [
            { "label": "Vorhanden", "name": "doppelglashalter_check", "type": "checkbox", "checked": true },
            { "label": "Mangel", "name": "doppelglashalter_maengel", "type": "text" }
          ]
        },
        {
          "label": "Handtuchhalter doppelt, verchromt",
          "name": "handtuchhalter_doppelt",
          "type": "multi",
          "subfields": [
            { "label": "Vorhanden", "name": "handtuchhalter_doppelt_check", "type": "checkbox", "checked": true },
            { "label": "Mangel", "name": "handtuchhalter_doppelt_maengel", "type": "text" }
          ]
        },
        {
          "label": "Handtuchhalter einfach, verchromt",
          "name": "handtuchhalter_einfach",
          "type": "multi",
          "subfields": [
            { "label": "Vorhanden", "name": "handtuchhalter_einfach_check", "type": "checkbox", "checked": true },
            { "label": "Mangel", "name": "handtuchhalter_einfach_maengel", "type": "text" }
          ]
        },
        {
          "label": "Papierhalter, Nirosta- blank, mit Klappe",
          "name": "papierhalter",
          "type": "multi",
          "subfields": [
            { "label": "Vorhanden", "name": "papierhalter_check", "type": "checkbox", "checked": true },
            { "label": "Mangel", "name": "papierhalter_maengel", "type": "text" }
          ]
        },
        {
          "label": "Spiegel",
          "name": "spiegel",
          "type": "multi",
          "subfields": [
            { "label": "Vorhanden", "name": "spiegel_check", "type": "checkbox", "checked": true },
            { "label": "Mangel", "name": "spiegel_maengel", "type": "text" }
          ]
        },
        {
          "label": "Waschmaschinenanschluss",
          "name": "waschmaschinenanschluss",
          "type": "multi",
          "subfields": [
            { "label": "Vorhanden", "name": "waschmaschinenanschluss_check", "type": "checkbox", "checked": true },
            { "label": "Mangel", "name": "waschmaschinenanschluss_maengel", "type": "text" }
          ]
        },
        {
          "label": "Toilettenbürstenhalter",
          "name": "toilettenbuerste",
          "type": "multi",
          "subfields": [
            { "label": "Vorhanden", "name": "toilettenbuerste_check", "type": "checkbox", "checked": true },
            { "label": "Mangel", "name": "toilettenbuerste_maengel", "type": "text" }
          ]
        }
      ]
  },

  {
    "title": "Ausstattung / Mängel - Küche",
    "fields":
      [
        {
          "label": "Art der Böden",
          "name": "boden_kueche",
          "type": "select",
          "options": ["Vinyl", "Laminat", "PVC-Belag", "Fliesen", "Parkett"]
        },
        {
          "label": "Art der Wände",
          "name": "waende_kueche",
          "type": "select",
          "options": ["Raufaser", "Glattputz", "Rauputz", "Fliesen"]
        },
        { "label": "Anmerkungen", "name": "Anmerkungen_kueche", "type": "textarea" }
      ],
    "options":
      [
        {
          "label": "Einbauherd und Abzugshaube",
          "name": "herd",
          "type": "multi",
          "subfields": [
            { "label": "Vorhanden", "name": "herd_check", "type": "checkbox", "checked": true },
            { "label": "Mangel", "name": "herd_maengel", "type": "text" }
          ]
        },
        {
          "label": "Einbaukühlschrank",
          "name": "kuehlschrank",
          "type": "multi",
          "subfields": [
            { "label": "Vorhanden", "name": "kuehlschrank_check", "type": "checkbox", "checked": true },
            { "label": "Mangel", "name": "kuehlschrank_maengel", "type": "text" }
          ]
        },
        {
          "label": "Spüle mit Armatur",
          "name": "spuele",
          "type": "multi",
          "subfields": [
            { "label": "Vorhanden", "name": "spuele_check", "type": "checkbox", "checked": true },
            { "label": "Mangel", "name": "spuele_maengel", "type": "text" }
          ]
        },
        {
          "label": "Unterschränke",
          "name": "unterschraenke",
          "type": "multi",
          "subfields": [
            { "label": "Vorhanden", "name": "unterschraenke_check", "type": "checkbox", "checked": true },
            { "label": "Mangel", "name": "unterschraenke_maengel", "type": "text" }
          ]
        },
        {
          "label": "Hängeschränke",
          "name": "haengeschraenke",
          "type": "multi",
          "subfields": [
            { "label": "Vorhanden", "name": "haengeschraenke_check", "type": "checkbox", "checked": true },
            { "label": "Mangel", "name": "haengeschraenke_maengel", "type": "text" }
          ]
        },
        {
          "label": "Besteckkasten",
          "name": "besteckkasten",
          "type": "multi",
          "subfields": [
            { "label": "Vorhanden", "name": "besteckkasten_check", "type": "checkbox", "checked": true },
            { "label": "Mangel", "name": "besteckkasten_maengel", "type": "text" }
          ]
        },
        {
          "label": "Weitere Ausstattung",
          "name": "weitere_ausstattung_kueche",
          "type": "multi",
          "subfields": [
            { "label": "Vorhanden", "name": "weitere_ausstattung_kueche_check", "type": "checkbox", "checked": true },
            { "label": "Ausstattung", "name": "weitere_ausstattung_kueche_ausstattung", "type": "text" }
          ]
        }
      ]
  },

  {
    "title": "Weitere Räume",
    "options": [
      {
        "label": "Flur / Diele",
        "name": "raum_flur",
        "type": "multi",
        "fields": [
          {
            "label": "Art der Böden", "name": "boden_flur", "type": "select",
            "options": ["Vinyl", "Laminat", "PVC-Belag", "Fliesen", "Parkett"]
          },
          {
            "label": "Art der Wände", "name": "waende_flur", "type": "select",
            "options": ["Raufaser", "Glattputz", "Rauputz", "Fliesen"]
          },
          { "label": "Anmerkungen", "name": "Anmerkungen_flur", "type": "textarea" }
        ]
      },
      {
        "label": "Wohnzimmer",
        "name": "raum_wohnzimmer",
        "type": "multi",
        "fields": [
          {
            "label": "Art der Böden", "name": "boden_wohnzimmer", "type": "select",
            "options": ["Vinyl", "Laminat", "PVC-Belag", "Fliesen", "Parkett"]
          },
          {
            "label": "Art der Wände", "name": "waende_wohnzimmer", "type": "select",
            "options": ["Raufaser", "Glattputz", "Rauputz", "Fliesen"]
          },
          { "label": "Anmerkungen", "name": "Anmerkungen_wohnzimmer", "type": "textarea" }
        ]
      },
      {
        "label": "Schlafzimmer",
        "name": "raum_schlafzimmer",
        "type": "multi",
        "fields": [
          {
            "label": "Art der Böden", "name": "boden_schlafzimmer", "type": "select",
            "options": ["Vinyl", "Laminat", "PVC-Belag", "Fliesen", "Parkett"]
          },
          {
            "label": "Art der Wände", "name": "waende_schlafzimmer", "type": "select",
            "options": ["Raufaser", "Glattputz", "Rauputz", "Fliesen"]
          },
          { "label": "Anmerkungen", "name": "Anmerkungen_schlafzimmer", "type": "textarea" }
        ]
      },
      {
        "label": "Kinderzimmer",
        "name": "raum_kinderzimmer",
        "type": "multi",
        "fields": [
          {
            "label": "Art der Böden", "name": "boden_kinderzimmer", "type": "select",
            "options": ["Vinyl", "Laminat", "PVC-Belag", "Fliesen", "Parkett"]
          },
          {
            "label": "Art der Wände", "name": "waende_kinderzimmer", "type": "select",
            "options": ["Raufaser", "Glattputz", "Rauputz", "Fliesen"]
          },
          { "label": "Anmerkungen", "name": "Anmerkungen_kinderzimmer", "type": "textarea" }
        ]
      },
      {
        "label": "Balkon",
        "name": "raum_balkon",
        "type": "multi",
        "fields": [
          {
            "label": "Art der Böden", "name": "boden_balkon", "type": "select",
            "options": ["Vinyl", "Laminat", "PVC-Belag", "Fliesen", "Parkett"]
          },
          {
            "label": "Art der Wände", "name": "waende_balkon", "type": "select",
            "options": ["Raufaser", "Glattputz", "Rauputz", "Fliesen", "Ohne"]
          },
          { "label": "Anmerkungen", "name": "Anmerkungen_balkon", "type": "textarea" }
        ]
      },
      {
        "label": "Keller / Dachbodenanteil",
        "name": "raum_keller_dachboden",
        "type": "multi",
        "fields": [
          {
            "label": "Art der Böden", "name": "boden_keller_dachboden", "type": "select",
            "options": ["Vinyl", "Laminat", "PVC-Belag", "Fliesen", "Parkett"]
          },
          {
            "label": "Art der Wände", "name": "waende_keller_dachboden", "type": "select",
            "options": ["Raufaser", "Glattputz", "Rauputz", "Fliesen"]
          },
          { "label": "Anmerkungen", "name": "Anmerkungen_keller_dachboden", "type": "textarea" }
        ]
      },
      {
        "label": "Garage / Carport",
        "name": "raum_garage_carport",
        "type": "multi",
        "fields": [
          {
            "label": "Art der Böden", "name": "boden_garage_carport", "type": "select",
            "options": ["Vinyl", "Laminat", "PVC-Belag", "Fliesen", "Parkett"]
          },
          {
            "label": "Art der Wände", "name": "waende_garage_carport", "type": "select",
            "options": ["Raufaser", "Glattputz", "Rauputz", "Fliesen"]
          },
          { "label": "Anmerkungen", "name": "Anmerkungen_garage_carport", "type": "textarea" }
        ]
      },
      {
        "label": "Anmerkungen",
        "name": "raum_Anmerkungen",
        "type": "multi",
        "fields": [
          { "label": "Anmerkungen", "name": "Anmerkungen_Anmerkungen", "type": "textarea" }
        ]
      }
    ]
  },


  {
    "title": "Mängelregelung",
    "fields": [
      {
        "label": "Die Wohnungsabnahme erfolgte ohne Beanstandungen",
        "name": "ohne_beanstandungen",
        "type": "select",
        "options": ["Ja", "Nein"]
      },
      {
        "label": "Die Mängel werden vom bisherigen Mieter noch beseitigt und zwar bis zum: ",
        "name": "maengel_beseitigung_bis",
        "type": "date"
      },
      {
        "label": "Mängel brauchen vom Mieter nicht beseitigt werden, weil ",
        "name": "maengel_begruendung",
        "type": "textarea"
      }
    ]
  },

  {
    "title": "Neue Anschrift des Mieters",
    "fields": [
      { "label": "Name", "name": "neue_name", "type": "text" },
      { "label": "Straße, Hausnummer", "name": "neue_strasse", "type": "text" },
      { "label": "Postleitzahl, Wohnort", "name": "neue_wohnort", "type": "text" },
      { "label": "Telefonnummer", "name": "neue_tel", "type": "text" },
      { "label": "Kontoverbindung", "name": "neue_konto", "type": "text" }
    ]
  }
];
