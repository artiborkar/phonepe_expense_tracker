/**
 * PhonePe Expense Intelligence - 4 Metrics Cards Component
 */

export function renderMetrics(data) {
  const container = document.getElementById("metricsRowContainer");
  if (!container || !data) return;

  const totalSpent = data.total_spent || 0;
  const budgetLimit = data.budget_limit || 10000;
  const budgetPct = data.budget_percentage || 0;
  const isOverBudget = data.is_over_budget;
  const overAmount = data.over_budget_amount || 0;
  const topCat = data.top_category;
  const txnCount = data.transactions ? data.transactions.length : 0;

  const fmt = (num) => "₹" + Number(num).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtShort = (num) => "₹" + Number(num).toLocaleString("en-IN", { maximumFractionDigits: 0 });

  container.innerHTML = `
    <!-- Card 1: TOTAL SPENT -->
    <div class="metric-card">
      <div class="metric-card-header">
        <span class="metric-card-label">TOTAL SPENT</span>
        <div class="metric-icon-bubble" style="background: rgba(157, 116, 255, 0.2); color: #9D74FF;">
          👛
        </div>
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
        <div class="metric-icon-bubble" style="background: rgba(56, 189, 248, 0.2); color: #38BDF8;">
          📈
        </div>
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
        <div class="metric-icon-bubble" style="background: rgba(245, 158, 11, 0.2); color: #F59E0B;">
          🏷️
        </div>
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
