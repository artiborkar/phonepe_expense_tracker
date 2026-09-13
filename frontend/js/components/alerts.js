/**
 * Alerts & Banner Component
 */

export function renderBudgetAlert(data) {
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

export function showToast(message, type = "info") {
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
