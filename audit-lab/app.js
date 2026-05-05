/**
 * BRAGG AUDIT SYSTEMS - Core Logic Engine ⚖️
 * Designed for Financial Integrity & Data Transparency
 */

let totalDeductions = 0;
let ledger = [];
let library = [];
let config = { selfEmploymentTax: 0.153, incomeTaxBracket: 0.22 }; // Fallback rates

// 1. Boot up System
window.onload = async () => {
    try {
        const response = await fetch('questions.json');
        const data = await response.json();
        library = data.expenseLibrary || [];
        if (data.businessRules) config = data.businessRules;
        populateDropdown();
        addLog("SYSTEM: Logic Engine loaded successfully.", "system-msg");
    } catch (error) {
        addLog("CRITICAL ERROR: questions.json not found. Operating in fallback mode.", "log-error");
        populateDropdown();
    }
};

// 2. Fill the Dropdown (Including the new "Other" option)
function populateDropdown() {
    const select = document.getElementById('itemSelect');
    
    // Clear the dropdown first so we don't get duplicates
    select.innerHTML = '<option value="" disabled selected>Choose an expense...</option>';
    
    // Add items from your JSON file
    library.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.innerText = item.name + (item.amount ? ` ($${item.amount})` : '');
        select.appendChild(option);
    });

    // Add the Custom "Other" Option at the bottom
    const otherOption = document.createElement('option');
    otherOption.value = 'other';
    otherOption.innerText = '➕ Other (Type your own)...';
    otherOption.style.fontWeight = 'bold';
    otherOption.style.color = '#ec4899';
    select.appendChild(otherOption);
}

// 3. Show/Hide custom inputs when "Other" is selected
window.toggleCustomInput = function() {
    const select = document.getElementById('itemSelect');
    const customContainer = document.getElementById('customInputContainer'); // We toggle the whole container now!
    
    if (select.value === 'other') {
        customContainer.style.display = 'flex';
    } else {
        customContainer.style.display = 'none';
    }
}

// 4. Smart AI Categorizer for Custom Text
function smartCategorize(desc) {
    desc = desc.toLowerCase();
    
    if (desc.includes('meal') || desc.includes('food') || desc.includes('lunch') || desc.includes('dinner') || desc.includes('coffee')) {
        return { category: 'Meals & Entertainment', deductibility: 0.5 }; // 50% IRS rule
    } else if (desc.includes('flight') || desc.includes('uber') || desc.includes('hotel') || desc.includes('travel') || desc.includes('ticket')) {
        return { category: 'Travel', deductibility: 1.0 }; // 100% deductible
    } else if (desc.includes('laptop') || desc.includes('computer') || desc.includes('equipment')) {
        return { category: 'Equipment', deductibility: 1.0 }; 
    } else if (desc.includes('software') || desc.includes('app') || desc.includes('subscription')) {
        return { category: 'Software', deductibility: 1.0 };
    } else {
        return { category: 'General Business Expense', deductibility: 1.0 };
    }
}

// 5. Core Logic Engine (Processes the transaction)
window.processEvent = function() {
    const select = document.getElementById('itemSelect');
    const feedbackBox = document.getElementById('feedbackBox');
    const value = select.value;

    if (!value) {
        alert("Please select an expense or choose 'Other'.");
        return;
    }

    let expenseName = "";
    let amount = 0;
    let deductibility = 0;
    let explanation = "";
    let smartMsg = "";
    let isApproved = false;

    // A. Handle Custom "Other" Input
    if (value === 'other') {
        expenseName = document.getElementById('customName').value;
        amount = parseFloat(document.getElementById('customAmount').value);
        
        if (!expenseName || isNaN(amount) || amount <= 0) {
            alert('Please enter a valid custom expense name and amount.');
            return;
        }
        
        const analysis = smartCategorize(expenseName);
        deductibility = analysis.deductibility;
        isApproved = deductibility > 0;
        
        explanation = `Custom expense analyzed as <strong>${analysis.category}</strong>.<br><small>💡 IRS permits ${(deductibility*100)}% deduction for this category.</small>`;
        
        if (analysis.category !== 'General Business Expense') {
            smartMsg = `[SMART AI] Categorized "${expenseName}" as [${analysis.category}]`;
        }
        
    } 
    // B. Handle Pre-defined JSON Inputs
    else {
        const item = library.find(i => i.id === value);
        if (!item) return;
        
        expenseName = item.name;
        amount = item.amount || 1000; // Use amount from JSON, or default to 1000
        deductibility = item.isDeductible ? 1.0 : 0.0;
        isApproved = item.isDeductible;
        
        explanation = `<strong>${item.explanation}</strong><br><small>💡 ${item.knowledgeTip}</small>`;
    }

    // Calculate the actual deductible portion
    const deductibleAmount = amount * deductibility;

    // Process Approval/Rejection
    if (isApproved) {
        totalDeductions += deductibleAmount; // Add to running total
        addLog(`EVENT: ${expenseName} | STATUS: Approved ✅ | Deductible: $${deductibleAmount.toFixed(2)}`, "log-success");
        if (typeof confetti === 'function') confetti({ particleCount: 150, spread: 70, origin: { y: 0.7 } });
    } else {
        addLog(`RISK ALERT: ${expenseName} | STATUS: Rejected 🚨 | Non-deductible`, "log-error");
    }

    if (smartMsg) {
        addLog(smartMsg, "system-msg");
    }

    // Save to ledger
    ledger.push({
        timestamp: new Date().toLocaleString(),
        item: expenseName,
        amount: amount,
        impact: isApproved ? "Deduction" : "Personal"
    });

    // Update UI
    feedbackBox.innerHTML = explanation;
    recalculate();
    
    // Reset Form
    select.value = '';
    toggleCustomInput();
    document.getElementById('customName').value = '';
    document.getElementById('customAmount').value = '';
}

// 6. Recalculate Totals
window.recalculate = function() {
    const income = parseFloat(document.getElementById('incomeInput').value) || 0;
    
    // Taxable income cannot be below 0
    const taxableIncome = Math.max(0, income - totalDeductions);
    
    // Calculate total tax based on JSON configuration
    let totalTax = taxableIncome * (config.selfEmploymentTax + config.incomeTaxBracket);
    if (income === 0) totalTax = 0; // Don't show a tax liability if no income is entered

    document.getElementById('deductionTotal').innerText = `$${totalDeductions.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    document.getElementById('taxOwed').innerText = `$${totalTax.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
}

// 7. Terminal Logger
window.addLog = function(message, className) {
    const terminal = document.getElementById('logTerminal');
    const entry = document.createElement('div');
    entry.className = `log-entry ${className || ''}`;
    
    // Make Smart AI messages pop out
    if(className === 'system-msg' && message.includes('[SMART AI]')) {
        entry.style.color = '#06b6d4';
        entry.style.fontWeight = 'bold';
    }
    
    entry.innerText = `[${new Date().toLocaleTimeString()}] ${message}`;
    terminal.appendChild(entry);
    terminal.scrollTop = terminal.scrollHeight; // Auto-scroll to bottom
}

// 8. Export CSV
window.exportCSV = function() {
    if (ledger.length === 0) {
        alert("No data to export yet!");
        return;
    }
    let csv = "Timestamp,Item,Amount,Impact\n";
    ledger.forEach(r => csv += `"${r.timestamp}","${r.item}",${r.amount},${r.impact}\n`);
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "Audit_Ledger.csv";
    a.click();
    addLog("SYSTEM: Ledger successfully exported.", "system-msg");
}
