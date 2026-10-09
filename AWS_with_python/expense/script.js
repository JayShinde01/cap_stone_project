
/* =====================================================
   SMART EXPENSE TRACKER
   Frontend only — existing AWS API unchanged
===================================================== */

const API_URL =
    "https://gjtk1qrghb.execute-api.ap-south-1.amazonaws.com";


// =====================================================
// DOM
// =====================================================

const expenseForm = document.getElementById("expenseForm");
const expensesList = document.getElementById("expensesList");

const expenseModal = document.getElementById("expenseModal");
const deleteModal = document.getElementById("deleteModal");

const openModalBtn = document.getElementById("openModalBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelModalBtn = document.getElementById("cancelModalBtn");

const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");

const searchInput = document.getElementById("searchInput");
const filterCategory = document.getElementById("filterCategory");
const sortSelect = document.getElementById("sortSelect");

const refreshBtn = document.getElementById("refreshBtn");
const exportBtn = document.getElementById("exportBtn");

const themeToggle = document.getElementById("themeToggle");
const mobileMenu = document.getElementById("mobileMenu");
const sidebar = document.getElementById("sidebar");


// =====================================================
// STATE
// =====================================================

let allExpenses = [];
let pendingDeleteId = null;

let categoryChart = null;
let timeChart = null;
let barChart = null;


// =====================================================
// CATEGORY CONFIG
// =====================================================

const CATEGORY_CONFIG = {

    Food: {
        icon: "fa-utensils",
        color: "#f59e0b"
    },

    Transport: {
        icon: "fa-car",
        color: "#4d9fff"
    },

    Shopping: {
        icon: "fa-bag-shopping",
        color: "#9b7bff"
    },

    Bills: {
        icon: "fa-lightbulb",
        color: "#ef6f6c"
    },

    Entertainment: {
        icon: "fa-film",
        color: "#45b890"
    },

    Other: {
        icon: "fa-box",
        color: "#8b919d"
    }
};


// =====================================================
// HELPERS
// =====================================================

function formatCurrency(value) {

    const amount = Number(value) || 0;

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2
    }).format(amount);
}


function formatCompactCurrency(value) {

    const amount = Number(value) || 0;

    if (amount >= 10000000) {
        return `₹${(amount / 10000000).toFixed(1)}Cr`;
    }

    if (amount >= 100000) {
        return `₹${(amount / 100000).toFixed(1)}L`;
    }

    if (amount >= 1000) {
        return `₹${(amount / 1000).toFixed(1)}K`;
    }

    return formatCurrency(amount);
}


function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function getCategoryConfig(category) {

    return CATEGORY_CONFIG[category] || CATEGORY_CONFIG.Other;
}


function getDateValue(expense) {

    if (!expense.date) {
        return 0;
    }

    const timestamp = new Date(expense.date).getTime();

    return Number.isNaN(timestamp) ? 0 : timestamp;
}


function getActiveDays(expenses) {

    const dates = new Set(
        expenses
            .filter(expense => expense.date)
            .map(expense => expense.date)
    );

    return Math.max(dates.size, 1);
}


// =====================================================
// TOAST
// =====================================================

function showToast(message, type = "success", title = null) {

    const container = document.getElementById("toastContainer");

    const toast = document.createElement("div");

    toast.className = `toast ${type}`;

    const icon =
        type === "success"
            ? "fa-check"
            : "fa-circle-exclamation";

    const heading =
        title ||
        (type === "success" ? "Success" : "Something went wrong");

    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fa-solid ${icon}"></i>
        </div>

        <div class="toast-message">
            <strong>${escapeHtml(heading)}</strong>
            <span>${escapeHtml(message)}</span>
        </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {

        toast.classList.add("removing");

        setTimeout(() => toast.remove(), 250);

    }, 3200);
}


// =====================================================
// API
// =====================================================

async function apiRequest(endpoint, options = {}) {

    const response = await fetch(
        `${API_URL}${endpoint}`,
        options
    );

    if (!response.ok) {

        let message = `Request failed (${response.status})`;

        try {

            const errorBody = await response.json();

            if (errorBody.message) {
                message = errorBody.message;
            }

        } catch (_) {
            // Ignore invalid error response
        }

        throw new Error(message);
    }

    return response;
}


// =====================================================
// LOADING UI
// =====================================================

