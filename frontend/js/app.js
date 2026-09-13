/**
 * PhonePe Expense Intelligence - Main Controller
 */

import { BridgeService } from './services/bridge.js';
import { renderMetrics } from './components/metrics.js';
import { renderCharts } from './components/charts.js';
import { renderInsights } from './components/insights.js';
import { renderBudgetAlert, showToast } from './components/alerts.js';
import { initTable, updateTransactions } from './components/table.js';

let currentSummaryData = null;

document.addEventListener("DOMContentLoaded", async () => {
  setupEventListeners();
  await loadInitialData();
});

async function loadInitialData() {
  await BridgeService.waitForBridge();

  try {
    const res = await BridgeService.loadDefaultData();
    if (res.status === "success") {
      updateDashboard(res.data);
    }
  } catch (err) {
    console.error("Initial load error:", err);
  }
}

function updateDashboard(data) {
  if (!data) return;
  currentSummaryData = data;

  // 1. Render Alert Banner
  renderBudgetAlert(data);

  // 2. Render 4 KPI Metrics
  renderMetrics(data);

  // 3. Render Radial Velocity Meter & Category Donut Breakdown & Daily Bar Chart
  renderCharts(data);

  // 4. Render AI & Smart Insights
  renderInsights(data);

  // 5. Render Transaction Ledger Table
  updateTransactions(data.transactions || []);
}

function setupEventListeners() {
  // 1. Native File Dialog Browse Buttons
  const browseBtn = document.getElementById("browseFileBtn");
  const headerUploadBtn = document.getElementById("headerUploadBtn");

  const openPicker = async () => {
    const res = await BridgeService.openFileDialog();
    if (res.status === "success") {
      updateDashboard(res.data);
      showToast(`Statement ${res.file_name || ''} loaded!`, "success");
    } else if (res.status !== "cancelled") {
      document.getElementById("hiddenFileInput")?.click();
    }
  };

  if (browseBtn) browseBtn.addEventListener("click", openPicker);
  if (headerUploadBtn) headerUploadBtn.addEventListener("click", openPicker);

  // 2. Try with Sample Statement / Load Demo
  const sampleBtn = document.getElementById("sampleStatementBtn");
  const loadDemoBtn = document.getElementById("loadDemoBtn");

  const loadDemo = async () => {
    const res = await BridgeService.loadDefaultData();
    if (res.status === "success") {
      updateDashboard(res.data);
      showToast("Demo statement loaded successfully!", "success");
    }
  };

  if (sampleBtn) sampleBtn.addEventListener("click", loadDemo);
  if (loadDemoBtn) loadDemoBtn.addEventListener("click", loadDemo);

  // 3. HTML5 Drag and Drop on DropZone
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

  // 4. Export CSV
  const exportCsvBtn = document.getElementById("exportCsvBtn");
  if (exportCsvBtn) {
    exportCsvBtn.addEventListener("click", async () => {
      const res = await BridgeService.exportReport("csv", [8]);
      if (res.status === "success") {
        showToast(res.message || "CSV Exported Successfully!", "success");
      }
    });
  }

  // 5. Adjust Budget Limit Modal
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
      if (res.status === "success") {
        updateDashboard(res.data);
        closeBudgetModal();
        showToast(`Budget limit updated to ₹${val.toLocaleString('en-IN')}`, "success");
      }
    });
  }

  initTable([]);
}

function handleFileRead(file) {
  showToast(`Parsing ${file.name}...`, "info");
  const reader = new FileReader();
  reader.onload = async (e) => {
    const text = e.target.result;
    const res = await BridgeService.processContent(text, file.name);
    if (res.status === "success") {
      updateDashboard(res.data);
      showToast(`Loaded statement ${res.file_name}!`, "success");
    } else {
      showToast(res.message || "Error parsing file", "error");
    }
  };
  reader.readAsText(file);
}
