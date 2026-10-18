
const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function ask(question) {
    return new Promise(resolve => {
        rl.question(question, answer => resolve(answer.trim()));
    });
}

async function main() {
    console.log("\n=== Employee Travel Expense Reimbursement System ===\n");

    const employeeId = await ask("Enter Employee ID: ");
    const travelTypeInput = await ask("Travel Type (Local / Outstation): ");
    const distanceInput = await ask("Enter Distance Travelled (km): ");
    const claimedAmountInput = await ask("Enter Claimed Amount (₹): ");
    const documentsInput = await ask(
        "Supporting Documents Submitted? (Yes / No): "
    );

    const travelType = travelTypeInput.toLowerCase();
    const distance = Number(distanceInput);
    const claimedAmount = Number(claimedAmountInput);
    const documents = documentsInput.toLowerCase();

    // Input validation
    if (!employeeId) {
        console.log("\nError: Employee ID is required.");
        rl.close();
        return;
    }

    if (!["local", "outstation"].includes(travelType)) {
        console.log("\nError: Invalid travel type.");
        rl.close();
        return;
    }

    if (
        distanceInput === "" ||
        !Number.isFinite(distance) ||
        distance <= 0
    ) {
        console.log("\nError: Distance must be greater than zero.");
        rl.close();
        return;
    }

    if (
        claimedAmountInput === "" ||
        !Number.isFinite(claimedAmount) ||
        claimedAmount <= 0
    ) {
        console.log("\nError: Claimed amount must be greater than zero.");
        rl.close();
        return;
    }

    if (!["yes", "no"].includes(documents)) {
        console.log("\nError: Enter Yes or No for supporting documents.");
        rl.close();
        return;
    }

    // Reimbursement calculation
    const rate = travelType === "local" ? 8 : 12;
    const calculatedAmount = distance * rate;
    const maximumReimbursement = 10000;

    let eligibleAmount = 0;
    let claimStatus = "";
    let remarks = "";

    if (documents === "no") {
        claimStatus = "Rejected";
        remarks = "Supporting documents have not been submitted.";
    } else {
        eligibleAmount = Math.min(
            calculatedAmount,
            claimedAmount,
            maximumReimbursement
        );

        if (eligibleAmount === claimedAmount) {
            claimStatus = "Approved";
            remarks = "Claim approved as per reimbursement policy.";
        } else if (eligibleAmount > 0) {
            claimStatus = "Partially Approved";

            if (calculatedAmount > maximumReimbursement) {
                remarks = "Reimbursement limited to maximum of ₹10,000.";
            } else if (claimedAmount > calculatedAmount) {
                remarks = "Claim exceeds the eligible rate-based amount.";
            } else {
                remarks = "Claim exceeds the maximum reimbursement limit.";
            }
        } else {
            claimStatus = "Rejected";
            remarks = "No reimbursement amount is eligible.";
        }
    }

    const money = amount =>
        "₹" + amount.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

    // Display the claim summary
    console.log("\n========== TRAVEL CLAIM SUMMARY ==========");
    console.log("Employee ID:       " + employeeId);
    console.log("Travel Type:       " + travelTypeInput);
    console.log("Distance:          " + distance + " km");
    console.log("Claimed Amount:    " + money(claimedAmount));
    console.log("Eligible Amount:   " + money(eligibleAmount));
    console.log("Claim Status:      " + claimStatus);
    console.log("Remarks:           " + remarks);
    console.log("==========================================");

    rl.close();
}

main().catch(error => {
    console.error("Unexpected error:", error.message);
    rl.close();
});