function showLoadingState() {

    expensesList.innerHTML = `
        ${Array.from({ length: 5 })
            .map(
                () =>
                    `<div class="skeleton skeleton-row"></div>`
            )
            .join("")}
    `;
}


// =====================================================
// GET ALL EXPENSES
// =====================================================

async function loadExpenses() {

    showLoadingState();

    try {

        const response = await apiRequest("/expenses");

        const data = await response.json();

        allExpenses = Array.isArray(data) ? data : [];

        updateEverything();

    } catch (error) {

        console.error("Expenses error:", error);

        allExpenses = [];

        expensesList.innerHTML = `
            <div class="error-state">
                <i class="fa-solid fa-cloud-exclamation"></i>
                <strong>Unable to load expenses</strong>
                <p>Please check your connection and try again.</p>
            </div>
        `;

        showToast(
            "Could not connect to the expense service.",
            "error"
        );
    }
}


// =====================================================
// UPDATE EVERYTHING
// =====================================================

function updateEverything() {

    updateSummary();

    updateInsights();

    renderCharts();

    renderFilteredExpenses();
}


// =====================================================
// SUMMARY
// =====================================================

function updateSummary() {

    const total = allExpenses.reduce(
        (sum, expense) =>
            sum + (Number(expense.amount) || 0),
        0
    );

    const count = allExpenses.length;

    const highest =
        allExpenses.length > 0
            ? allExpenses.reduce((max, expense) =>
                Number(expense.amount) >
                Number(max.amount)
                    ? expense
                    : max
            )
            : null;

    const average =
        count > 0
            ? total / count
            : 0;

    document.getElementById(
        "totalSpending"
    ).textContent = formatCompactCurrency(total);

    document.getElementById(
        "totalCount"
    ).textContent = count.toLocaleString("en-IN");

    document.getElementById(
        "averageExpense"
    ).textContent = formatCompactCurrency(average);

    document.getElementById(
        "highestExpense"
    ).textContent =
        highest
            ? formatCompactCurrency(highest.amount)
            : "₹0";

    document.getElementById(
        "highestExpenseTitle"
    ).textContent =
        highest
            ? highest.title || "Untitled expense"
            : "No expenses yet";

    document.getElementById(
        "donutTotal"
    ).textContent = formatCompactCurrency(total);
}


// =====================================================
// INSIGHTS
// =====================================================

function calculateCategoryTotals() {

    const totals = {};

    allExpenses.forEach(expense => {

        const category =
            expense.category || "Other";

        totals[category] =
            (totals[category] || 0) +
            (Number(expense.amount) || 0);
    });

    return totals;
}


function updateInsights() {

    if (allExpenses.length === 0) {

        document.getElementById(
            "topCategory"
        ).textContent = "—";

        document.getElementById(
            "topCategoryText"
        ).textContent =
            "Add expenses to see your spending pattern.";

        document.getElementById(
            "dailyAverage"
        ).textContent = "₹0";

        document.getElementById(
            "transactionSize"
        ).textContent = "₹0";

        return;
    }


    const categoryTotals =
        calculateCategoryTotals();

    const categoryEntries =
        Object.entries(categoryTotals)
            .sort((a, b) => b[1] - a[1]);


    const [topCategory, topAmount] =
        categoryEntries[0];


    const total = allExpenses.reduce(
        (sum, expense) =>
            sum + Number(expense.amount || 0),
        0
    );


    const percentage =
        total > 0
            ? Math.round((topAmount / total) * 100)
            : 0;


    document.getElementById(
        "topCategory"
    ).textContent = topCategory;


    document.getElementById(
        "topCategoryText"
    ).textContent =
        `${percentage}% of your total spending • ${formatCompactCurrency(topAmount)}`;


    const activeDays =
        getActiveDays(allExpenses);

    const dailyAverage =
        total / activeDays;


    const averageTransaction =
        total / allExpenses.length;


    document.getElementById(
        "dailyAverage"
    ).textContent =
        formatCompactCurrency(dailyAverage);


    document.getElementById(
        "transactionSize"
    ).textContent =
        formatCompactCurrency(averageTransaction);
}


// =====================================================
// FILTER + SORT
// =====================================================

