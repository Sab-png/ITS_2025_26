Progettazione del Database per una Biblioteca
Struttura delle Collezioni
1. Libri (Approccio Embedded)
Dettagli dei libri con informazioni sugli autori e copie incorporate

Adatto per query frequenti centrate sui libri

Ottimizzato per le prestazioni di lettura

2. Membri (Approccio Referenziato)
Informazioni sui membri con riferimenti ai prestiti

Migliore per dati dei membri aggiornati frequentemente

3. Prestiti (Approccio Ibrido)
Registrazioni dei prestiti con dettagli dei libri incorporati ma membri referenziati

Bilancia la frequenza di scrittura con le prestazioni di lettura

Decisioni di Progettazione
Documenti Embedded Utilizzati Per:
Copie dei libri all'interno dei Libri (relazione 1-a-molti)

Autori all'interno dei Libri (relazione molti-a-molti)

Riferimenti Utilizzati Per:
Prestiti ai Membri (relazione 1-a-molti)

Prestiti ai Libri (relazione molti-a-1)

Indici:
ISBN nella collezione Libri (univoco)

ID Membro nella collezione Membri (univoco)

Indice composto su Prestiti (bookId + returnDate)