# Database MongoDB per Sistema Biblioteca

## Architettura del Database


Il database utilizza un approccio **ibrido** tra normalizzazione e denormalizzazione:
- **Normalizzazione**: Per entità principali (libri, utenti) per evitare duplicazioni
- **Denormalizzazione**: Per operazioni frequenti (prestiti con info libro embedded)
- **Embedding**: Per dati correlati che vengono sempre recuperati insieme
- **Referencing**: Per relazioni many-to-many e dati che cambiano indipendentemente

### Vantaggi dell'Embedding/Riferimenti

#### Quando usare l'Embedding:
- **Prestiti + Info Libro**: I prestiti includono info essenziali del libro per evitare join costosi
- **Copie + Libro**: Le copie sono embedded nel documento libro (relazione 1-to-many forte)
- **Indirizzo + Utente**: L'indirizzo è sempre recuperato con l'utente
- **Metadati**: Informazioni di audit (created_at, updated_at) sono embedded

#### Quando usare i Riferimenti:
- **Utente ↔ Prestiti**: Un utente può avere molti prestiti, ma i prestiti esistono indipendentemente
- **Libro ↔ Prenotazioni**: Le prenotazioni sono entità separate che referenziano i libri
- **Prestiti ↔ Multe**: Le multe possono essere create indipendentemente dai prestiti

## Collezioni

### 1. Collezione `books`

**Scopo**: Catalogo completo dei libri della biblioteca

**Struttura**:
```javascript
{
  _id: ObjectId,           // ID univoco MongoDB
  isbn: String,            // ISBN univoco del libro
  title: String,           // Titolo del libro
  authors: [               // Array di autori (embedded)
    {
      name: String,
      birth_year: Number,
      nationality: String
    }
  ],
  publisher: String,       // Casa editrice
  publication_year: Number,// Anno di pubblicazione
  edition: String,         // Edizione
  pages: Number,          // Numero di pagine
  language: String,       // Codice lingua (ISO 639-1)
  genres: [String],       // Generi letterari
  description: String,    // Descrizione/riassunto
  location: {             // Posizione fisica (embedded)
    shelf: String,
    section: String,
    position: String
  },
  copies: [               // Copie disponibili (embedded)
    {
      copy_id: String,
      condition: String,   // excellent, good, fair, poor
      acquisition_date: Date,
      status: String,     // available, borrowed, reserved, maintenance
      notes: String
    }
  ],
  metadata: {             // Metadati di sistema (embedded)
    created_at: Date,
    updated_at: Date,
    created_by: String
  }
}
```

**Indici**:
- `isbn` (unique): Ricerca rapida per ISBN
- `title, authors.name` (text): Ricerca full-text
- `genres`: Filtro per genere
- `copies.status`: Disponibilità copie

### 2. Collezione `users`

**Scopo**: Anagrafica utenti della biblioteca

**Struttura**:
```javascript
{
  _id: ObjectId,
  user_id: String,        // ID utente personalizzato
  personal_info: {        // Dati personali (embedded)
    first_name: String,
    last_name: String,
    email: String,
    phone: String,
    date_of_birth: Date,
    tax_code: String      // Codice fiscale
  },
  address: {              // Indirizzo (embedded)
    street: String,
    city: String,
    postal_code: String,
    province: String,
    country: String
  },
  membership: {           // Tessera biblioteca (embedded)
    card_number: String,
    registration_date: Date,
    expiry_date: Date,
    status: String,       // active, suspended, expired
    type: String          // standard, premium, student, senior
  },
  preferences: {          // Preferenze utente (embedded)
    favorite_genres: [String],
    notification_email: Boolean,
    notification_sms: Boolean,
    privacy_consent: Boolean
  },
  statistics: {           // Statistiche utente (embedded)
    total_borrowed: Number,
    current_borrowed: Number,
    overdue_count: Number,
    total_fines: Number
  },
  metadata: {
    created_at: Date,
    updated_at: Date,
    last_login: Date
  }
}
```

**Indici**:
- `user_id` (unique): Identificazione rapida
- `membership.card_number` (unique): Ricerca per tessera
- `personal_info.email` (unique): Login/comunicazioni
- `membership.status`: Utenti attivi/sospesi

### 3. Collezione `loans`

