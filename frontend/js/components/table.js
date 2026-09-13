/**
 * Transactions Table Component: Search, Filtering, Sorting, and Pagination
 */

let allTransactions = [];
let filteredTransactions = [];
let currentPage = 1;
const pageSize = 10;
let currentSort = { column: 'date', order: 'desc' };
let currentCategoryFilter = 'all';
let searchQuery = '';

export function initTable(transactions = []) {
  allTransactions = transactions;
  currentPage = 1;
  filterAndRender();
  setupTableEventListeners();
}

export function updateTransactions(transactions = []) {
  allTransactions = transactions;
  currentPage = 1;
  filterAndRender();
}

function filterAndRender() {
  const q = searchQuery.toLowerCase();
  filteredTransactions = allTransactions.filter(txn => {
    const matchesSearch = !q || 
      (txn.merchant && txn.merchant.toLowerCase().includes(q)) ||
      (txn.date && txn.date.includes(q)) ||
      (txn.category && txn.category.toLowerCase().includes(q)) ||
      (txn.amount !== undefined && String(txn.amount).includes(q));

    const matchesCategory = currentCategoryFilter === 'all' || 
      (txn.category && txn.category.toLowerCase() === currentCategoryFilter.toLowerCase());

    return matchesSearch && matchesCategory;
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

  renderTableRows();
}

function renderTableRows() {
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

function setupTableEventListeners() {
  const searchInput = document.getElementById("tableSearchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value.trim();
      currentPage = 1;
      filterAndRender();
    });
  }

  const pillContainer = document.getElementById("categoryPillsContainer");
  if (pillContainer) {
    pillContainer.addEventListener("click", (e) => {
      const pill = e.target.closest(".cat-pill");
      if (!pill) return;

      pillContainer.querySelectorAll(".cat-pill").forEach(p => p.classList.remove("active"));
      pill.classList.add("active");

      currentCategoryFilter = pill.getAttribute("data-category") || "all";
      currentPage = 1;
      filterAndRender();
    });
  }

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

      filterAndRender();
    });
  });

  const prevBtn = document.getElementById("prevPageBtn");
  const nextBtn = document.getElementById("nextPageBtn");

  if (prevBtn) {
    prevBtn.onclick = () => {
      if (currentPage > 1) {
        currentPage--;
        renderTableRows();
      }
    };
  }

  if (nextBtn) {
    nextBtn.onclick = () => {
      const totalPages = Math.ceil(filteredTransactions.length / pageSize) || 1;
      if (currentPage < totalPages) {
        currentPage++;
        renderTableRows();
      }
    };
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