function getFilteredExpenses() {

    const search =
        searchInput.value
            .trim()
            .toLowerCase();

    const category =
        filterCategory.value;

    const sort =
        sortSelect.value;


    let filtered =
        allExpenses.filter(expense => {

            const title =
                String(expense.title || "")
                    .toLowerCase();

            const matchesSearch =
                !search ||
                title.includes(search);

            const matchesCategory =
                category === "All" ||
                expense.category === category;

            return (
                matchesSearch &&
                matchesCategory
            );
        });


    filtered.sort((a, b) => {

        switch (sort) {

            case "oldest":
                return getDateValue(a) -
                    getDateValue(b);

            case "highest":
                return (
                    Number(b.amount || 0) -
                    Number(a.amount || 0)
                );

            case "lowest":
                return (
                    Number(a.amount || 0) -
                    Number(b.amount || 0)
                );

            case "az":
                return String(a.title || "")
                    .localeCompare(
                        String(b.title || "")
                    );

            case "newest":
            default:
                return getDateValue(b) -
                    getDateValue(a);
        }
    });

    return filtered;
}


function renderFilteredExpenses() {

    const filtered =
        getFilteredExpenses();

    displayExpenses(filtered);
}


// =====================================================
// DISPLAY EXPENSES
// =====================================================

