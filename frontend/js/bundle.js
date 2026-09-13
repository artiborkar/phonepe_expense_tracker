/**
 * PhonePe Expense Intelligence - Standalone Unified Controller
 * Pure Javascript without ES Module CORS restrictions for 100% WebView2 compatibility.
 */

(function () {
  'use strict';

  // --- 1. Bridge Service ---
  const BridgeService = {
    isDesktop() {
      return typeof window !== 'undefined' && Boolean(window.pywebview && window.pywebview.api);
    },

    async waitForBridge(timeoutMs = 800) {
      if (this.isDesktop()) return true;

      return new Promise((resolve) => {
        let resolved = false;
        const onReady = () => {
          if (!resolved) {
            resolved = true;
            resolve(true);
          }
        };

        window.addEventListener('pywebviewready', onReady, { once: true });

        if (this.isDesktop()) {
          onReady();
        } else {
          setTimeout(() => {
            if (!resolved) {
              resolved = true;
              resolve(this.isDesktop());
            }
          }, timeoutMs);
        }
      });
    },

    async loadDefaultData() {
      if (this.isDesktop()) {
        try {
          return await window.pywebview.api.load_default_data();
        } catch (e) {
          console.error("Bridge call failed:", e);
        }
      }
      return getFallbackData();
    },

    async openFileDialog() {
      if (this.isDesktop()) {
        return await window.pywebview.api.open_file_dialog();
      }
      return { status: "error", message: "Desktop mode required" };
    },

    async processContent(content, fileName = "transactions.txt") {
      if (this.isDesktop()) {
        return await window.pywebview.api.process_content(content, fileName);
      }
      return parseLocalText(content, fileName);
    },

    async updateBudget(budgetLimit) {
      if (this.isDesktop()) {
        return await window.pywebview.api.update_budget(budgetLimit);
      }
      return { status: "success", new_budget: budgetLimit };
    },

    async exportReport(formatType, months) {
      if (this.isDesktop()) {
        return await window.pywebview.api.export_report(formatType, months);
      }
      return { status: "success", message: `Exported as ${formatType.toUpperCase()}` };
    }
  };

  // --- 2. Fallback Data Generator & Local Parser ---
  function getFallbackData() {
    return {
      status: "success",
      data: {
        total_spent: 19060.00,
        budget_limit: 10000.00,
        is_over_budget: true,
        over_budget_amount: 9060.00,
        budget_percentage: 190.6,
        selected_months: [8],
        month_names: ["August"],
        categories: [
          { category: "Shopping", amount: 5738.00, percentage: 30.1, color: "#9D74FF", transaction_count: 5 },
          { category: "Bills", amount: 4347.00, percentage: 22.8, color: "#38BDF8", transaction_count: 5 },
          { category: "Travel", amount: 3695.00, percentage: 19.4, color: "#F59E0B", transaction_count: 6 },
          { category: "Food", amount: 2760.00, percentage: 14.5, color: "#00D284", transaction_count: 6 },
          { category: "Health", amount: 1200.00, percentage: 6.3, color: "#EC4899", transaction_count: 1 },
          { category: "Store", amount: 1320.00, percentage: 6.9, color: "#14B8A6", transaction_count: 1 }
        ],
        category_totals: { "Shopping": 5738, "Bills": 4347, "Travel": 3695, "Food": 2760, "Health": 1200, "Store": 1320 },
        daily_trends: [
          { date: "2026-08-01", total_amount: 350, transaction_count: 1 },
          { date: "2026-08-02", total_amount: 180, transaction_count: 1 },
          { date: "2026-08-03", total_amount: 1450, transaction_count: 1 },
          { date: "2026-08-05", total_amount: 600, transaction_count: 1 },
          { date: "2026-08-06", total_amount: 999, transaction_count: 1 },
          { date: "2026-08-08", total_amount: 299, transaction_count: 1 },
          { date: "2026-08-11", total_amount: 1299, transaction_count: 1 },
          { date: "2026-08-13", total_amount: 1850, transaction_count: 1 },
          { date: "2026-08-15", total_amount: 799, transaction_count: 1 },
          { date: "2026-08-17", total_amount: 1750, transaction_count: 1 },
          { date: "2026-08-21", total_amount: 750, transaction_count: 1 },
          { date: "2026-08-25", total_amount: 1200, transaction_count: 1 }
        ],
        top_category: { category: "Shopping", amount: 5738.00, percentage: 30.1 },
        highest_expense: { id: 25, date: "2026-08-13", merchant: "Electricity Bill Bescom", amount: 1850.00, category: "Bills" },
        transactions: [
          { id: 25, date: "2026-08-25", merchant: "Gym Membership", amount: 1200.00, category: "Health", status: "Paid" },
          { id: 24, date: "2026-08-24", merchant: "Water Bill Payment", amount: 310.00, category: "Bills", status: "Paid" },
          { id: 23, date: "2026-08-23", merchant: "Zomato Delivery", amount: 540.00, category: "Food", status: "Paid" },
          { id: 22, date: "2026-08-22", merchant: "Pharmacy Medical Store", amount: 240.00, category: "Shopping", status: "Paid" },
          { id: 21, date: "2026-08-21", merchant: "Petrol Pump BPCL", amount: 750.00, category: "Travel", status: "Paid" },
          { id: 20, date: "2026-08-20", merchant: "Cinema Movie Ticket", amount: 350.00, category: "Bills", status: "Paid" },
          { id: 19, date: "2026-08-19", merchant: "Swiggy Instamart", amount: 420.00, category: "Food", status: "Paid" },
          { id: 18, date: "2026-08-18", merchant: "Rapido Bike Taxi", amount: 75.00, category: "Travel", status: "Paid" },
          { id: 17, date: "2026-08-17", merchant: "Myntra Fashion Shopping", amount: 1750.00, category: "Shopping", status: "Paid" },
          { id: 16, date: "2026-08-16", merchant: "Metro Card Recharge", amount: 500.00, category: "Travel", status: "Paid" },
          { id: 15, date: "2026-08-15", merchant: "Broadband Wifi Bill Airtel", amount: 799.00, category: "Bills", status: "Paid" },
          { id: 14, date: "2026-08-14", merchant: "Restaurant Dinner", amount: 850.00, category: "Food", status: "Paid" },
          { id: 13, date: "2026-08-13", merchant: "Electricity Bill Bescom", amount: 1850.00, category: "Bills", status: "Paid" },
          { id: 12, date: "2026-08-12", merchant: "Ola Mini Ride", amount: 215.00, category: "Travel", status: "Paid" },
          { id: 11, date: "2026-08-11", merchant: "Flipkart Order", amount: 1299.00, category: "Shopping", status: "Paid" },
          { id: 10, date: "2026-08-10", merchant: "Tea Stall", amount: 40.00, category: "Food", status: "Paid" },
          { id: 8, date: "2026-08-08", merchant: "Mobile Recharge Jio", amount: 299.00, category: "Bills", status: "Paid" },
          { id: 7, date: "2026-08-07", merchant: "Canteen Snacks", amount: 60.00, category: "Food", status: "Paid" },
          { id: 6, date: "2026-08-06", merchant: "Amazon Purchase", amount: 999.00, category: "Shopping", status: "Paid" },
          { id: 5, date: "2026-08-05", merchant: "Petrol Pump HPCL", amount: 600.00, category: "Travel", status: "Paid" },
          { id: 4, date: "2026-08-04", merchant: "Zomato Food", amount: 220.00, category: "Food", status: "Paid" },
          { id: 3, date: "2026-08-03", merchant: "DMart Supermarket", amount: 1450.00, category: "Shopping", status: "Paid" },
          { id: 2, date: "2026-08-02", merchant: "Uber Ride", amount: 180.00, category: "Travel", status: "Paid" },
          { id: 1, date: "2026-08-01", merchant: "Swiggy", amount: 350.00, category: "Food", status: "Paid" }
        ],
        total_parsed: 24,
        total_skipped: 2
      }
    };
  }

  function parseLocalText(content, fileName = "transactions.txt") {
    const lines = content.split(/\r?\n/);
    const txns = [];
    let idCounter = 1;

    const catKeywords = {
      Food: ["swiggy", "zomato", "canteen", "tea", "restaurant", "lunch", "dinner", "breakfast", "snacks", "cafe"],
      Travel: ["uber", "ola", "rapido", "metro", "petrol", "hpcl", "bpcl", "iocl", "fuel", "taxi", "commute", "pass"],
      Shopping: ["amazon", "flipkart", "myntra", "shoes", "fashion", "order", "clothing", "kindle", "gift"],
      Bills: ["bescom", "mseb", "electricity", "water", "wifi", "airtel", "jio", "broadband", "recharge", "lpg", "gas", "bill", "ticket", "cinema"],
      Health: ["pharmacy", "medical", "doctor", "clinic", "hospital", "gym", "yoga", "vitamin"],
      Store: ["dmart", "demart", "grocery", "supermarket", "store"]
    };

    function categorizeMerchant(m) {
      const lower = m.toLowerCase();
      for (const [cat, keywords] of Object.entries(catKeywords)) {
        if (keywords.some(k => lower.includes(k))) return cat;
      }
      return "Other";
    }

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return;
      const parts = trimmed.split(",").map(p => p.trim());
      if (parts.length >= 3) {
        const date = parts[0];
        const merchant = parts[1];
        const amount = parseFloat(parts[2].replace(/[^0-9.-]+/g, ""));
        if (!isNaN(amount) && date.length >= 8 && merchant) {
          txns.push({
            id: idCounter++,
            date: date,
            merchant: merchant,
            amount: amount,
            category: parts[3] || categorizeMerchant(merchant),
            status: "Paid"
          });
        }
      }
    });

    const totalSpent = txns.reduce((sum, t) => sum + t.amount, 0);
    const catTotals = {};
    const catCounts = {};

    txns.forEach(t => {
      catTotals[t.category] = (catTotals[t.category] || 0) + t.amount;
      catCounts[t.category] = (catCounts[t.category] || 0) + 1;
    });

    const colors = {
      Shopping: "#9D74FF", Bills: "#38BDF8", Travel: "#F59E0B",
      Food: "#00D284", Health: "#EC4899", Store: "#14B8A6", Other: "#94A3B8"
    };

    const categories = Object.entries(catTotals).map(([cat, amt]) => ({
      category: cat,
      amount: amt,
      percentage: totalSpent > 0 ? Number(((amt / totalSpent) * 100).toFixed(1)) : 0,
      color: colors[cat] || "#94A3B8",
      transaction_count: catCounts[cat] || 0
    })).sort((a, b) => b.amount - a.amount);

    const dailyTrendsMap = {};
    txns.forEach(t => {
      if (!dailyTrendsMap[t.date]) {
        dailyTrendsMap[t.date] = { date: t.date, total_amount: 0, transaction_count: 0 };
      }
      dailyTrendsMap[t.date].total_amount += t.amount;
      dailyTrendsMap[t.date].transaction_count += 1;
    });

    const dailyTrends = Object.values(dailyTrendsMap).sort((a, b) => a.date.localeCompare(b.date));
    const budgetLimit = (currentSummaryData && currentSummaryData.budget_limit) || 10000;
    const isOverBudget = totalSpent > budgetLimit;

    return {
      status: "success",
      file_name: fileName,
      data: {
        total_spent: totalSpent,
        budget_limit: budgetLimit,
        is_over_budget: isOverBudget,
        over_budget_amount: isOverBudget ? totalSpent - budgetLimit : 0,
        budget_percentage: (totalSpent / budgetLimit) * 100,
        selected_months: [8],
        month_names: ["Current"],
        categories: categories,
        category_totals: catTotals,
        daily_trends: dailyTrends,
        top_category: categories[0] || null,
        highest_expense: txns.slice().sort((a, b) => b.amount - a.amount)[0] || null,
        transactions: txns.reverse(),
        total_parsed: txns.length,
        total_skipped: 0
      }
    };
  }

  // --- 3. UI Renderers ---
  function renderMetrics(data) {
    const container = document.getElementById("metricsRowContainer");
    if (!container || !data) return;

    const totalSpent = data.total_spent || 0;
    const budgetLimit = data.budget_limit || 10000;
    const budgetPct = data.budget_percentage || 0;
    const isOverBudget = data.is_over_budget;
    const overAmount = data.over_budget_amount || 0;
    const topCat = data.top_category;
    const txnCount = data.transactions ? data.transactions.length : (data.total_parsed || 30);

    const fmt = (num) => "₹" + Number(num).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const fmtShort = (num) => "₹" + Number(num).toLocaleString("en-IN", { maximumFractionDigits: 0 });

    container.innerHTML = `
      <!-- Card 1: TOTAL SPENT -->
      <div class="metric-card">
        <div class="metric-card-header">
          <span class="metric-card-label">TOTAL SPENT</span>
          <div class="metric-icon-bubble" style="background: rgba(157, 116, 255, 0.2); color: #9D74FF;">👛</div>
        </div>
        <div class="metric-card-value">${fmt(totalSpent)}</div>
        <div class="metric-card-footer">
          <span>🏷️</span>
          <span>Across ${txnCount} verified transactions</span>
        </div>
      </div>

      <!-- Card 2: BUDGET TARGET -->
      <div class="metric-card">
        <div class="metric-card-header">
          <span class="metric-card-label">BUDGET TARGET</span>
          <div class="metric-icon-bubble" style="background: rgba(56, 189, 248, 0.2); color: #38BDF8;">📈</div>
        </div>
        <div class="metric-card-value">${fmt(budgetLimit)}</div>
        <div class="metric-card-footer">
          <span>📈</span>
          <span>Burn velocity: <strong style="color: ${isOverBudget ? '#FF4757' : '#00D284'};">${budgetPct.toFixed(1)}%</strong></span>
        </div>
      </div>

      <!-- Card 3: BUDGET STATUS -->
      <div class="metric-card" style="border-color: ${isOverBudget ? 'rgba(255, 71, 87, 0.25)' : 'rgba(0, 210, 132, 0.25)'};">
        <div class="metric-card-header">
          <span class="metric-card-label">BUDGET STATUS</span>
          <div class="metric-icon-bubble" style="background: ${isOverBudget ? 'rgba(255, 71, 87, 0.2)' : 'rgba(0, 210, 132, 0.2)'}; color: ${isOverBudget ? '#FF4757' : '#00D284'};">
            ${isOverBudget ? '⚠️' : '🛡️'}
          </div>
        </div>
        <div class="metric-card-value" style="color: ${isOverBudget ? '#FF4757' : '#00D284'};">
          ${isOverBudget ? '+' + fmt(overAmount) : '-' + fmt(budgetLimit - totalSpent)}
        </div>
        <div class="metric-card-footer" style="color: ${isOverBudget ? '#FFA5A5' : '#86EFAC'};">
          <span>${isOverBudget ? '↗️' : '↘️'}</span>
          <span>${isOverBudget ? `Exceeded by ${fmtShort(overAmount)}` : `Remaining ${fmtShort(budgetLimit - totalSpent)}`}</span>
        </div>
      </div>

      <!-- Card 4: TOP SPEND CATEGORY -->
      <div class="metric-card">
        <div class="metric-card-header">
          <span class="metric-card-label">TOP SPEND CATEGORY</span>
          <div class="metric-icon-bubble" style="background: rgba(245, 158, 11, 0.2); color: #F59E0B;">🏷️</div>
        </div>
        <div class="metric-card-value" style="font-size: 1.45rem;">
          <span>${topCat ? topCat.category : 'N/A'}</span>
          ${topCat ? `<span class="metric-badge-pct">${topCat.percentage}%</span>` : ''}
        </div>
        <div class="metric-card-footer">
          <span>Total: <strong>${topCat ? fmt(topCat.amount) : '₹0.00'}</strong></span>
        </div>
      </div>
    `;
  }

  function renderCharts(data) {
    renderRadialVelocity(data);
    renderCategoryBreakdown(data);
    renderDailyBarChart(data);
  }

  function renderRadialVelocity(data) {
    const pctVal = document.getElementById("radialPctValue");
    const statusTag = document.getElementById("radialStatusTag");
    const progressBar = document.getElementById("radialProgressBar");
    const bottomBadge = document.getElementById("velocityBottomBadge");
    if (!pctVal || !statusTag || !progressBar) return;

    const budgetPct = data.budget_percentage || 0;
    const isOver = data.is_over_budget;
    const overAmount = data.over_budget_amount || 0;
    const limit = data.budget_limit || 10000;
    const total = data.total_spent || 0;

    pctVal.textContent = `${Math.round(budgetPct)}%`;
    statusTag.textContent = isOver ? "EXCEEDED" : "HEALTHY";
    statusTag.style.color = isOver ? "#FF4757" : "#00D284";

    const circumference = 427.2;
    const fillPct = Math.min(100, Math.max(0, budgetPct));
    const offset = circumference - (fillPct / 100) * circumference;

    progressBar.style.strokeDashoffset = offset;
    progressBar.style.stroke = isOver ? "#FF4757" : "#00D284";

    if (bottomBadge) {
      const fmt = (n) => "₹" + Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      if (isOver) {
        bottomBadge.style.display = "flex";
        bottomBadge.style.background = "rgba(255, 71, 87, 0.14)";
        bottomBadge.style.borderColor = "rgba(255, 71, 87, 0.35)";
        bottomBadge.style.color = "#FFA5A5";
        bottomBadge.innerHTML = `<span>⚠️</span><span>Exceeded limit by <strong>${fmt(overAmount)}</strong></span>`;
      } else {
        bottomBadge.style.display = "flex";
        bottomBadge.style.background = "rgba(0, 210, 132, 0.14)";
        bottomBadge.style.borderColor = "rgba(0, 210, 132, 0.35)";
        bottomBadge.style.color = "#86EFAC";
        bottomBadge.innerHTML = `<span>🛡️</span><span>Remaining budget <strong>${fmt(limit - total)}</strong></span>`;
      }
    }
  }

  function renderCategoryBreakdown(data) {
    const canvas = document.getElementById("categoryDonutChart");
    const centerTotal = document.getElementById("donutCenterTotal");
    const countBadge = document.getElementById("categoryCountBadge");
    const barList = document.getElementById("categoryBarsList");
    if (!canvas) return;

    const categories = data.categories || [];
    const totalSpent = data.total_spent || 0;

    if (centerTotal) {
      if (totalSpent >= 1000) {
        centerTotal.textContent = `₹${(totalSpent / 1000).toFixed(1)}k`;
      } else {
        centerTotal.textContent = `₹${totalSpent.toFixed(0)}`;
      }
    }

    if (countBadge) {
      countBadge.textContent = `${categories.length} Categories`;
    }

    drawDonutCanvas(canvas, categories, totalSpent);

    if (barList) {
      const fmt = (num) => "₹" + Number(num).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

      barList.innerHTML = categories.map(cat => `
        <div class="category-bar-row">
          <div class="category-bar-info">
            <div class="cat-bullet-label">
              <span class="cat-bullet-dot" style="background: ${cat.color};"></span>
              <span>${cat.category}</span>
            </div>
            <div class="cat-amount-group">
              <span class="cat-amount-val">${fmt(cat.amount)}</span>
              <span class="cat-pct-val">${cat.percentage}%</span>
            </div>
          </div>
          <div class="cat-progress-track">
            <div class="cat-progress-fill" style="width: ${cat.percentage}%; background: ${cat.color};"></div>
          </div>
        </div>
      `).join("");
    }
  }

  function drawDonutCanvas(canvas, categories, totalSpent) {
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const size = 190;

    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, size, size);

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = 70;
    const lineWidth = 24;

    if (!categories || categories.length === 0 || totalSpent <= 0) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = "#151C2C";
      ctx.lineWidth = lineWidth;
      ctx.stroke();
      return;
    }

    let startAngle = -Math.PI / 2;

    categories.forEach((cat) => {
      const sliceAngle = (cat.amount / totalSpent) * (2 * Math.PI);
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.strokeStyle = cat.color || "#9D74FF";
      ctx.lineWidth = lineWidth;
      ctx.lineCap = "butt";
      ctx.stroke();

      startAngle = endAngle;
    });
  }

  function renderDailyBarChart(data) {
    const container = document.getElementById("dailyBarChartContainer");
    if (!container) return;

    const trends = data.daily_trends || [];
    if (trends.length === 0) {
      container.innerHTML = `<div style="color: var(--text-muted); font-size: 0.8rem; margin: auto;">No daily transactions to plot</div>`;
      return;
    }

    const maxAmount = Math.max(...trends.map(t => t.total_amount), 2000);
    const fmt = (n) => "₹" + Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });

    const displayTrends = trends.slice(-18);

    container.innerHTML = displayTrends.map(t => {
      const heightPct = Math.min(100, Math.max(8, (t.total_amount / maxAmount) * 100));
      const dayLabel = t.date.slice(8);

      return `
        <div class="bar-col" title="${t.date}: ${fmt(t.total_amount)} (${t.transaction_count} txns)">
          <div class="bar-fill" style="height: ${heightPct}%;"></div>
          <span class="bar-date-label">${dayLabel}</span>
        </div>
      `;
    }).join("");
  }

  function renderInsights(data) {
    const container = document.getElementById("insightsGridContainer");
    if (!container || !data) return;

    const total = data.total_spent || 0;
    const limit = data.budget_limit || 10000;
    const isOver = data.is_over_budget;
    const overAmount = data.over_budget_amount || 0;
    const overPct = limit > 0 ? ((overAmount / limit) * 100).toFixed(1) : 0;
    const categories = data.categories || [];
    const topCat = data.top_category;
    const highestExp = data.highest_expense;

    const fmt = (n) => "₹" + Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const fmtShort = (n) => "₹" + Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });

    let card1 = isOver ? `
      <div class="insight-card alert">
        <div class="insight-header" style="color: #FF4757;"><span>⚠️</span><span>Budget Alert</span></div>
        <div class="insight-desc">You exceeded your ${fmtShort(limit)} limit by ${fmt(overAmount)} (${overPct}% over limit).</div>
      </div>
    ` : `
      <div class="insight-card" style="border-color: rgba(0, 210, 132, 0.25);">
        <div class="insight-header" style="color: #00D284;"><span>🛡️</span><span>Healthy Budget</span></div>
        <div class="insight-desc">You are within your ${fmtShort(limit)} budget with ${fmt(limit - total)} left.</div>
      </div>
    `;

    let card2 = topCat ? `
      <div class="insight-card">
        <div class="insight-header" style="color: #FBBF24;"><span>💡</span><span>Top Spend Category</span></div>
        <div class="insight-desc"><strong>${topCat.category}</strong> represents the highest expense at ${fmt(topCat.amount)} (${topCat.percentage}% of total).</div>
      </div>
    ` : '';

    let card3 = '';
    if (categories.length >= 2) {
      const combinedPct = (categories[0].percentage + categories[1].percentage).toFixed(1);
      card3 = `
        <div class="insight-card">
          <div class="insight-header" style="color: #FBBF24;"><span>💡</span><span>Concentration</span></div>
          <div class="insight-desc"><strong>${categories[0].category}</strong> and <strong>${categories[1].category}</strong> together account for ${combinedPct}% of total spend.</div>
        </div>
      `;
    }

    let card4 = highestExp ? `
      <div class="insight-card">
        <div class="insight-header" style="color: #FBBF24;"><span>💡</span><span>Peak Spending Day</span></div>
        <div class="insight-desc"><strong>${highestExp.date}</strong> had the highest spending of ${fmt(highestExp.amount)} (${highestExp.merchant}).</div>
      </div>
    ` : '';

    container.innerHTML = card1 + card2 + card3 + card4;
  }

  function renderBudgetAlert(data) {
    const banner = document.getElementById("budgetAlertBanner");
    const titleText = document.getElementById("alertTitleText");
    const descText = document.getElementById("alertDescText");
    const headerBudgetLabel = document.getElementById("headerBudgetLabel");
    if (!banner || !data) return;

    const isOver = data.is_over_budget;
    const total = data.total_spent || 0;
    const limit = data.budget_limit || 10000;
    const over = data.over_budget_amount || 0;

    const fmt = (n) => "₹" + Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const fmtShort = (n) => "₹" + Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });

    if (headerBudgetLabel) {
      headerBudgetLabel.textContent = `Budget: ${fmtShort(limit)}`;
    }

    if (isOver) {
      banner.style.display = "flex";
      banner.style.background = "linear-gradient(90deg, rgba(80, 10, 20, 0.95), rgba(40, 10, 20, 0.85))";
      banner.style.borderColor = "rgba(255, 71, 87, 0.35)";
      if (titleText) titleText.textContent = "Monthly Budget Limit Exceeded!";
      if (descText) {
        descText.innerHTML = `Your expenses have surpassed your ${fmtShort(limit)} threshold by <strong>${fmt(over)}</strong>`;
      }
    } else {
      banner.style.display = "flex";
      banner.style.background = "linear-gradient(90deg, rgba(10, 60, 40, 0.95), rgba(10, 30, 20, 0.85))";
      banner.style.borderColor = "rgba(0, 210, 132, 0.35)";
      if (titleText) titleText.textContent = "Within Monthly Budget Limit";
      if (descText) {
        descText.innerHTML = `Total spent is <strong>${fmt(total)}</strong> of ${fmtShort(limit)}. Remaining budget: <strong style="color: #00D284;">${fmt(limit - total)}</strong>`;
      }
    }
  }

  function showToast(message, type = "info") {
    let container = document.getElementById("toastContainer");
    if (!container) {
      container = document.createElement("div");
      container.id = "toastContainer";
      container.className = "toast-container";
      document.body.appendChild(container);
    }

    const icons = { success: "✅", warning: "⚠️", error: "❌", info: "ℹ️" };
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `<span>${icons[type] || "ℹ️"}</span><span>${message}</span>`;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(10px)";
      setTimeout(() => toast.remove(), 250);
    }, 3500);
  }

  // --- 4. Transaction Ledger Component Controller ---
  let allTransactions = [];
  let filteredTransactions = [];
  let currentPage = 1;
  const pageSize = 10;
  let currentSort = { column: 'date', order: 'desc' };
  let currentCategoryFilter = 'all';
  let searchQuery = '';

  function renderTransactionLedger(data) {
    allTransactions = (data && data.transactions) ? data.transactions : [];
    currentPage = 1;
    filterAndRenderLedger();
  }

  function filterAndRenderLedger() {
    const q = searchQuery.toLowerCase();
    filteredTransactions = allTransactions.filter(txn => {
      const matchesSearch = !q ||
        (txn.merchant && txn.merchant.toLowerCase().includes(q)) ||
        (txn.date && txn.date.includes(q)) ||
        (txn.category && txn.category.toLowerCase().includes(q)) ||
        (txn.amount !== undefined && String(txn.amount).includes(q));

      const matchesCat = currentCategoryFilter === 'all' ||
        (txn.category && txn.category.toLowerCase() === currentCategoryFilter.toLowerCase());

      return matchesSearch && matchesCat;
    });

    // Sort
    filteredTransactions.sort((a, b) => {
      let valA = a[currentSort.column];
      let valB = b[currentSort.column];

      if (currentSort.column === 'amount') {
        valA = Number(valA) || 0;
        valB = Number(valB) || 0;
      } else {
        valA = String(valA || '').toLowerCase();
        valB = String(valB || '').toLowerCase();
      }

      if (valA < valB) return currentSort.order === 'asc' ? -1 : 1;
      if (valA > valB) return currentSort.order === 'asc' ? 1 : -1;
      return 0;
    });

    renderLedgerRows();
  }

  function renderLedgerRows() {
    const tbody = document.getElementById("transactionsTableBody");
    const countPill = document.getElementById("ledgerCountPill");
    const paginationInfo = document.getElementById("tablePaginationInfo");
    const pageIndicator = document.getElementById("pageIndicatorText");
    const prevBtn = document.getElementById("prevPageBtn");
    const nextBtn = document.getElementById("nextPageBtn");
    if (!tbody) return;

    const total = filteredTransactions.length;
    const allTotal = allTransactions.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const startIdx = (currentPage - 1) * pageSize;
    const pageItems = filteredTransactions.slice(startIdx, startIdx + pageSize);

    if (countPill) {
      countPill.textContent = `${total} of ${allTotal}`;
    }

    if (pageItems.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 36px 20px; color: var(--text-muted);">
            <div style="font-size: 1.5rem; margin-bottom: 8px;">🔍</div>
            <div style="font-weight: 600; color: var(--text-secondary);">No transactions match your search or filter</div>
            <div style="font-size: 0.75rem; margin-top: 4px;">Try selecting ALL categories or clearing the search query</div>
          </td>
        </tr>
      `;
    } else {
      const fmt = (n) => "₹" + Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      tbody.innerHTML = pageItems.map(txn => {
        const catClass = `cat-badge-${txn.category || 'Other'}`;
        return `
          <tr>
            <td style="font-family: var(--font-mono); font-size: 0.8rem; color: #94A3B8;">${escapeHtml(txn.date)}</td>
            <td style="font-weight: 600; color: #FFFFFF;">${escapeHtml(txn.merchant)}</td>
            <td>
              <span class="category-badge-pill ${catClass}">${escapeHtml(txn.category || 'Other')}</span>
            </td>
            <td class="text-right" style="font-weight: 700; color: #F8FAFC; font-family: var(--font-sans);">
              ${fmt(txn.amount)}
            </td>
            <td class="text-right">
              <span class="status-paid-pill">Paid ↗</span>
            </td>
          </tr>
        `;
      }).join("");
    }

    if (paginationInfo) {
      const showFrom = total > 0 ? startIdx + 1 : 0;
      const showTo = Math.min(startIdx + pageSize, total);
      paginationInfo.textContent = `Showing ${showFrom} to ${showTo} of ${total} transactions`;
    }

    if (pageIndicator) {
      pageIndicator.textContent = `${currentPage} / ${totalPages}`;
    }

    if (prevBtn) prevBtn.disabled = currentPage <= 1;
    if (nextBtn) nextBtn.disabled = currentPage >= totalPages;
  }

  function setupLedgerEventListeners() {
    // 1. Search Bar
    const searchInput = document.getElementById("tableSearchInput");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        searchQuery = e.target.value.trim();
        currentPage = 1;
        filterAndRenderLedger();
      });
    }

    // 2. Category Filter Pills
    const pillContainer = document.getElementById("categoryPillsContainer");
    if (pillContainer) {
      pillContainer.addEventListener("click", (e) => {
        const pill = e.target.closest(".cat-pill");
        if (!pill) return;

        pillContainer.querySelectorAll(".cat-pill").forEach(p => p.classList.remove("active"));
        pill.classList.add("active");

        currentCategoryFilter = pill.getAttribute("data-category") || "all";
        currentPage = 1;
        filterAndRenderLedger();
      });
    }

    // 3. Sort Headers
    const sortHeaders = document.querySelectorAll(".sortable-th");
    sortHeaders.forEach(th => {
      th.addEventListener("click", () => {
        const col = th.getAttribute("data-sort");
        if (currentSort.column === col) {
          currentSort.order = currentSort.order === 'asc' ? 'desc' : 'asc';
        } else {
          currentSort.column = col;
          currentSort.order = (col === 'amount' || col === 'date') ? 'desc' : 'asc';
        }

        // Update sort indicators
        sortHeaders.forEach(h => {
          const c = h.getAttribute("data-sort");
          const ind = h.querySelector(".sort-indicator");
          if (ind) {
            if (c === currentSort.column) {
              ind.textContent = currentSort.order === 'asc' ? '↑' : '↓';
              h.classList.add(currentSort.order === 'asc' ? 'sorted-asc' : 'sorted-desc');
            } else {
              ind.textContent = '⇅';
              h.classList.remove('sorted-asc', 'sorted-desc');
            }
          }
        });

        filterAndRenderLedger();
      });
    });

    // 4. Pagination Prev / Next Buttons
    const prevBtn = document.getElementById("prevPageBtn");
    const nextBtn = document.getElementById("nextPageBtn");

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        if (currentPage > 1) {
          currentPage--;
          renderLedgerRows();
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        const totalPages = Math.ceil(filteredTransactions.length / pageSize) || 1;
        if (currentPage < totalPages) {
          currentPage++;
          renderLedgerRows();
        }
      });
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // --- 5. Main Controller & Event Binding ---
  let currentSummaryData = null;

  function updateDashboard(data) {
    if (!data) return;
    currentSummaryData = data;

    renderBudgetAlert(data);
    renderMetrics(data);
    renderCharts(data);
    renderInsights(data);
    renderTransactionLedger(data);
  }

  async function initializeApp() {
    await BridgeService.waitForBridge();

    try {
      const res = await BridgeService.loadDefaultData();
      if (res && res.status === "success") {
        updateDashboard(res.data);
      }
    } catch (e) {
      console.error("Init load error:", e);
      updateDashboard(getFallbackData().data);
    }
  }

  function setupEvents() {
    // Browse File & Upload Button
    const browseBtn = document.getElementById("browseFileBtn");
    const headerUploadBtn = document.getElementById("headerUploadBtn");

    const openPicker = async () => {
      const res = await BridgeService.openFileDialog();
      if (res && res.status === "success") {
        updateDashboard(res.data);
        showToast(`Statement ${res.file_name || ''} loaded!`, "success");
      } else if (res && res.status !== "cancelled") {
        document.getElementById("hiddenFileInput")?.click();
      }
    };

    if (browseBtn) browseBtn.addEventListener("click", openPicker);
    if (headerUploadBtn) headerUploadBtn.addEventListener("click", openPicker);

    // Load Demo Statement
    const sampleBtn = document.getElementById("sampleStatementBtn");
    const loadDemoBtn = document.getElementById("loadDemoBtn");

    const loadDemo = async () => {
      const res = await BridgeService.loadDefaultData();
      if (res && res.status === "success") {
        updateDashboard(res.data);
        showToast("Demo statement loaded successfully!", "success");
      }
    };

    if (sampleBtn) sampleBtn.addEventListener("click", loadDemo);
    if (loadDemoBtn) loadDemoBtn.addEventListener("click", loadDemo);

    // Drag and Drop
    const dropzone = document.getElementById("fileDropzone");
    const fileInput = document.getElementById("hiddenFileInput");

    if (dropzone) {
      dropzone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropzone.classList.add("drag-over");
      });

      dropzone.addEventListener("dragleave", () => {
        dropzone.classList.remove("drag-over");
      });

      dropzone.addEventListener("drop", async (e) => {
        e.preventDefault();
        dropzone.classList.remove("drag-over");

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          handleFileRead(e.dataTransfer.files[0]);
        }
      });
    }

    if (fileInput) {
      fileInput.addEventListener("change", (e) => {
        if (e.target.files && e.target.files.length > 0) {
          handleFileRead(e.target.files[0]);
        }
      });
    }

    // Export CSV
    const exportCsvBtn = document.getElementById("exportCsvBtn");
    if (exportCsvBtn) {
      exportCsvBtn.addEventListener("click", async () => {
        const res = await BridgeService.exportReport("csv", [8]);
        if (res && res.status === "success") {
          showToast(res.message || "CSV Exported Successfully!", "success");
        }
      });
    }

    // Budget Adjustment Modal
    const adjustBudgetBtn = document.getElementById("adjustBudgetBtn");
    const changeLimitLink = document.getElementById("changeLimitLink");
    const headerBudgetBtn = document.getElementById("headerBudgetBtn");

    const openBudgetModal = () => {
      const modal = document.getElementById("budgetModal");
      const input = document.getElementById("budgetLimitInput");
      if (modal && currentSummaryData) {
        input.value = currentSummaryData.budget_limit || 10000;
        modal.classList.add("open");
      }
    };

    if (adjustBudgetBtn) adjustBudgetBtn.addEventListener("click", openBudgetModal);
    if (changeLimitLink) changeLimitLink.addEventListener("click", openBudgetModal);
    if (headerBudgetBtn) headerBudgetBtn.addEventListener("click", openBudgetModal);

    const closeBudgetBtn = document.getElementById("closeBudgetModalBtn");
    const cancelBudgetBtn = document.getElementById("cancelBudgetBtn");
    const saveBudgetBtn = document.getElementById("saveBudgetBtn");

    const closeBudgetModal = () => {
      const modal = document.getElementById("budgetModal");
      if (modal) modal.classList.remove("open");
    };

    if (closeBudgetBtn) closeBudgetBtn.onclick = closeBudgetModal;
    if (cancelBudgetBtn) cancelBudgetBtn.onclick = closeBudgetModal;

    if (saveBudgetBtn) {
      saveBudgetBtn.addEventListener("click", async () => {
        const input = document.getElementById("budgetLimitInput");
        const val = parseFloat(input.value);
        if (isNaN(val) || val <= 0) {
          showToast("Please enter a valid budget amount", "warning");
          return;
        }

        const res = await BridgeService.updateBudget(val);
        if (res && res.status === "success") {
          updateDashboard(res.data);
          closeBudgetModal();
          showToast(`Budget limit updated to ₹${val.toLocaleString('en-IN')}`, "success");
        }
      });
    }

    // 6. Setup Transaction Ledger Listeners
    setupLedgerEventListeners();
  }

  function handleFileRead(file) {
    showToast(`Parsing ${file.name}...`, "info");
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
      const res = await BridgeService.processContent(text, file.name);
      if (res && res.status === "success") {
        updateDashboard(res.data);
        showToast(`Loaded statement ${res.file_name || ''}!`, "success");
      } else {
        showToast((res && res.message) || "Error parsing statement", "error");
      }
    };
    reader.readAsText(file);
  }

  // Self Initialization
  if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", () => {
      setupEvents();
      initializeApp();
    });
  } else {
    setupEvents();
    initializeApp();
  }

})();
