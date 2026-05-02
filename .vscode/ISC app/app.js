/**
 * BRAGG AUDIT SYSTEMS - Core Logic Engine ⚖️
 * Designed for Financial Integrity & Data Transparency
 */

let totalDeductions = 0;
let ledger = [];
let library = [];
let config = {};

// 1. Initialize System & Load Expert Metadata 📡
window.onload = async () => {
    try {
        const response = await fetch('questions.json');
        const data = await response.json();
        
        library = data.expenseLibrary;
        config = data.businessRules;
        
        populateDropdown();
        addLog("SYSTEM: Logic Engine v1.0.2 loaded successfully.", "system-msg");
        addLog(`SYSTEM: Business Rules initialized (SE Tax: ${config.selfEmploymentTax * 100}%).`, "system-msg");
    } catch (error) {
        addLog("CRITICAL ERROR: Failed to load logic metadata.", "log-error");
    }
};

// 2. Populate the UI Dropdown 📝
function populateDropdown() {
    const select = document.getElementById('itemSelect');
    library.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.innerText = item.name;
        select.appendChild(option);
    });
}

// 3. Process Financial Events ⚡
function processEvent() {
    const select = document.getElementById('itemSelect');
    const incomeInput = document.getElementById('incomeInput');
    const feedbackBox = document.getElementById('feedbackBox');
    const terminal = document.querySelector('.audit-terminal');

    if (!select.value) {
        addLog("WARNING: User attempted to process null transaction.", "log-error");
        return;
    }

    const item = library.find(i => i.id === select.value);
    const amount = 1000; // Standardized amount for simulation

    // Integrity Check & Logging 📑
    if (item.isDeductible) {
        totalDeductions += amount;
        addLog(`EVENT: ${item.name} | CAT: ${item.category} | STATUS: Approved ✅`, "log-success");
        
        // Success Feedback 🎊
        feedbackBox.innerHTML = `<strong>${item.explanation}</strong><br><small>💡 ${item.knowledgeTip}</small>`;
        feedbackBox.style.color = "#10b981";
        
        // Sparkle Effect!
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.7 },
            colors: ['#8b5cf6', '#06b6d4']
        });
    } else {
        addLog(`RISK ALERT: ${item.name} | CAT: ${item.category} | STATUS: Rejected/Non-Deductible 🚨`, "log-error");
        
        // Error Feedback 🛑
        feedbackBox.innerHTML = `<strong>${item.explanation}</strong><br><small>💡 ${item.knowledgeTip}</small>`;
        feedbackBox.style.color = "#ef4444";
        
        // UI Shake for Risk Awareness
        terminal.classList.add('shake');
        setTimeout(() => terminal.classList.remove('shake'), 400);
    }

    // Add to internal ledger for CSV export
    ledger.push({
        timestamp: new Date().toLocaleString(),
        item: item.name,
        category: item.category,
        amount: amount,
        impact: item.isDeductible ? "Deduction" : "Personal",
        risk: item.riskLevel
    });

    recalculate();
}

// 4. Calculate Tax Shield & Liability 🛡️
function recalculate() {
    const income = parseFloat(document.getElementById('incomeInput').value) || 0;
    
    // Tax Logic
    const taxableIncome = Math.max(0, income - totalDeductions);
    const seTax = taxableIncome * config.selfEmploymentTax;
    const fedTax = taxableIncome * config.incomeTaxBracket;
    const totalTax = seTax + fedTax;

    // Update UI Stats
    document.getElementById('deductionTotal').innerText = `$${totalDeductions.toLocaleString()}`;
    document.getElementById('taxOwed').innerText = `$${totalTax.toLocaleString()}`;
    
    addLog(`CALC: Net Taxable Income updated to $${taxableIncome.toLocaleString()}`, "system-msg");
}

// 5. System Logging Function 📟
function addLog(message, className) {
    const terminal = document.getElementById('logTerminal');
    const timestamp = new Date().toLocaleTimeString();
    const entry = document.createElement('div');
    
    entry.className = `log-entry ${className}`;
    entry.innerText = `[${timestamp}] ${message}`;
    
    terminal.appendChild(entry);
    terminal.scrollTop = terminal.scrollHeight; // Auto-scroll
}

// 6. Professional Data Portability (CSV Export) 📥
function exportCSV() {
    if (ledger.length === 0) {
        addLog("ERROR: Cannot export empty ledger.", "log-error");
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Timestamp,Item,Category,Amount,Impact,Risk\n";

    ledger.forEach(row => {
        csvContent += `${row.timestamp},${row.item},${row.category},${row.amount},${row.impact},${row.risk}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Bragg_Audit_Trail_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    
    link.click();
    document.body.removeChild(link);
    
    addLog("SYSTEM: Immutable ledger exported to CSV successfully.", "log-success");
}