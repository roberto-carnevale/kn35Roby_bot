# Fortune cookie Italia (aka kn35Roby_bot)
Questo repository raccoglie tutto il codice per far funzionare il bot "Fortune cookie Italia"
l'ID del bot è **kn35Roby_bot** e se vi state domandando perchè... è la storpiatura ti [H-7-25](https://it.wikipedia.org/wiki/Uno_sceriffo_extraterrestre..._poco_extra_e_molto_terrestre).
Il bot risponde ai comandi riportati nel file [bot comands string.txt](https://github.com/roberto-carnevale/kn35Roby_bot/blob/master/bot%20comands%20string.txt).
La logica del bot è semplicissima. 4 classi di base:
* Bot
* CommandBus
* FortuneOnGoogle
* SpreadData

##Le classi

Ognuna delle classi si occupa di un task specifico, come da buone pratiche:
### Bot
La classe è il cuore del bot: iinvia i messaggi, crea e distrugge le tastiere e accoda gli update che vengono dalla piattaforma di Telegram

### CommandBus
La classe CommandBus ha la funzione di fare il parsing dei comandi e creare i token da passare al gestore del servizio

### FortuneOgGoogle
La classe si occupa di gestire il foglio di calcolo e di strarre le frasi da inviare agli iscritti.
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




