
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
    console.log("\n=== Online Certification Exam Eligibility & Fee Assessment ===\n");

    const candidateId = await ask("Enter Candidate ID: ");
    const levelInput = await ask(
        "Certification Level (Foundation / Associate / Professional): "
    );
    const previousStatusInput = await ask(
        "Previous Examination Status (Never Attempted / Failed / Passed): "
    );
    const attemptsInput = await ask("Number of Previous Attempts: ");
    const categoryInput = await ask(
        "Candidate Category (Regular / Student / Corporate): "
    );
    const trainingInput = await ask("Training Completion Percentage: ");
    const modeInput = await ask("Examination Mode (Online / Test-Center): ");
    const identityInput = await ask(
        "Identity Verification Completed? (Yes / No): "
    );

    const level = levelInput.toLowerCase();
    const previousStatus = previousStatusInput.toLowerCase();
    const attempts = Number(attemptsInput);
    const category = categoryInput.toLowerCase();
    const training = Number(trainingInput);
    const mode = modeInput.toLowerCase();
    const identity = identityInput.toLowerCase();

    const examFees = {
        foundation: 1500,
        associate: 2500,
        professional: 4000
    };

    const minimumTraining = {
        foundation: 70,
        associate: 80,
        professional: 90
    };

    const categoryDiscounts = {
        regular: 0,
        student: 15,
        corporate: 10
    };

    // Input validation
    if (!candidateId) {
        console.log("\nError: Candidate ID is required.");
        rl.close();
        return;
    }

    if (!(level in examFees)) {
        console.log("\nError: Invalid certification level.");
        rl.close();
        return;
    }

    if (!["never attempted", "failed", "passed"].includes(previousStatus)) {
        console.log("\nError: Invalid previous examination status.");
        rl.close();
        return;
    }

    if (!Number.isInteger(attempts) || attempts < 0) {
        console.log("\nError: Attempts must be a non-negative integer.");
        rl.close();
        return;
    }

    if (
        (previousStatus === "never attempted" && attempts !== 0) ||
        (previousStatus === "failed" && attempts === 0) ||
        (previousStatus === "passed" && attempts === 0)
    ) {
        console.log("\nError: Previous status and attempt count do not match.");
        rl.close();
        return;
    }

    if (!(category in categoryDiscounts)) {
        console.log("\nError: Invalid candidate category.");
        rl.close();
        return;
    }

    if (
        trainingInput === "" ||
        !Number.isFinite(training) ||
        training < 0 ||
        training > 100
    ) {
        console.log("\nError: Training percentage must be between 0 and 100.");
        rl.close();
        return;
    }

    if (!["online", "test-center"].includes(mode)) {
        console.log("\nError: Invalid examination mode.");
        rl.close();
        return;
    }

    if (!["yes", "no"].includes(identity)) {
        console.log("\nError: Enter Yes or No for identity verification.");
        rl.close();
        return;
    }

    const baseFee = examFees[level];
    let retakeAdjustment = 0;
    let discount = 0;
    let centerFee = mode === "test-center" ? 500 : 0;
    let finalFee = 0;
    let eligibilityStatus = "";
    let remarks = "";

    // Registration blocking has highest priority
    if (identity === "no") {
        eligibilityStatus = "Registration Blocked";
        remarks = "Identity verification is incomplete.";
    } else if (previousStatus === "passed") {
        eligibilityStatus = "Registration Blocked";
        remarks = "Candidate has already passed this certification.";
    } else if (training < minimumTraining[level]) {
        eligibilityStatus = "Not Eligible";
        remarks = "Training completion is below the required level.";
    } else {
        // Calculate retake adjustment
        if (previousStatus === "failed") {
            if (attempts === 2) {
                retakeAdjustment = baseFee * 0.10;
            } else if (attempts >= 3) {
                retakeAdjustment = baseFee * 0.20;
            }
        }

        const feeAfterRetake = baseFee + retakeAdjustment;

        // Apply category discount after retake adjustment
        discount = feeAfterRetake * categoryDiscounts[category] / 100;

        finalFee = feeAfterRetake - discount + centerFee;

        if (retakeAdjustment > 0 || centerFee > 0) {
            eligibilityStatus = "Eligible with Additional Fee";
            remarks = "Eligible; retake and/or test-center charges apply.";
        } else {
            eligibilityStatus = "Eligible for Scheduling";
            remarks = "Meets eligibility requirements.";
        }
    }

    const money = amount =>
        "₹" + amount.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

    console.log("\n========== EXAMINATION ASSESSMENT ==========");
    console.log("Candidate ID:             " + candidateId);
    console.log("Certification Level:      " + levelInput);
    console.log("Training Completion:      " + training + "%");
    console.log("Previous Attempts:        " + attempts);
    console.log("--------------------------------------------");
    console.log("Base Examination Fee:     " + money(baseFee));
    console.log("Retake Adjustment:        " + money(retakeAdjustment));
    console.log("Discount:                 " + money(discount));
    console.log("Center Fee:               " + money(centerFee));
    console.log("--------------------------------------------");
    console.log("Final Examination Fee:    " + money(finalFee));
    console.log("Eligibility Status:       " + eligibilityStatus);
    console.log("Remarks:                  " + remarks);
    console.log("============================================");

    rl.close();
}

main().catch(error => {
    console.error("Unexpected error:", error.message);
    rl.close();
});