function displayExpenses(expenses) {

    if (!expenses || expenses.length === 0) {

        expensesList.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-receipt"></i>
                <strong>No expenses found</strong>
                <p>Try changing your search or filters.</p>
            </div>
        `;

        return;
    }


    expensesList.innerHTML =
        expenses
            .map(expense => {

                const config =
                    getCategoryConfig(
                        expense.category
                    );


                return `
                    <div class="expense">

                        <div class="expense-info">

                            <div class="expense-title-row">

                                <div
                                    class="expense-category-icon"
                                    style="color:${config.color}"
                                >
                                    <i
                                        class="fa-solid ${config.icon}"
                                    ></i>
                                </div>

                                <h3>
                                    ${escapeHtml(
                                        expense.title ||
                                        "Untitled expense"
                                    )}
                                </h3>

                            </div>

                            <span class="expense-category">
                                ${escapeHtml(
                                    expense.category ||
                                    "Other"
                                )}
                            </span>

                            <span class="expense-date">
                                ${formatDate(expense.date)}
                            </span>

                        </div>


                        <div class="expense-category">
                            ${escapeHtml(
                                expense.category ||
                                "Other"
                            )}
                        </div>


                        <div class="expense-date">
                            ${formatDate(expense.date)}
                        </div>


                        <div class="expense-amount">
                            ${formatCurrency(
                                expense.amount
                            )}
                        </div>


                        <button
                            class="delete-btn"
                            data-id="${escapeHtml(
                                expense.expenseId
                            )}"
                            title="Delete expense"
                        >
                            <i class="fa-solid fa-trash-can"></i>
                        </button>

                    </div>
                `;
            })
            .join("");


    document
        .querySelectorAll(".delete-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => openDeleteModal(
                    button.dataset.id
                )
            );

        });
}


function formatDate(dateString) {

    if (!dateString) {
        return "Unknown date";
    }

    const date =
        new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return dateString;
    }

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


// =====================================================
// CHART DATA
// =====================================================

function getChartTextColor() {

    return getComputedStyle(
        document.documentElement
    ).getPropertyValue("--text-secondary");
}


function getChartGridColor() {

    return getComputedStyle(
        document.documentElement
    ).getPropertyValue("--border");
}


function destroyChart(chart) {

    if (chart) {
        chart.destroy();
    }

    return null;
}


// =====================================================
// DOUGHNUT CHART
// =====================================================

function renderCategoryChart() {

    const ctx =
        document
            .getElementById("categoryChart")
            .getContext("2d");


    const totals =
        calculateCategoryTotals();


    const labels =
        Object.keys(totals);


    const values =
        Object.values(totals);


    const colors =
        labels.map(
            category =>
                getCategoryConfig(category).color
        );


    categoryChart =
        destroyChart(categoryChart);


    categoryChart =
        new Chart(ctx, {

            type: "doughnut",

            data: {
                labels,
                datasets: [
                    {
                        data: values,
                        backgroundColor: colors,
                        borderWidth: 0,
                        hoverOffset: 7
                    }
                ]
            },

            options: {

                responsive: true,
                maintainAspectRatio: false,

                cutout: "76%",

                plugins: {

                    legend: {
                        display: false
                    },

                    tooltip: {
                        callbacks: {
                            label(context) {

                                return ` ${formatCurrency(
                                    context.raw
                                )}`;
                            }
                        }
                    }
                }
            }
        });


    renderCategoryLegend(labels, values, colors);
}


function renderCategoryLegend(
    labels,
    values,
    colors
) {

    const legend =
        document.getElementById(
            "categoryLegend"
        );


    if (labels.length === 0) {

        legend.innerHTML =
            `<span class="legend-item">
                No spending data
            </span>`;

        return;
    }


    legend.innerHTML =
        labels.map(
            (label, index) => `
                <div class="legend-item">

                    <span
                        class="legend-dot"
                        style="background:${colors[index]}"
                    ></span>

                    <span>
                        ${escapeHtml(label)}
                    </span>

                </div>
            `
        ).join("");
}


// =====================================================
// LINE CHART
// =====================================================

function renderTimeChart() {

    const ctx =
        document
            .getElementById("timeChart")
            .getContext("2d");


    const dateTotals = {};


    allExpenses.forEach(expense => {

        if (!expense.date) return;

        dateTotals[expense.date] =
            (dateTotals[expense.date] || 0) +
            (Number(expense.amount) || 0);
    });


    const dates =
        Object.keys(dateTotals)
            .sort(
                (a, b) =>
                    new Date(a) -
                    new Date(b)
            );


    const labels =
        dates.map(formatShortDate);


    const values =
        dates.map(date => dateTotals[date]);


    timeChart =
        destroyChart(timeChart);


    timeChart =
        new Chart(ctx, {

            type: "line",

            data: {

                labels,

                datasets: [

                    {
                        label: "Spending",
                        data: values,

                        borderColor: "#8ebf24",
                        backgroundColor:
                            "rgba(142,191,36,.10)",

                        borderWidth: 2,

                        pointRadius:
                            dates.length > 30
                                ? 0
                                : 3,

                        pointHoverRadius: 5,

                        fill: true,

                        tension: .38
                    }

                ]
            },

            options: {

                responsive: true,
                maintainAspectRatio: false,

                interaction: {
                    intersect: false,
                    mode: "index"
                },

                scales: {

                    x: {
                        grid: {
                            display: false
                        },

                        ticks: {
                            color:
                                getChartTextColor(),
                            maxTicksLimit: 8,
                            font: {
                                size: 9
                            }
                        }
                    },

                    y: {

                        beginAtZero: true,

                        grid: {
                            color:
                                getChartGridColor()
                        },

                        ticks: {

                            color:
                                getChartTextColor(),

                            font: {
                                size: 9
                            },

                            callback(value) {
                                return formatCompactCurrency(
                                    value
                                );
                            }
                        }
                    }
                },

                plugins: {

                    legend: {
                        display: false
                    },

                    tooltip: {

                        callbacks: {

                            label(context) {

                                return ` Spending: ${formatCurrency(
                                    context.raw
                                )}`;
                            }
                        }
                    }
                }
            }
        });
}


function formatShortDate(date) {

    const parsed =
        new Date(date);

    if (Number.isNaN(parsed.getTime())) {
        return date;
    }

    return parsed.toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "short"
        }
    );
}


// =====================================================
// BAR CHART
// =====================================================

function renderBarChart() {

    const ctx =
        document
            .getElementById("barChart")
            .getContext("2d");


    const totals =
        calculateCategoryTotals();


    const sorted =
        Object.entries(totals)
            .sort((a, b) => b[1] - a[1]);


    const labels =
        sorted.map(item => item[0]);


    const values =
        sorted.map(item => item[1]);


    const colors =
        labels.map(
            category =>
                getCategoryConfig(category).color
        );


    barChart =
        destroyChart(barChart);


    barChart =
        new Chart(ctx, {

            type: "bar",

            data: {

                labels,

                datasets: [

                    {
                        data: values,
                        backgroundColor: colors,
                        borderRadius: 7,
                        borderSkipped: false,
                        barThickness: 30
                    }

                ]
            },

            options: {

                responsive: true,
                maintainAspectRatio: false,

                plugins: {

                    legend: {
                        display: false
                    },

                    tooltip: {

                        callbacks: {

                            label(context) {

                                return ` ${formatCurrency(
                                    context.raw
                                )}`;
                            }
                        }
                    }
                },

                scales: {

                    x: {

                        grid: {
                            display: false
                        },

                        ticks: {
                            color:
                                getChartTextColor(),
                            font: {
                                size: 9
                            }
                        }
                    },

                    y: {

                        beginAtZero: true,

                        grid: {
                            color:
                                getChartGridColor()
                        },

                        ticks: {

                            color:
                                getChartTextColor(),

                            font: {
                                size: 9
                            },

                            callback(value) {
                                return formatCompactCurrency(
                                    value
                                );
                            }
                        }
                    }
                }
            }
        });
}


// =====================================================
// RENDER ALL CHARTS
// =====================================================

function renderCharts() {

    renderCategoryChart();

    renderTimeChart();

    renderBarChart();
}


// =====================================================
// ADD EXPENSE
// =====================================================

expenseForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const submitButton =
            document.getElementById(
                "submitExpenseBtn"
            );


        const expense = {

            title:
                document
                    .getElementById("title")
                    .value
                    .trim(),

            amount:
                Number(
                    document
                        .getElementById("amount")
                        .value
                ),

            category:
                document
                    .getElementById("category")
                    .value,

            date:
                document
                    .getElementById("date")
                    .value
        };


        if (
            !expense.title ||
            !expense.amount ||
            !expense.category ||
            !expense.date
        ) {

            showToast(
                "Please complete all fields.",
                "error"
            );

            return;
        }


        submitButton.disabled = true;

        submitButton.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            Saving...
        `;


        try {

            await apiRequest(
                "/expenses",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(expense)
                }
            );


            closeExpenseModal();

            expenseForm.reset();

            showToast(
                "Your expense has been recorded.",
                "success",
                "Expense added"
            );


            await loadExpenses();


        } catch (error) {

            console.error(
                "Add expense error:",
                error
            );

            showToast(
                error.message ||
                "Failed to add expense.",
                "error"
            );

        } finally {

            submitButton.disabled = false;

            submitButton.innerHTML = `
                <i class="fa-solid fa-plus"></i>
                Add expense
            `;
        }
    }
);


