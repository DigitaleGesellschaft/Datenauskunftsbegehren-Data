# Datenauskunftsbegehren Data
[![Build data.json](https://github.com/DigitaleGesellschaft/Datenauskunftsbegehren-Data/actions/workflows/deployStaging.yml/badge.svg?branch=main)](https://github.com/DigitaleGesellschaft/Datenauskunftsbegehren-Data/actions/workflows/deployStaging.yml)

In diesem Repository werden die Daten für den Onlinegenerator für Datenauskunftsbegehren verwaltet.

## Daten editieren
3 Datenstrukturen sind vorhanden:
- Organisationen (`/data/orgs`)
- Arten von Dienstleistungen/Firmen (`/data/types`)
- Ereignisse (`/data/events`)

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
npm run compile-json
```
