/**
 * AI & Smart Expense Insights Component
 * Computes pattern intelligence, concentration, peak spend days, and anomalies
 */

export function renderInsights(data) {
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

  // 1. Budget Alert
  let card1Html = "";
  if (isOver) {
    card1Html = `
      <div class="insight-card alert">
        <div class="insight-header" style="color: #FF4757;">
          <span>⚠️</span><span>Budget Alert</span>
        </div>
        <div class="insight-desc">
          You exceeded your ${fmtShort(limit)} limit by ${fmt(overAmount)} (${overPct}% over limit).
        </div>
      </div>
    `;
  } else {
    const remaining = limit - total;
    card1Html = `
      <div class="insight-card" style="border-color: rgba(0, 210, 132, 0.25);">
        <div class="insight-header" style="color: #00D284;">
          <span>🛡️</span><span>Healthy Budget</span>
        </div>
        <div class="insight-desc">
          You are within your ${fmtShort(limit)} budget limit with ${fmt(remaining)} remaining.
        </div>
      </div>
    `;
  }

  // 2. Top Spend Category
  let card2Html = "";
  if (topCat) {
    card2Html = `
      <div class="insight-card">
        <div class="insight-header" style="color: #FBBF24;">
          <span>💡</span><span>Top Spend Category</span>
        </div>
        <div class="insight-desc">
          <strong>${topCat.category}</strong> represents the highest expense at ${fmt(topCat.amount)} (${topCat.percentage}% of total).
        </div>
      </div>
    `;
  } else {
    card2Html = `
      <div class="insight-card">
        <div class="insight-header" style="color: #FBBF24;">
          <span>💡</span><span>Top Category</span>
        </div>
        <div class="insight-desc">No category breakdown available.</div>
      </div>
    `;
  }

  // 3. Concentration (Top 2 categories)
  let card3Html = "";
  if (categories.length >= 2) {
    const cat1 = categories[0];
    const cat2 = categories[1];
    const combinedPct = (cat1.percentage + cat2.percentage).toFixed(1);
    card3Html = `
      <div class="insight-card">
        <div class="insight-header" style="color: #FBBF24;">
          <span>💡</span><span>Concentration</span>
        </div>
        <div class="insight-desc">
          <strong>${cat1.category}</strong> and <strong>${cat2.category}</strong> together account for ${combinedPct}% of your total spend.
        </div>
      </div>
    `;
  } else if (categories.length === 1) {
    card3Html = `
      <div class="insight-card">
        <div class="insight-header" style="color: #FBBF24;">
          <span>💡</span><span>Concentration</span>
        </div>
        <div class="insight-desc">
          100% of your expenses are concentrated in <strong>${categories[0].category}</strong>.
        </div>
      </div>
    `;
  } else {
    card3Html = `
      <div class="insight-card">
        <div class="insight-header" style="color: #FBBF24;">
          <span>💡</span><span>Concentration</span>
        </div>
        <div class="insight-desc">Balanced spending across diverse categories.</div>
      </div>
    `;
  }

  // 4. Peak Spending Day / Single Highest Transaction
  let card4Html = "";
  if (highestExp) {
    card4Html = `
      <div class="insight-card">
        <div class="insight-header" style="color: #FBBF24;">
          <span>💡</span><span>Peak Single Expense</span>
        </div>
        <div class="insight-desc">
          <strong>${highestExp.date}</strong> had the highest spending of ${fmt(highestExp.amount)} (${highestExp.merchant}).
        </div>
      </div>
    `;
  } else {
    card4Html = `
      <div class="insight-card">
        <div class="insight-header" style="color: #FBBF24;">
          <span>💡</span><span>Peak Spending</span>
        </div>
        <div class="insight-desc">No peak spending anomaly detected.</div>
      </div>
    `;
  }

  container.innerHTML = card1Html + card2Html + card3Html + card4Html;
}
