# 🟣 PhonePe Expense Tracker (Desktop Edition)

An industry-grade, desktop-based personal finance & expense analytics application built with a **strictly separated Frontend & Backend architecture**, native Windows WebView2 integration via **PyWebView**, and a **PhonePe-inspired dark glassmorphic UI**.

---

## 🌟 Key Features

* **🎨 Fintech-Grade UI/UX:** PhonePe signature theme (`#5F259F`), glassmorphism, animated number counters, and responsive OLED dark layout.
* **📂 Drag & Drop Transaction Importer:** Import `transaction.txt` or `.csv` files via drag-and-drop or the native Windows file selector dialog.
* **📊 Visual Analytics & Interactive Charts:**
  * **Category Breakdown Donut Chart:** Interactive donut chart with category distribution and tooltips (Food, Travel, Bills, Shopping, Health, Store, etc.).
  * **Daily Spending Velocity Area Chart:** Real-time burn-rate timeline highlighting peak expenditure days.
* **⚠️ Smart Budget Monitoring:** Configurable monthly budget limit with visual radial progress meters and threshold breach warnings (e.g. ₹10,000 threshold).
* **🔍 Searchable & Filterable Data Grid:** Live merchant search, category pill filter, column sorting, and pagination.
* **🛡️ Fault-Tolerant Parser & Health Inspector:** Skips malformed lines gracefully and provides an in-app parsing inspector detailing exact line numbers and syntax error reasons.
* **💾 Multi-Format Report Exporter:** One-click export of expense summaries to structured **CSV** and **JSON** files.

---

## 🏗️ Architecture & Project Structure

The project maintains a strict separation of concerns between the **Python Analytics Engine** and the **Modern Frontend**:

```
phonepe_expense_tracker/
│
├── desktop_main.py                 # 🚀 Native Desktop Application Entry Point (PyWebView)
├── app.py                          # 🚀 Application Launcher Alias
├── main.py                         # 💻 CLI Interface Fallback
├── pyproject.toml                  # Python package configuration & dependencies
├── README.md                       # Complete documentation
│
├── 📂 backend/                     # 🐍 100% ISOLATED PYTHON BACKEND CORE
│   ├── bridge.py                   # PyWebView RPC API Gateway connecting JS and Python
│   ├── config/
│   │   └── settings.py             # App configurations, category keyword rules, and colors
│   ├── models/
│   │   ├── transaction.py          # Transaction and ParsingError dataclass schemas
│   │   └── summary.py              # ExpenseSummary and DailyTrendPoint schemas
│   ├── services/
│   │   ├── parser.py               # Robust line-by-line transaction.txt / CSV parser
│   │   ├── categorizer.py          # Rule-based merchant categorization engine
│   │   ├── tracker.py              # Multi-month aggregation and budget analytics
│   │   └── exporter.py             # CSV and JSON report generation
│   └── utils/
│       ├── file_handler.py         # Safe UTF-8 file I/O utilities
│       ├── logger.py               # Rotating file & console logging
│       └── decorators.py           # Execution timers and performance decorators
│
├── 📂 frontend/                    # ⚛️ 100% ISOLATED MODERN DESKTOP UI
│   ├── index.html                  # Accessible semantic layout & Chart.js canvas
│   ├── css/
│   │   ├── theme.css               # PhonePe color tokens, CSS variables, & typography
│   │   ├── layout.css              # Grid system, header toolbar, & container layouts
│   │   └── components.css          # Dropzone, cards, buttons, table, modals, & alerts
│   └── js/
│       ├── app.js                  # Main UI controller & state management
│       ├── services/
│       │   └── bridge.js           # PyWebView RPC communication wrapper
│       └── components/
│           ├── metrics.js          # KPI Cards & Budget health progress gauges
│           ├── charts.js           # Chart.js Category Donut & Daily Trend Area charts
│           ├── table.js            # Live search, category filtering, & pagination
│           └── alerts.js           # Budget breach banners, toast notifications, & logs modal
│
├── 📂 data/
│   ├── transactions.txt            # Raw transaction records
│   └── summary.json                # Generated expense summary output
│
├── 📂 logs/
│   └── tracker.log                 # App execution and error logs
│
└── 📂 tests/
    └── test_backend.py             # Automated unit and integration test suite
```

---

## ⚡ Quickstart Guide

### 1. Prerequisites
* **Python 3.10+** (Python 3.12 recommended)
* **Windows 10 / 11** (comes with Microsoft Edge WebView2 pre-installed)

### 2. Run the Desktop Application
Activate your virtual environment and run `desktop_main.py`:

```powershell
# Activate virtual environment
.\.venv\Scripts\activate

# Launch Desktop App
python desktop_main.py
```

### 3. Run the CLI Version (Fallback)
```powershell
python main.py
```

---

## 📝 Transaction File Format

The parser accepts plain `.txt` or `.csv` files where each line follows the format:

```text
YYYY-MM-DD, Merchant Name, Amount
```

### Example:
```text
2026-08-01, Swiggy, 350
2026-08-02, Uber Ride, 180
2026-08-03, DMart Supermarket, 1450
2026-08-05, Petrol Pump HPCL, 600
2026-08-06, Amazon Purchase, 999
2026-08-13, Electricity Bill Bescom, 1850
2026-08-25, Gym Membership, 1200
```

> **Note:** Blank lines and comment lines (starting with `#`) are ignored. Malformed lines are automatically captured and listed in the in-app **Parsing Report** without crashing the application.

---

## 🧪 Running Automated Tests

Run the backend test suite to verify 100% calculation accuracy and parser resilience:

```powershell
python tests/test_backend.py
```

### Test Suite Validates:
* ✅ Accurate keyword categorization across all categories (Food, Travel, Shopping, Bills, Health, Store, etc.).
* ✅ Malformed line detection and line-number error tracking.
* ✅ Exact arithmetic matching for monthly totals and category breakdowns.
* ✅ Budget limit threshold detection.
* ✅ PyWebView Desktop Bridge RPC serialization.

---

## 🛠️ Tech Stack Overview

| Layer | Technologies Used |
| :--- | :--- |
| **Desktop Shell** | [PyWebView](https://pywebview.flowrl.com/) (Native Windows Edge WebView2) |
| **Backend Engine** | Python 3.12 (Dataclasses, OOP, File I/O, Logging) |
| **Frontend UI** | HTML5, Vanilla CSS3 (Custom Design System, Glassmorphism), ES Modules |
| **Data Visualizations** | [Chart.js 4.4](https://www.chartjs.org/) (Interactive Doughnut & Area Charts) |
| **Testing** | Custom Python Unit Test Suite (`tests/test_backend.py`) |

---

## 👤 Author & Copyright

* **Application Built By:** **Arti Borkar**
* **Copyright:** © 2026 PhonePe Expense Intelligence. All Rights Reserved.
* **Privacy Guarantee:** 100% Local & Offline Processing — No financial data ever leaves your device.