# Placebook — build iOS locale

## Ambiente verificato

- Xcode 26.3 (17C529), Node 22.23.2 (`nvm use` nella cartella mobile).
- Expo 57.0.22, expo-modules-core 57.0.18, expo-modules-jsi 57.1.0, React Native 0.86.0.
- Bundle `com.since56k.places`, Team `7B976BPMDZ`.
- Release: signing manuale, profilo `Places iOS App Store 3`.
- Versione 0.1.0, Build 2 (app.json, progetto Xcode e Info.plist allineati).

## Correzione Xcode 26

Il 15 settembre 2026 il file JavaScriptRuntime.swift installato coincideva, salvo spaziatura, con il [branch ufficiale Expo sdk-57](https://github.com/expo/expo/blob/sdk-57/packages/expo-modules-jsi/apple/Sources/ExpoModulesJSI/Runtime/JavaScriptRuntime.swift). Entrambi contenevano già le sette annotazioni `nonisolated(unsafe)`, ma la build locale riproduceva comunque i sette errori di invio dei puntatori.

La patch sposta le annotazioni dentro `withGuaranteedContext`, immediatamente prima di `JavaScriptActor.assumeIsolated`. I puntatori rimangono limitati alla chiamata sincrona, senza cambi di thread o di durata della memoria. Non vengono disattivati i controlli concurrency globali.

La patch conserva anche la rimozione di `SWIFT_RETURNS_RETAINED` dai due costruttori C++ RuntimeScheduler. La versione npm 57.1.0 usa già `milliseconds.magnitude` nel codice Date: non occorre ripristinare la vecchia patch `Swift.abs`.

`npm ci` esegue `scripts/patch-expo-ios.cjs`: controlla versione e hash dei sorgenti, applica la patch e verifica il risultato. È idempotente; sorgenti o versioni diversi causano un errore esplicito da esaminare prima di aggiornare la patch. Il lockfile blocca l'albero delle dipendenze verificato.

## Prossima build

Dalla cartella mobile:

```sh
nvm use
npm ci
npm test
cd ios
pod install
open Places.xcworkspace
```

In Xcode selezionare Places e un dispositivo iOS generico, quindi Product > Archive. Il file locale `ios/.xcode.env.local` punta a Node 22.23.2 installato su questo Mac. Su un altro Mac impostarlo al percorso restituito da `command -v node` dopo `nvm use`.

Non cancellare `ios/build` dopo pod install: contiene ReactCodegen. Se viene cancellato, rigenerarlo con pod install prima della build. Non è necessario eseguire expo prebuild; una rigenerazione del progetto nativo richiede di ricontrollare il signing manuale.

Versionare package.json, package-lock.json, .nvmrc, scripts, app.json e il progetto iOS con il suo Podfile.lock. Credenziali, profili, certificati, Pods, build e .xcode.env.local sono esclusi da Git. Nessun commit o push automatico è stato eseguito.

L'upload su App Store Connect richiede una nuova conferma dell'utente.

## Esito verifiche — 15 settembre 2026

- Build Release per `generic/platform=iOS`: BUILD SUCCEEDED.
- `npm ci`: riuscito, patch postinstall applicata e hash verificati.
- `npm test` su Node 22.23.2: 28/28 superati.
- `pod install`: riuscito; presenti i sorgenti ReactCodegen rnscreens e safeareacontext.
- Archive dopo reinstallazione e pod install: ARCHIVE SUCCEEDED.
- Firma verificata con `codesign --verify --deep --strict`: valida.
- Archive: `~/Library/Developer/Xcode/Archives/2026-09-15/Placebook-0.1.0-2.xcarchive`.
- Identificativi riletti dall'app archiviata: `com.since56k.places`, versione `0.1.0`, build `2`.
- Profilo incorporato: `Places iOS App Store 3`, Team `7B976BPMDZ`, `get-task-allow=false`, scadenza 14 settembre 2027.
- Workspace e archive aperti in Xcode. Nessun upload e nessuna validazione remota App Store Connect eseguiti. Il test sul dispositivo/TestFlight resta da eseguire dopo distribuzione autorizzata.
- Log diagnostici locali: `/tmp/placebook-ios-audit/` (temporanei).