// =====================================================
// DELETE
// =====================================================

function openDeleteModal(expenseId) {

    pendingDeleteId = expenseId;

    deleteModal.classList.add("active");

    document.body.style.overflow = "hidden";
}


function closeDeleteModal() {

    deleteModal.classList.remove("active");

    pendingDeleteId = null;

    if (!expenseModal.classList.contains("active")) {
        document.body.style.overflow = "";
    }
}


cancelDeleteBtn.addEventListener(
    "click",
    closeDeleteModal
);


confirmDeleteBtn.addEventListener(
    "click",
    async function () {

        if (!pendingDeleteId) {
            return;
        }


        const id = pendingDeleteId;


        confirmDeleteBtn.disabled = true;

        confirmDeleteBtn.textContent =
            "Deleting...";


        try {

            await apiRequest(
                `/expenses/${encodeURIComponent(id)}`,
                {
                    method: "DELETE"
                }
            );


            closeDeleteModal();

            showToast(
                "The transaction was removed.",
                "success",
                "Expense deleted"
            );


            await loadExpenses();


        } catch (error) {

            console.error(
                "Delete error:",
                error
            );

            showToast(
                error.message ||
                "Failed to delete expense.",
                "error"
            );

        } finally {

            confirmDeleteBtn.disabled = false;

            confirmDeleteBtn.textContent =
                "Delete expense";
        }
    }
);


// =====================================================
// MODAL
// =====================================================

function openExpenseModal() {

    expenseModal.classList.add("active");

    document.body.style.overflow = "hidden";


    const dateInput =
        document.getElementById("date");


    if (!dateInput.value) {

        const today =
            new Date();

        const localDate =
            new Date(
                today.getTime() -
                today.getTimezoneOffset() *
                60000
            )
                .toISOString()
                .split("T")[0];


        dateInput.value =
            localDate;
    }


    setTimeout(() => {

        document
            .getElementById("amount")
            .focus();

    }, 200);
}


function closeExpenseModal() {

    expenseModal.classList.remove("active");

    if (!deleteModal.classList.contains("active")) {
        document.body.style.overflow = "";
    }
}


openModalBtn.addEventListener(
    "click",
    openExpenseModal
);

closeModalBtn.addEventListener(
    "click",
    closeExpenseModal
);

cancelModalBtn.addEventListener(
    "click",
    closeExpenseModal
);


// =====================================================
// CLOSE MODALS ON BACKDROP / ESC
// =====================================================

