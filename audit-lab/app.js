/**
 * BRAGG AUDIT SYSTEMS - Core Logic Engine ⚖️
 * Designed for Financial Integrity & Data Transparency
 */

let totalDeductions = 0;
let ledger = [];
let library = [];
let config = {};

// 1. Boot up System
window.onload = async () => {
    try {
        const response = await fetch('questions.json');
        const data = await response.json();
        library = data.expenseLibrary;
        config = data.businessRules;
        populateDropdown();
        addLog("SYSTEM: Logic Engine loaded successfully.", "system-msg");
    } catch (error) {
        addLog("CRITICAL ERROR: questions.json not found.", "log-error");
    }
};

// 2. Fill the Dropdown
function populateDropdown() {
    const select = document.getElementById('itemSelect');
    library.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.innerText = item.name;
        select.appendChild(option);
    });
}

// 3. Logic Engine
function processEvent() {
    const select = document.getElementById('itemSelect');
    const feedbackBox = document.getElementById('feedbackBox');

    if (!select.value) return;

    const item = library.find(i => i.id === select.value);
    const amount = 1000; 

    if (item.isDeductible) {
        totalDeductions += amount;
        addLog(`EVENT: ${item.name} | STATUS: Approved ✅`, "log-success");
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.7 } });
    } else {
        addLog(`RISK ALERT: ${item.name} | STATUS: Rejected 🚨`, "log-error");
    }

    ledger.push({
        timestamp: new Date().toLocaleString(),
        item: item.name,
        amount: amount,
        impact: item.isDeductible ? "Deduction" : "Personal"
    });

    feedbackBox.innerHTML = `<strong>${item.explanation}</strong><br><small>💡 ${item.knowledgeTip}</small>`;
    recalculate();
}

function recalculate() {
    const income = parseFloat(document.getElementById('incomeInput').value) || 0;
    const taxableIncome = Math.max(0, income - totalDeductions);
    const totalTax = taxableIncome * (config.selfEmploymentTax + config.incomeTaxBracket);

    document.getElementById('deductionTotal').innerText = `$${totalDeductions.toLocaleString()}`;
    document.getElementById('taxOwed').innerText = `$${totalTax.toLocaleString()}`;
}

function addLog(message, className) {
    const terminal = document.getElementById('logTerminal');
    const entry = document.createElement('div');
    entry.className = `log-entry ${className}`;
    entry.innerText = `[${new Date().toLocaleTimeString()}] ${message}`;
    terminal.appendChild(entry);
    terminal.scrollTop = terminal.scrollHeight;
}

function exportCSV() {
    let csv = "Timestamp,Item,Amount,Impact\n";
    ledger.forEach(r => csv += `${r.timestamp},${r.item},${r.amount},${r.impact}\n`);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "Audit_Ledger.csv";
    a.click();
}