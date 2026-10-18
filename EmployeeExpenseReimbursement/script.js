const expenseForm = document.getElementById("expenseForm");
const result = document.getElementById("result");

const reimbursementLimits = {
    Travel: 10000,
    Accommodation: 8000,
    Food: 3000,
    Other: 2000
};

expenseForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const employeeId =
        document.getElementById("employeeId").value.trim();

    const category =
        document.getElementById("category").value;

    const amountInput =
        document.getElementById("amount").value;

    const daysInput =
        document.getElementById("days").value;

    const documents =
        document.getElementById("documents").value;

    const amount = Number(amountInput);
    const days = Number(daysInput);

    // Input validation
    if (!employeeId) {
        showError("Please enter the Employee ID.");
        return;
    }

    if (!(category in reimbursementLimits)) {
        showError("Please select a valid expense category.");
        return;
    }

    if (
        amountInput === "" ||
        !Number.isFinite(amount) ||
        amount <= 0
    ) {
        showError("Expense amount must be greater than zero.");
        return;
    }

    if (
        daysInput === "" ||
        !Number.isInteger(days) ||
        days <= 0
    ) {
        showError("Number of days must be a positive whole number.");
        return;
    }

    if (!["yes", "no"].includes(documents)) {
        showError("Please specify whether documents were submitted.");
        return;
    }

    const limit = reimbursementLimits[category];

    let eligibleAmount = 0;
    let status = "";
    let remarks = "";

    // Evaluate the claim
    if (documents === "no") {
        status = "Rejected";
        remarks = "Supporting documentation was not submitted.";
    } else {
        eligibleAmount = Math.min(amount, limit);

        if (amount <= limit) {
            status = "Approved";
            remarks = "Expense is within the category reimbursement limit.";
        } else {
            status = "Partially Approved";
            remarks = "Claim exceeds the category limit of " +
                formatMoney(limit) + ".";
        }
    }

    // Display the reimbursement summary
    result.innerHTML = `
        <div class="summary">
            <h2>Reimbursement Summary</h2>
            <p><strong>Employee ID:</strong> ${escapeHTML(employeeId)}</p>
            <p><strong>Expense Category:</strong> ${category}</p>
            <p><strong>Number of Days:</strong> ${days}</p>
            <p><strong>Submitted Amount:</strong> ${formatMoney(amount)}</p>
            <p><strong>Category Limit:</strong> ${formatMoney(limit)}</p>
            <p><strong>Eligible Amount:</strong> ${formatMoney(eligibleAmount)}</p>
            <p><strong>Reimbursement Status:</strong>
                <span class="status">${status}</span>
            </p>
            <p><strong>Remarks:</strong> ${remarks}</p>
        </div>
    `;
});

function formatMoney(amount) {
    return "₹" + amount.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function showError(message) {
    result.innerHTML = `<p class="error">${message}</p>`;
}

function escapeHTML(value) {
    return value.replace(/[&<>"']/g, function (character) {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };
        return entities[character];
    });
}
