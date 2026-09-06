# Portfolio di Emanuele De Rosa

Questa cartella contiene il sito completo nella versione ripristinata, pronta per GitHub Pages. Include animazioni, modalità statica basata su cv2.html, CV e libreria 3D con licenza.

## Pubblicazione gratuita

1. Crea un repository pubblico chiamato `TUOUSERNAME.github.io`, sostituendo TUOUSERNAME con il tuo nome utente GitHub.
2. Carica **il contenuto di questa cartella**, con `index.html` nella radice del repository. Mantieni la sottocartella `vendor` e il file `.nojekyll`.
3. Apri **Settings → Pages**.
4. In **Build and deployment**, scegli **Deploy from a branch**, branch **main**, cartella **/(root)**, quindi **Save**.
5. Il sito sarà disponibile su `https://TUOUSERNAME.github.io/`. La pubblicazione può richiedere alcuni minuti.

Puoi anche scegliere un nome di repository diverso: l'indirizzo sarà `https://TUOUSERNAME.github.io/NOME-REPOSITORY/`.

Il sito è statico: non serve installare Node, eseguire una build o configurare chiavi API. Il pulsante Motion off apre static-mode.html; Turn on riapre il sito animato. Le animazioni 3D richiedono WebGL. Su GitHub Pages il sito, il codice e il CV caricati saranno pubblici.

GitHub fornisce hosting e indirizzo github.io gratuiti. Un dominio personale come nomecognome.it va registrato separatamente e poi collegato a Pages.

## File

- `index.html`: sito animato
- `static-mode.html`: layout statico del portfolio
- `aircraft-model.mjs` e `flight-3d.mjs`: modello e animazione 3D
- `aircraft.png`: immagine di fallback
- `Emanuele_De_Rosa_CV.pdf`: CV scaricabile
- `vendor/`: libreria Three.js, ambiente di illuminazione e licenza
- `.nojekyll`: pubblicazione diretta dei file statici

Non caricare le cartelle di lavoro di Codex, la cronologia `.git`, la configurazione `.openai` o gli archivi di pubblicazione. Non sono presenti in questo pacchetto.

Documentazione ufficiale: https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