**Struttura**:
```javascript
{
  _id: ObjectId,
  loan_id: String,        // ID prestito personalizzato
  user_id: String,        // Riferimento a users.user_id
  book_info: {            // Info libro embedded (snapshot)
    book_id: ObjectId,    // Riferimento al libro originale
    isbn: String,
    title: String,
    authors: [String],    // Solo nomi autori
    copy_id: String
  },
  dates: {                // Date del prestito (embedded)
    loan_date: Date,
    due_date: Date,
    return_date: Date,    // null se non restituito
    last_renewal: Date
  },
  status: String,         // active, returned, overdue, lost
  renewals: Number,       // Numero rinnovi effettuati
  max_renewals: Number,   // Rinnovi massimi consentiti
  fine_amount: Number,    // Multa applicata
  notes: String,          // Note del bibliotecario
  staff_id: String,       // Chi ha gestito il prestito
  metadata: {
    created_at: Date,
    updated_at: Date
  }
}
```

**Indici**:
- `user_id`: Prestiti per utente
- `book_info.book_id`: Prestiti per libro
- `status`: Prestiti attivi/scaduti
- `dates.due_date`: Scadenze

### 4. Collezione `reservations`

**Scopo**: Gestione prenotazioni libri

**Struttura**:
```javascript
{
  _id: ObjectId,
  user_id: String,        // Riferimento a users
  book_id: ObjectId,      // Riferimento a books
  reservation_date: Date,
  expiry_date: Date,      // Scadenza prenotazione
  status: String,         // active, fulfilled, expired, cancelled
  priority: Number,       // Posizione in coda
  notification_sent: Boolean,
  notes: String,
  metadata: {
    created_at: Date,
    updated_at: Date
  }
}
```

**Indici**:
- `user_id, book_id` (compound): Prenotazioni utente
- `book_id, status, priority`: Coda prenotazioni
- `status, expiry_date`: Prenotazioni scadute

### 5. Collezione `fines` (opzionale)

**Scopo**: Gestione multe e pagamenti

**Struttura**:
```javascript
{
  _id: ObjectId,
  user_id: String,
  loan_id: String,        // Riferimento al prestito
  fine_type: String,      // late_return, damage, lost_book
  amount: Number,
  currency: String,
  status: String,         // pending, paid, waived
  issue_date: Date,
  payment_date: Date,
  payment_method: String, // cash, card, bank_transfer
  notes: String,
  staff_id: String,
  metadata: {
    created_at: Date,
    updated_at: Date
  }
}
```

## Pattern di Query Comuni

### 1. Ricerca Libri Disponibili
```javascript
db.books.find({
  "copies.status": "available",
  "title": { $regex: "pattern", $options: "i" }
})
```

### 2. Prestiti Scaduti
```javascript
db.loans.find({
  "status": "active",
  "dates.due_date": { $lt: new Date() }
})
```

### 3. Statistiche Utente
```javascript
db.users.aggregate([
  {
    $lookup: {
      from: "loans",
      localField: "user_id",
      foreignField: "user_id",
      as: "loans"
    }
  },
  {
    $project: {
      name: "$personal_info.first_name",
      total_loans: { $size: "$loans" },
      active_loans: {
        $size: {
          $filter: {
            input: "$loans",
            cond: { $eq: ["$$this.status", "active"] }
          }
        }
      }
    }
  }
])
```


### Indici Composti Strategici
- `{user_id: 1, status: 1}` su loans per prestiti utente per stato
- `{book_id: 1, status: 1, priority: 1}` su reservations per code prenotazioni
- `{status: 1, dates.due_date: 1}` su loans per scadenze

### Ottimizzazioni
- **Projection**: Recuperare solo i campi necessari
- **Pagination**: Utilizzare skip() e limit() per grandi dataset
- **Aggregation Pipeline**: Per query complesse e reporting
- **Caching**: Per dati frequentemente acceduti (generi, posizioni)

## Scalabilità e Manutenzione

### Strategie di Crescita
- **Sharding**: Per biblioteche con milioni di libri
- **Read Replicas**: Per bilanciare query di lettura
- **Archiving**: Spostare prestiti vecchi in collezioni separate
- **Indexing**: Monitorare e ottimizzare indici regolarmente

### Backup e Recovery
- **Backup incrementali**: Ogni notte
- **Point-in-time recovery**: Per errori accidentali
- **Replica geografica**: Per disaster recovery