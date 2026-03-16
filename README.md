# TradeLog — Professional Trading Journal

A full-featured trading journal web app built with Next.js 14, TypeScript, Tailwind CSS, and Recharts.
All data stored locally in your browser — no accounts, no servers, no privacy concerns.

---

## 📋 STEP-BY-STEP INSTALLATION GUIDE

### Prerequisites

Before you begin, make sure you have the following installed:

1. **Node.js** (version 18 or higher)
   - Download from: https://nodejs.org
   - To check your version: `node --version`

2. **npm** (comes with Node.js)
   - To check: `npm --version`

3. **Git** (optional, but recommended)
   - Download from: https://git-scm.com

---

### Step 1 — Get the Project Files

**Option A: If you downloaded a ZIP file**
```bash
# Unzip the file and navigate to the folder
unzip trading-journal.zip
cd trading-journal
```

**Option B: If you cloned from GitHub**
```bash
git clone https://github.com/YOUR_USERNAME/trading-journal.git
cd trading-journal
```

---

### Step 2 — Install Dependencies

In your terminal, inside the project folder, run:

```bash
npm install
```

This will install all required packages (Next.js, Recharts, Tailwind, etc.).
This may take 1–2 minutes. You'll see a `node_modules/` folder appear.

---

### Step 3 — Start the Development Server

```bash
npm run dev
```

You should see output like:
```
▲ Next.js 14.x.x
- Local:   http://localhost:3000
- Ready in Xs
```

---

### Step 4 — Open the App

Open your browser and go to:
```
http://localhost:3000
```

You'll see the TradeLog dashboard. Click **"Load Sample Data"** on the dashboard to populate
the app with 40 sample trades to explore all features.

---

## 🧭 HOW TO USE THE APP

### Dashboard (`/`)
- Overview of all key stats: Total PnL, Win Rate, Avg R Multiple, Profit Factor
- Equity curve chart showing your cumulative performance
- Recent trades list
- Click "Load Sample Data" if it's your first time, to see how everything looks

### New Trade (`/new-trade`)
- Fill in the trade form fields:
  - **Date** — when the trade was taken
  - **Asset** — ticker symbol (e.g. BTC/USD, AAPL, ES)
  - **Direction** — Long or Short
  - **Strategy** — select from the dropdown (Breakout, Scalp, etc.)
  - **Entry Price** — your entry price
  - **Exit Price** — your exit price
  - **Position Size** — number of shares/contracts/units
  - **Stop Loss** — your stop loss price
  - **Take Profit** — your take profit price
  - **Fees** — commission/fees paid
  - **Emotion** — your emotional state before the trade
  - **Notes** — any trade rationale or observations
- The **live preview box** shows your calculated PnL, R Multiple, and Risk:Reward as you type
- Click **"Log Trade"** to save

### Trade History (`/trade-history`)
- View all your trades in a sortable, filterable table
- **Search**: type any asset, strategy, or note keyword
- **Filter by result**: All / Win / Loss / Breakeven
- **Filter by type**: All / Long / Short
- **Sort**: click any column header to sort ascending/descending
- **Edit**: hover over a row and click the pencil icon
- **Delete**: hover over a row and click the trash icon
- **Export CSV**: download all visible trades as a spreadsheet

### Analytics (`/analytics`)
- **Equity Curve** — cumulative PnL over time
- **PnL by Strategy** — which strategies make you money
- **Win/Loss Pie** — visual breakdown of outcomes
- **Monthly PnL** — month-by-month bar chart
- **R Multiple Distribution** — frequency of each R outcome
- **Day of Week PnL** — which days are most profitable
- **Strategy Breakdown Table** — win rate and avg R per strategy

### Journal (`/journal`)
- Click **"New Entry"** to add a daily reflection
- Fields: Date, Emotion, Mistakes Made, Lessons Learned, Notes
- All entries are displayed as cards, sortable by date
- Edit or delete entries by hovering and clicking the icons

