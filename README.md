# Datenauskunftsbegehren Data
[![Build data.json](https://github.com/DigitaleGesellschaft/Datenauskunftsbegehren-Data/actions/workflows/deployStaging.yml/badge.svg?branch=main)](https://github.com/DigitaleGesellschaft/Datenauskunftsbegehren-Data/actions/workflows/deployStaging.yml)

In diesem Repository werden die Daten für den Onlinegenerator für Datenauskunftsbegehren verwaltet.

## Daten editieren
4 Datenstrukturen sind vorhanden:
- Organisationen (`/data/orgs`)
- Arten von Dienstleistungen/Firmen (`/data/types`)
- Ereignisse (`/data/events`)
- Begehren, insbes. Nachfassen (`/data/desires`)

Pro Organisation/Art/Ereignis wird ein `.yml` file angelegt. Der Filename ist nicht relevant.

### Variablen
Variablen werden in der Form `{type:name:label}` in den Texten definiert. Hierbei gilt es folgendes zu beachten:
- `name` soll über den gesamten Datensatz eindeutig sein wenn das gleiche gemeint ist (z.B. `mobileNumber`)
- `type` ist optional und kann/sollte einer der folgenden Werte sein: `string`, `number`, `tel`, `email`, `date`
- `label` kann auch Leerzeichen enthalten und wird der Userin angezeigt

### History
Organisationen können einen `history` Eintrag (ein `array`) halten. Einzig der type `removed` ist im Moment unterstützt. Beispiel:
```
history:
  - action: removed
    date: '2021-06-05T00:00:00.000Z'
    reason: 'Die Firma XY....'
```
## JSON generieren
```bash
nvm use
npm install
npm run compile
```

## Angaben (regelmässig) auf Aktualität prüfen

1. Ermittlung aller Datensätze mit Referenz auf
   - ein bestimmtes Datum einer Datenschutzerklärung
   - eine zitierte Web-Adresse mit Reglementen
   - eine konkrete Web-Adresse der Datenschutzerklärung
   
2. Schrittfolge zur Ermittlung einer Liste 
   1. Suche alle Datendateien mit Endung "yml" und gebe diese Liste durch "\0" getrennt aus.
   2. Suche in jeder Datei der durch obige Liste gegebenen Dateinamen nach
      - der Zeichenfolge " privacyStatement:"
      - der Zeichenfolge " address: *http" (" *" ==>  mindestens ein Leerzeichen)
      - der Zeichenfolge " privacyStatementDate:"
   3. Reduziere die Ausgabe auf den Dateinamen der jeweiligen Fundstelle
   4. Sortiere die Dateinamen und entferne doppelte
   5. Schreibe die Liste in die Datei datensaetze_zu_pruefen.txt

  ```bash 
  find data -type f -name "*yml" -print0 | \
     xargs -0 grep -e " privacyStatement:" \
                   -e " address: *http" \
                   -e " privacyStatementDate:" | \
     sed -e 's#:.*$##' | \
     sort -u > datensaetze_zu_pruefen.txt
   ```

## Lint

Lint test files with:

    npm run lint

## Tests

Ganze Testsuite:

    npm run test

Einzelner, parametrisierter Test ausführen (`-t <regex>`):

    npx vitest run tests/validate.test.js -t "org"
    npx vitest run tests/validate.test.js -t "type"
    npx vitest run tests/validate.test.js -t "event"

**Info**: vitest mit `--bail 1` führt dennoch alle Sub-Tests in einem paremetrisierten Testcase aus. 
Daher bezieht sich bail wohl auf die Test-Function selbst.