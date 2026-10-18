
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
    console.log("\n=== Hospital Diagnostic Test Billing System ===\n");

    const patientId = await ask("Enter Patient ID: ");
    const ageInput = await ask("Enter Patient Age: ");
    const categoryInput = await ask(
        "Test Category (Blood Test / Diabetes Panel / Liver Function / Full Body Package): "
    );
    const urgencyInput = await ask("Urgency (Normal / Urgent / Emergency): ");
    const numberInput = await ask("Enter Number of Tests: ");
    const membershipInput = await ask("Membership (Regular / Silver / Gold): ");
    const homeInput = await ask("Home Sample Collection? (Yes / No): ");
    const paymentInput = await ask("Payment Mode (Cash / UPI / Card): ");

    const age = Number(ageInput);
    const numberOfTests = Number(numberInput);

    const categories = {
        "blood test": 500,
        "diabetes panel": 800,
        "liver function": 1200,
        "full body package": 2500
    };

    const memberships = {
        regular: 0,
        silver: 5,
        gold: 10
    };

    const urgencyCharges = {
        normal: 0,
        urgent: 300,
        emergency: 500
    };

    const category = categoryInput.toLowerCase();
    const urgency = urgencyInput.toLowerCase();
    const membership = membershipInput.toLowerCase();
    const home = homeInput.toLowerCase();
    const payment = paymentInput.toLowerCase();

    // Validation
    if (!patientId) {
        console.log("\nError: Patient ID is required.");
        rl.close();
        return;
    }

    if (ageInput === "" || !Number.isInteger(age) || age < 0) {
        console.log("\nError: Enter a valid patient age.");
        rl.close();
        return;
    }

    if (!Number.isInteger(numberOfTests) || numberOfTests <= 0) {
        console.log("\nError: Number of tests must be positive.");
        rl.close();
        return;
    }

    if (!(category in categories)) {
        console.log("\nError: Invalid test category.");
        rl.close();
        return;
    }

    if (!(urgency in urgencyCharges)) {
        console.log("\nError: Invalid urgency selected.");
        rl.close();
        return;
    }

    if (!(membership in memberships)) {
        console.log("\nError: Invalid membership status.");
        rl.close();
        return;
    }

    if (!["yes", "no"].includes(home)) {
        console.log("\nError: Enter Yes or No for home collection.");
        rl.close();
        return;
    }

    if (!["cash", "upi", "card"].includes(payment)) {
        console.log("\nError: Unsupported payment mode.");
        rl.close();
        return;
    }

    // Billing calculations
    const baseAmount = categories[category] * numberOfTests;

    const membershipDiscount =
        baseAmount * memberships[membership] / 100;

    const seniorDiscount =
        age >= 60 ? baseAmount * 5 / 100 : 0;

    const totalDiscount = Math.min(
        membershipDiscount + seniorDiscount,
        baseAmount * 15 / 100
    );

    // Allocate the discount to the membership and senior categories
    const actualMembershipDiscount = Math.min(
        membershipDiscount,
        totalDiscount
    );

    const actualSeniorDiscount =
        totalDiscount - actualMembershipDiscount;

    let serviceCharge = urgencyCharges[urgency];

    if (home === "yes" && membership !== "gold") {
        serviceCharge += 200;
    }

    const finalAmount =
        baseAmount - totalDiscount + serviceCharge;

    // Priority classification
    let priority;

    if (urgency === "emergency") {
        priority = "Emergency Priority";
    } else if (urgency === "urgent" && age >= 60) {
        priority = "High Priority";
    } else {
        priority = "Standard Priority";
    }

    // Payment is not actually processed by this program
    const paymentStatus = "Pending";

    const money = amount =>
        "₹" + amount.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

    // Billing summary
    console.log("\n========== BILLING SUMMARY ==========");
    console.log("Patient ID:               " + patientId);
    console.log("Patient Age:              " + age);
    console.log("Test Category:            " + categoryInput);
    console.log("Number of Tests:          " + numberOfTests);
    console.log("-------------------------------------");
    console.log("Base Amount:              " + money(baseAmount));
    console.log("Membership Discount:      " + money(actualMembershipDiscount));
    console.log("Senior Citizen Discount:  " + money(actualSeniorDiscount));
    console.log("Service Charge:           " + money(serviceCharge));
    console.log("-------------------------------------");
    console.log("Final Amount:             " + money(finalAmount));
    console.log("Priority:                 " + priority);
    console.log("Payment Mode:             " + paymentInput);
    console.log("Payment Status:           " + paymentStatus);

    let remarks = [];

    if (home === "yes" && membership === "gold") {
        remarks.push("Free home collection for Gold member");
    } else if (home === "yes") {
        remarks.push("Home collection charge applied");
    }

    if (totalDiscount > 0) {
        remarks.push("Discount applied within 15% limit");
    }

    if (urgency === "urgent" || urgency === "emergency") {
        remarks.push("Urgency service charge applied");
    }

    if (remarks.length === 0) {
        remarks.push("Standard billing");
    }

    console.log("Remarks:                  " + remarks.join("; "));
    console.log("=====================================");

    rl.close();
}

main().catch(error => {
    console.error("An unexpected error occurred:", error.message);
    rl.close();
});