### Settings (`/settings`)
- View total trade and journal entry counts
- **Export Full Backup (JSON)** — save everything to a file
- **Export CSV** — trades-only spreadsheet export
- **Import Backup** — paste a JSON backup to restore data
- **Load Sample Data** — populate with demo trades
- **Clear All Data** — wipe everything (with confirmation)

---

## 🚀 DEPLOYING TO VERCEL (Free Hosting)

Deploy your journal to the web in 5 minutes:

### Step 1 — Create a GitHub Repository
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/trading-journal.git
git push -u origin main
```

### Step 2 — Deploy to Vercel
1. Go to https://vercel.com and sign up (free)
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Vercel will auto-detect Next.js — click **"Deploy"**
5. Your app will be live at `https://your-project.vercel.app` in ~1 minute

> Note: Since the app uses localStorage, each browser/device has its own separate data.
> Use the JSON export/import feature to transfer data between devices.

---

## 🏗️ PROJECT STRUCTURE

```
trading-journal/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # Dashboard
│   │   ├── new-trade/          # Log a new trade
│   │   ├── trade-history/      # View & manage all trades
│   │   ├── analytics/          # Charts & analysis
│   │   ├── journal/            # Psychology journal
│   │   ├── settings/           # Data management
│   │   ├── layout.tsx          # Root layout (includes sidebar)
│   │   └── globals.css         # Global styles & CSS variables
│   ├── components/
│   │   ├── layout/
│   │   │   └── Sidebar.tsx     # Navigation sidebar
│   │   ├── charts/
│   │   │   └── EquityChart.tsx # Recharts equity curve
│   │   ├── forms/
│   │   │   └── TradeForm.tsx   # Trade entry/edit form
│   │   ├── StatsCard.tsx       # Dashboard stat card
│   │   └── TradeTable.tsx      # Sortable trade history table
│   ├── lib/
│   │   ├── storage.ts          # localStorage CRUD operations
│   │   ├── calculations.ts     # PnL, R multiple, stats calculations
│   │   ├── sampleData.ts       # Demo data generator
│   │   └── utils.ts            # cn() helper
│   └── types/
│       └── index.ts            # TypeScript interfaces
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.js
```

---

## 📊 CALCULATIONS EXPLAINED

| Metric | Formula |
|--------|---------|
| PnL (Long) | `(exitPrice - entryPrice) × positionSize - fees` |
| PnL (Short) | `(entryPrice - exitPrice) × positionSize - fees` |
| R Multiple | `pnl / (|entryPrice - stopLoss| × positionSize)` |
| Risk:Reward | `|takeProfit - entryPrice| / |entryPrice - stopLoss|` |
| Win Rate | `wins / totalTrades × 100` |
| Profit Factor | `totalGrossProfit / totalGrossLoss` |
| Max Drawdown | Largest peak-to-trough equity decline |

---

## 🛠️ USEFUL COMMANDS

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Build for production
npm run start    # Start production server (run build first)
npm run lint     # Check for TypeScript/ESLint errors
```

---

## 🔧 CUSTOMIZATION

### Adding New Strategies
Edit `STRATEGIES` array in `src/components/forms/TradeForm.tsx`

### Changing Colors
Edit CSS variables in `src/app/globals.css` under `:root`

### Adding New Emotion Types
Edit `EMOTIONS` array in `src/components/forms/TradeForm.tsx` and `src/app/journal/page.tsx`

---

## ❓ TROUBLESHOOTING

**"Module not found" errors**
```bash
rm -rf node_modules .next
npm install
npm run dev
```

**Port 3000 already in use**
```bash
npm run dev -- -p 3001
# Then visit http://localhost:3001
```

**Data not saving**
- Make sure you're not in private/incognito mode (localStorage is disabled)
- Check browser console for errors (F12 → Console)

**Build errors on Vercel**
- Check that your Node.js version is 18+ in Vercel project settings
- Go to Vercel Dashboard → Project → Settings → General → Node.js Version → set to 18.x