[expenseModal, deleteModal]
    .forEach(modal => {

        modal.addEventListener(
            "click",
            event => {

                if (
                    event.target === modal
                ) {

                    if (
                        modal ===
                        expenseModal
                    ) {
                        closeExpenseModal();
                    } else {
                        closeDeleteModal();
                    }
                }
            }
        );
    });


document.addEventListener(
    "keydown",
    event => {

        if (event.key !== "Escape") {
            return;
        }

        if (
            expenseModal.classList.contains(
                "active"
            )
        ) {
            closeExpenseModal();
        }

        if (
            deleteModal.classList.contains(
                "active"
            )
        ) {
            closeDeleteModal();
        }
    }
);


// =====================================================
// SEARCH / FILTER / SORT
// =====================================================

searchInput.addEventListener(
    "input",
    renderFilteredExpenses
);

filterCategory.addEventListener(
    "change",
    renderFilteredExpenses
);

sortSelect.addEventListener(
    "change",
    renderFilteredExpenses
);


// =====================================================
// EXPORT CSV
// =====================================================

exportBtn.addEventListener(
    "click",
    exportCSV
);


function exportCSV() {

    if (allExpenses.length === 0) {

        showToast(
            "There are no expenses to export.",
            "error"
        );

        return;
    }


    const headers = [
        "Expense ID",
        "Title",
        "Amount",
        "Category",
        "Date"
    ];


    const rows =
        allExpenses.map(expense => [

            expense.expenseId || "",

            expense.title || "",

            expense.amount || 0,

            expense.category || "",

            expense.date || ""
        ]);


    const csv = [

        headers,

        ...rows

    ]
        .map(row =>
            row
                .map(value =>
                    `"${String(value)
                        .replace(/"/g, '""')}"`
                )
                .join(",")
        )
        .join("\n");


    const blob =
        new Blob(
            [csv],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href = url;

    link.download =
        `expenses-${new Date()
            .toISOString()
            .slice(0, 10)}.csv`;


    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);


    showToast(
        "Your transaction history is ready.",
        "success",
        "CSV exported"
    );
}


// =====================================================
// DARK / LIGHT MODE
// =====================================================

function applyTheme(theme) {

    document.documentElement
        .setAttribute(
            "data-theme",
            theme
        );


    const icon =
        theme === "dark"
            ? "fa-sun"
            : "fa-moon";


    const label =
        theme === "dark"
            ? "Light mode"
            : "Dark mode";


    themeToggle.innerHTML = `
        <i class="fa-solid ${icon}"></i>
        <span>${label}</span>
    `;


    localStorage.setItem(
        "expense-theme",
        theme
    );


    if (allExpenses.length > 0) {
        setTimeout(
            renderCharts,
            50
        );
    }
}


function initializeTheme() {

    const saved =
        localStorage.getItem(
            "expense-theme"
        );


    if (saved) {

        applyTheme(saved);

        return;
    }


    const prefersDark =
        window.matchMedia &&
        window.matchMedia(
            "(prefers-color-scheme: dark)"
        ).matches;


    applyTheme(
        prefersDark
            ? "dark"
            : "light"
    );
}


themeToggle.addEventListener(
    "click",
    () => {

        const current =
            document.documentElement
                .getAttribute(
                    "data-theme"
                );


        applyTheme(
            current === "dark"
                ? "light"
                : "dark"
        );
    }
);


// =====================================================
// REFRESH
// =====================================================

refreshBtn.addEventListener(
    "click",
    async () => {

        refreshBtn.disabled = true;

        refreshBtn
            .querySelector("i")
            .classList.add(
                "fa-spin"
            );


        try {

            await loadExpenses();

            showToast(
                "Dashboard data is up to date.",
                "success",
                "Refreshed"
            );

        } finally {

            refreshBtn.disabled = false;

            refreshBtn
                .querySelector("i")
                .classList.remove(
                    "fa-spin"
                );
        }
    }
);


// =====================================================
// MOBILE SIDEBAR
// =====================================================

mobileMenu.addEventListener(
    "click",
    () => {

        sidebar.classList.toggle(
            "open"
        );
    }
);


document
    .querySelectorAll(".nav-item")
    .forEach(link => {

        link.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(
                        ".nav-item"
                    )
                    .forEach(item =>
                        item.classList.remove(
                            "active"
                        )
                    );


                link.classList.add(
                    "active"
                );


                sidebar.classList.remove(
                    "open"
                );
            }
        );
    });


// =====================================================
// INITIALIZATION
// =====================================================

initializeTheme();

loadExpenses();

