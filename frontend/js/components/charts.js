/**
 * PhonePe Expense Intelligence - Charts & Bar Velocity Component
 */

export function renderCharts(data) {
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

  // Circumference of r=68 circle is 2 * PI * 68 = 427.2
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

  // Take latest 18 days for clear spacing
  const displayTrends = trends.slice(-18);

  container.innerHTML = displayTrends.map(t => {
    const heightPct = Math.min(100, Math.max(8, (t.total_amount / maxAmount) * 100));
    const dayLabel = t.date.slice(8); // Extract DD

    return `
      <div class="bar-col" title="${t.date}: ${fmt(t.total_amount)} (${t.transaction_count} txns)">
        <div class="bar-fill" style="height: ${heightPct}%;"></div>
        <span class="bar-date-label">${dayLabel}</span>
      </div>
    `;
  }).join("");
}
