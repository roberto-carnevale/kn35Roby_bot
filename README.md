# Fortune cookie Italia (aka kn35Roby_bot)
Questo repository raccoglie tutto il codice per far funzionare il bot "Fortune cookie Italia": una versione "moderna" dell'antico comando <code>fortune</code> di Debian/Linux.

L'ID del bot è **kn35Roby_bot** e se vi state domandando perchè... è la storpiatura ti [H-7-25](https://it.wikipedia.org/wiki/Uno_sceriffo_extraterrestre..._poco_extra_e_molto_terrestre).

Il bot risponde ai comandi riportati nel file [bot comands string.txt](https://github.com/roberto-carnevale/kn35Roby_bot/blob/master/bot%20comands%20string.txt).
La logica del bot è semplicissima. 4 classi di base:

* Bot
* CommandBus
* FortuneOnGoogle
* SpreadData

## Le classi
Ognuna delle classi si occupa di un task specifico, come da buone pratiche:

### Bot
La classe è il cuore del bot: invia i messaggi, crea e distrugge le tastiere e accoda gli update che vengono dalla piattaforma di Telegram

### CommandBus
La classe CommandBus ha la funzione di fare il parsing dei comandi e creare i token da passare al gestore del servizio

### FortuneOnGoogle
La classe si occupa di gestire il foglio di calcolo e di estrarre le frasi da inviare agli iscritti.
Il tab **setup** contiene tutti i dati per gestire correttamente la ricerca delle frasi
nella prima riga è scritto in forma di string l'intervallo di ricerca della tabella successiva
Nome DB|Ultima Riga
-------|-----------
Esempio|100

Nella colonna **Nome DB** va inserito il nome della tab **case-sensitive**
Nella colonna **Ultima Riga** va inserita in numero di riga precedente corrispondente al penultimo segno **%**.
##### Esempio
Se il penultimo simbolo **%** è alla riga 1000 dovremo inserire 999 nella corrispondente linea

### SpreadData
La classe si occupa di gestire gli utenti.
Memorizza i dati nel proprio Google Sreadsheet nel seguente formato
Chat ID|Nome|Cognome|Foglio|Random Update
-------|----|-------|------|-------------
User1|Name|Family Name|Sheet 1|Y
User2|First Name|Last Name|Sheet2|N
Chat1|Group Name|\*GROUP\*|Sheet3|N

Nella tabella sono riportati 3 esempi:
1. Il primo è un utente standard che vuole avere una frase di tanto in tanto
2. Il secondo utente è un utente che non vuole avere la frase ma che richiede autonomamente l'estrazione
3. Un gruppo a cui è stato aggiunto il bot

## I file di gestione
Ci sono due ulteriori file:
* CallManager
* RegisterWebHook

Questi due file hanno compiti specifici

### CallManager
Gestisce le chiamate GET e POST per il sevizio.
Nella chiamata **doPost** sono gestiti i comandi e le chiamate alle classi worker.

Nella chiamata **doGet** è gestito l'invio di messagi a tutti gli utenti e i gruppi sottoscritti per l'invio di news. La risposta al browser invoca i file 200.html e 500.html per inviare un feedback al chiamante del messaggio di broadcast.

La chiamata **doRunFortuneForSubscribers** è attivata dalla piattaforma Google ogni 2 ore e gestisce attraverso un random seed l'invio casuale tra le 8 e le 20 CEST una frase casuale.

### RegisterWebHook
Ci sono 3 funzioni che possono essere invocate per gestire (attraverso il token API di Telegram __UNDISCLOSED__) l'indirizzamento delle WebHook di Telegram

## Schema di funzionamento 
Il sistema funziona secondo principalmente 3 meccanismi.

### Risposta ad un comando
Il sistema funziona in maniera piuttosto semplice:

1. Telgram riceve la richiesta dall'utente di retrocedere ad un bot un comando
2. Telegram invoca la WebHook registrata dalla funzione RegisterWebHook->setWebhook()
3. La funzione CallManager->doPost() riceve la richiesta e processa i dati nella sezione post
4. Parsing del comando ed elaborazione
5. Le classi di backend creano la risposta appropriata
6. La classe Bot impacchetta la risposta assieme al token criptato e la renvia sotto forma di WebHook a "https://api.telegram.org/bot' + __SECRET_TOKEN__ + '/' + method" con i dati necessari nel POST

### Richiesta di una pagina in GET
Questo meccanismo, per ora, invia un messagio broadcast:

1. Lo script riceve un comando attraverso la richiesta di una pagina HTTP GET
2. La funzione estrae i dati dalla GET
3. Le classi di backend creano una appropriata richiesta di invio messaggio
4. La classe Bot impacchetta le risposte, assieme al token criptato, e la invia a ciascuno dei sottoscrittori sotto forma di WebHook a "https://api.telegram.org/bot' + __SECRET_TOKEN__ + '/' + method" con i dati necessari nel POST

### Invocazione diretta delle funzioni da Google
Da ultimo questo viene usato per la classe **RegisterWebHook** per impostare il backend oppure dalla attivazione attraverso il trigger ovvero infine per test attraverso le funzioni di test preparate __ad hoc__

## Scema di formazione del DB delle frasi
Oltre alla tab **setup** di cui abbiamo già discusso, ogni altra tab contiene le frasi.
Il sistema legge le prime 3 colonne.
Se una cella è vuota la trasforma i 5 spazi.

Ogni gruppo di frasi è divisa da una riga in cui la sola casella della colonna A contiene il carattere **%**. Questo permette di importare i DB di fortune senza alcuna fatica con un banale copia/incolla.

L'ultima riga di ogni tab deve contenere il carattere **%**
La prima frase parte dalla riga 1.

Se rispettate queste regole l'aggiunta di una nuova tab (vassoio, come chiamato dal bot) è immediato aggiungendo nella tab **setup** la riga appropriata

#### Caveat
Ad oggi gestisce al massimo 8 DB, al raggiunto del 9 DB va modificato il codice per estrarre 2 digit dalla casella **A1** del tab **setup**
