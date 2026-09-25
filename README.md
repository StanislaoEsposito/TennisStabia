# 🎾 ASD Tennis Club Terme di Stabia — App Gestione Iscritti

Web app MVP per la gestione degli iscritti, gruppi e presenze del club.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · Supabase

---

## 🚀 Setup Rapido

### 1. Installa Node.js
Scarica e installa Node.js LTS da **https://nodejs.org** (versione 18+ raccomandata).  
Verifica l'installazione aprendo un terminale (PowerShell o CMD):
```
node --version
npm --version
```

### 2. Installa le dipendenze del progetto
```bash
cd "C:\Users\Stanislao\Desktop\siti\Tennis"
npm install
```

### 3. Configura Supabase

#### a. Crea il progetto Supabase
1. Vai su **https://supabase.com** e crea un account / progetto
2. Nel pannello del progetto: **SQL Editor** → **New Query**
3. Incolla il contenuto di [`supabase/schema.sql`](./supabase/schema.sql) ed eseguilo
4. Il seed di dati di esempio viene inserito automaticamente

#### b. Copia le credenziali
In Supabase: **Settings** → **API**  
Copia:
- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Apri `.env.local` e sostituisci i valori placeholder:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xyzabc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Avvia il server di sviluppo
```bash
npm run dev
```
Apri **http://localhost:3000** nel browser.

---

## 📁 Struttura del Progetto

```
Tennis/
├── supabase/
│   └── schema.sql              ← Script SQL per il database
├── app/
│   ├── layout.tsx              ← Layout root (NavBar + Toaster)
│   ├── globals.css             ← Stili globali + Tailwind
│   ├── page.tsx                ← Redirect → /dashboard
│   ├── dashboard/
│   │   └── page.tsx            ← Dashboard Segreteria (Server Component)
│   └── attendance/
│       └── page.tsx            ← Registro Presenze (Server Component)
├── components/
│   ├── NavBar.tsx              ← Barra di navigazione
│   ├── students/
│   │   ├── StudentsTable.tsx   ← Tabella allievi con ricerca e badge
│   │   ├── AddStudentButton.tsx← Bottone che apre il modal
│   │   ├── AddStudentModal.tsx ← Form creazione allievo
│   │   └── CertBadge.tsx      ← Badge stato certificato medico
│   └── attendance/
│       └── AttendanceView.tsx  ← Registro presenze interattivo
├── lib/
│   ├── types.ts                ← TypeScript types + getCertStatus()
│   └── supabase/
│       ├── client.ts           ← Supabase browser client
│       └── server.ts           ← Supabase server client (RSC/Actions)
├── actions/
│   ├── students.ts             ← Server Actions: CRUD studenti
│   └── attendance.ts           ← Server Actions: presenze
└── middleware.ts               ← Refresh sessione Supabase
```

---

## 🖥️ Funzionalità MVP

### Dashboard Segreteria (`/dashboard`)
- Tabella completa di tutti gli allievi
- Barra di ricerca per nome/telefono
- Badge colorato per lo stato del certificato medico:
  - 🟢 `Valido` — certificato in regola
  - 🟡 `In scadenza` — scade entro 30 giorni
  - 🔴 `Scaduto` — certificato scaduto
  - ⚪ `Mancante` — data non inserita
- Gruppi di appartenenza come tag cliccabili con tooltip orario
- Modal "Aggiungi Allievo" con assegnazione al gruppo
- Eliminazione allievo (con cascata su presenze e iscrizioni)

### Registro Presenze (`/attendance`)
- Selezione gruppo e data (default: oggi)
- Card per ogni allievo con 3 bottoni touch-friendly:
  - ✅ Presente
  - 🕐 In ritardo
  - ❌ Assente
- Feedback visivo immediato (ottimistico)
- Salvataggio batch in Supabase con un solo tap
- Bottone "Salva" sticky in basso (usabile con pollice su mobile)

---

## 🗄️ Schema Database

| Tabella | Descrizione |
|---------|-------------|
| `students` | Anagrafica allievi |
| `groups` | Gruppi (SINNER, DJOKOVIC…) con orario |
| `student_groups` | Iscrizioni con n° sessioni/settimana |
| `attendance` | Presenze giornaliere (present/absent/late) |

RLS abilitata: solo utenti autenticati possono leggere/scrivere.

---

## 🔮 Prossimi Step (Fase 2)

- [ ] Autenticazione con Supabase Auth (login segreteria vs. maestri)
- [ ] Gestione gruppi (crea/modifica/elimina)
- [ ] Statistiche presenze per allievo
- [ ] Notifiche certificati in scadenza (email)
- [ ] Export Excel/PDF del registro presenze
- [ ] PWA per installazione su mobile dei maestri
