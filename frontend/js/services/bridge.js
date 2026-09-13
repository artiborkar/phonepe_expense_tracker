/**
 * PyWebView Bridge Client for PhonePe Expense Tracker
 * Seamlessly talks to window.pywebview.api when in Desktop mode,
 * and provides mock data fallback when opened in a standard web browser for dev.
 */

export const BridgeService = {
  isDesktop() {
    return typeof window !== 'undefined' && Boolean(window.pywebview && window.pywebview.api);
  },

  async waitForBridge(timeoutMs = 600) {
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

      // Immediate check in microtasks
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
      return await window.pywebview.api.load_default_data();
    }
    // Browser Mock fallback
    return {
      status: "success",
      data: {
        total_spent: 15431.00,
        budget_limit: 10000.00,
        is_over_budget: true,
        over_budget_amount: 5431.00,
        budget_percentage: 154.3,
        selected_months: [8],
        month_names: ["August"],
        categories: [
          { category: "Shopping", amount: 4048.00, percentage: 26.2, color: "#EC4899", transaction_count: 3 },
          { category: "Bills", amount: 3608.00, percentage: 23.4, color: "#3B82F6", transaction_count: 4 },
          { category: "Food", amount: 2565.00, percentage: 16.6, color: "#F59E0B", transaction_count: 7 },
          { category: "Travel", amount: 2320.00, percentage: 15.0, color: "#8B5CF6", transaction_count: 6 },
          { category: "Store", amount: 1450.00, percentage: 9.4, color: "#14B8A6", transaction_count: 1 },
          { category: "Health", amount: 1440.00, percentage: 9.3, color: "#10B981", transaction_count: 2 }
        ],
        category_totals: { "Shopping": 4048, "Bills": 3608, "Food": 2565, "Travel": 2320, "Store": 1450, "Health": 1440 },
        daily_trends: [
          { date: "2026-08-01", total_amount: 350, transaction_count: 1 },
          { date: "2026-08-03", total_amount: 1450, transaction_count: 1 },
          { date: "2026-08-06", total_amount: 999, transaction_count: 1 },
          { date: "2026-08-11", total_amount: 1299, transaction_count: 1 },
          { date: "2026-08-13", total_amount: 1850, transaction_count: 1 },
          { date: "2026-08-17", total_amount: 1750, transaction_count: 1 },
          { date: "2026-08-25", total_amount: 1200, transaction_count: 1 }
        ],
        top_category: { category: "Shopping", amount: 4048.00, percentage: 26.2 },
        highest_expense: { id: 13, date: "2026-08-13", merchant: "Electricity Bill Bescom", amount: 1850.00, category: "Bills" },
        transactions: [
          { id: 1, date: "2026-08-01", merchant: "Swiggy", amount: 350.00, category: "Food" },
          { id: 2, date: "2026-08-02", merchant: "Uber Ride", amount: 180.00, category: "Travel" },
          { id: 3, date: "2026-08-03", merchant: "DMart Supermarket", amount: 1450.00, category: "Store" },
          { id: 4, date: "2026-08-04", merchant: "Zomato Food", amount: 220.00, category: "Food" },
          { id: 5, date: "2026-08-05", merchant: "Petrol Pump HPCL", amount: 600.00, category: "Travel" },
          { id: 6, date: "2026-08-06", merchant: "Amazon Purchase", amount: 999.00, category: "Shopping" }
        ],
        parsing_errors: [
          { line_number: 9, raw_content: "2026-08-09, Invalid Line Without Comma", reason: "Expected 3 comma-separated values (Date, Merchant, Amount), but found 2" },
          { line_number: 27, raw_content: "2026-08-27,", reason: "Expected 3 comma-separated values (Date, Merchant, Amount), but found 2" }
        ],
        total_parsed: 50,
        total_skipped: 2
      }
    };
  },

  async openFileDialog() {
    if (this.isDesktop()) {
      return await window.pywebview.api.open_file_dialog();
    }
    return { status: "error", message: "Native dialog only supported in Desktop App" };
  },

  async processContent(content, fileName = "transactions.txt") {
    if (this.isDesktop()) {
      return await window.pywebview.api.process_content(content, fileName);
    }
    return { status: "error", message: "Desktop bridge required" };
  },

  async filterAnalytics(months, budgetLimit) {
    if (this.isDesktop()) {
      return await window.pywebview.api.filter_analytics(months, budgetLimit);
    }
    return await this.loadDefaultData();
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
    return { status: "success", saved_path: `mock_export.${formatType}` };
  }
};
