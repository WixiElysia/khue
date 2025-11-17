const show = (element, timeout) => {
    if (!element) return;
    element.style.display = 'block';
    if (timeout) {
        setTimeout(() => {
            element.style.display = 'none';
        }, timeout);
    }
};

const hide = (element) => {
    if (!element) return;
    element.style.display = 'none';
};

const customerNameInput = document.getElementById('customerName');
const productNameInput = document.getElementById('productName');
const priceInput = document.getElementById('productPrice');
const prepaidInput = document.getElementById('prepaid');
const loanInput = document.getElementById('loanAmount');
const termInput = document.getElementById('loanTerm');
const rateInput = document.getElementById('interestRate');
const calcButton = document.getElementById('calcButton');
const addInsurance = document.getElementById('addInsurance');
const insuranceRate = document.getElementById('insuranceRate');
const viewTableBtn = document.getElementById('viewTable');
const feeButton = document.getElementById('feeButton');
const deleteButton = document.getElementById('deleteButton');
const printBtn = document.querySelector('.btn-print');
const shareBtn = document.querySelector('.btn-share');
const resultBox = document.querySelector('.result-box');
const insuranceBox = document.querySelector('.insurance-box');
const tableContainer = document.querySelector('.table-container');
const tableWrap = document.getElementById('tableWrap');
const errorEmptyPrice = document.querySelector('.error-empty-price');
const errorPrepaid = document.querySelector('.error-prepaid');
const errorEmptyBH = document.querySelector('.error-empty-bh');
const errorEmptySchedule = document.querySelector('.error-empty-schedule');
const btnViewNote = document.querySelector('.btn-view-note');
const btnFeeNote = document.querySelector('.btn-fee-note');
const btnDeleteNote = document.querySelector('.btn-delete-note');

let originalLoanAmount = 0;
let originalTableHTML = '';
let hasAppliedFee = false;

const parseNum = str => Number(str.replace(/\./g, '')) || 0;
const formatNum = num => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
const currency = v => Math.round(v).toLocaleString('vi-VN');
const getRaw = id => Number(document.getElementById(id).value.replace(/[^0-9]/g, '')) || 0;

const resetInsurance = () => {
    insuranceBox.style.display = 'none';
    insuranceRate.value = "0";
    hide(errorEmptyBH);
};

[priceInput, prepaidInput].forEach(input => {
    input.addEventListener('input', e => {
        let v = e.target.value.replace(/\D/g, "").replace(/^0+/, "");
        e.target.value = formatNum(v);
        resultBox.style.display = 'none';
        loanInput.value = '';
        originalLoanAmount = 0;
        resetInsurance();
        hide(errorEmptyPrice);
        hide(errorPrepaid);
    });
});

loanInput.addEventListener('input', e => {
    let v = e.target.value.replace(/\D/g, "").replace(/^0+/, "");
    e.target.value = formatNum(v);
    const num = parseNum(v);
    originalLoanAmount = num > 0 ? num : 0;
    resetInsurance();
});

termInput.addEventListener('input', e => {
    e.target.value = e.target.value.replace(/\D/g, "").replace(/^0+/, "");
});

rateInput.addEventListener('input', e => {
    let v = e.target.value.replace(/[^0-9.]/g, "");
    if (v === "" || v === "." || v === "0.") {
        e.target.value = v === "." ? "0." : v;
        document.getElementById('monthlyInterestRate').value = "";
        return;
    }
    if (v.startsWith(".")) v = "0" + v;
    const parts = v.split(".");
    let integerPart = parts[0].replace(/^0+/, "") || "0";
    const decimalPart = parts[1] ? parts[1].slice(0, 2) : "";
    let finalValue = integerPart + (decimalPart ? "." + decimalPart : "");
    const numValue = parseFloat(finalValue);
    if (numValue > 1000) finalValue = "1000";
    e.target.value = finalValue === "0" && !decimalPart ? "0" : finalValue;

    const rAnnual = parseFloat(finalValue) || 0;
    const rMonthly = rAnnual / 12;
    const rMonthlyDisplay = rMonthly ? Number(rMonthly.toFixed(3).slice(0, -1)).toString() : "";
    document.getElementById('monthlyInterestRate').value = rMonthlyDisplay;
});

calcButton.onclick = () => {
    const price = parseNum(priceInput.value);
    const prepaid = parseNum(prepaidInput.value);
    hide(errorEmptyPrice);
    hide(errorPrepaid);
    resultBox.style.display = 'none';

    if (!price) return show(errorEmptyPrice, 5000);
    if (prepaid > price) return show(errorPrepaid, 5000);

    const percent = Math.round(prepaid / price * 100);
    const remain = price - prepaid;
    originalLoanAmount = remain;

    resultBox.innerHTML = `<div>Trả trước: <span class="percent">${percent}%</span></div><div>Trả góp: <span class="amount">${formatNum(remain)} VNĐ</span></div>`;
    resultBox.style.display = 'block';
    loanInput.value = formatNum(remain);

    tableContainer.style.display = 'none';
    tableWrap.innerHTML = '';
    originalTableHTML = '';
    hasAppliedFee = false;
    feeButton.style.display = 'none';
    hide(btnViewNote);
    hide(btnFeeNote);

    resetInsurance();
};

addInsurance.onclick = () => {
    hide(errorEmptyBH);
    if (originalLoanAmount === 0) return show(errorEmptyBH, 5000);

    const rate = parseFloat(insuranceRate.value);
    if (!rate) {
        insuranceBox.innerHTML = `<div>Trả góp: <span class="amount">${formatNum(originalLoanAmount)} VNĐ</span></div>`;
        insuranceBox.style.display = 'block';
        loanInput.value = formatNum(originalLoanAmount);
    } else {
        const fee = Math.round(originalLoanAmount * rate / 100);
        const total = originalLoanAmount + fee;
        insuranceBox.innerHTML = `
            <div>Trả góp: <span class="amount">${formatNum(originalLoanAmount)} VNĐ</span></div>
            <div>Thêm BHKV: <span class="percent">${rate}%</span></div>
            <div>Phí BHKV: <span class="amount1">+${formatNum(fee)} VNĐ</span></div>
            <div>Đã gồm có BHKV: <span class="amount">${formatNum(total)} VNĐ</span></div>
        `;
        insuranceBox.style.display = 'block';
        loanInput.value = formatNum(total);
    }

    tableContainer.style.display = 'none';
    tableWrap.innerHTML = '';
    originalTableHTML = '';
    hasAppliedFee = false;
    feeButton.style.display = 'none';
    hide(btnViewNote);
    hide(btnFeeNote);
};

insuranceRate.addEventListener('change', function() {
    insuranceBox.style.display = 'none';
    insuranceBox.innerHTML = '';
    loanInput.value = formatNum(originalLoanAmount);
});

viewTableBtn.onclick = () => {
    hide(errorEmptySchedule);
    const P = getRaw('loanAmount');
    const n = parseInt(termInput.value);
    const rAnnual = parseFloat(rateInput.value) || 0;

    if (!P || P <= 0 || !n || n <= 0 || rateInput.value.trim() === '') {
        return show(errorEmptySchedule, 8000), hide(tableContainer);
    }

    const r = rAnnual / 100 / 12;

    let emiFixed;
    if (r === 0) {
        emiFixed = Math.round(P / n);
    } else {
        const pow = Math.pow(1 + r, n);
        const emiRaw = P * r * pow / (pow - 1);
        emiFixed = Math.round(emiRaw);
    }

    let balance = P;
    let totalPayment = 0;
    let totalInterest = 0;
    let html = `<table><thead><tr>
        <th>No.</th>
        <th>Trả mỗi kỳ</th>
        <th>Gốc</th>
        <th>Lãi</th>
        <th>Số dư</th>
    </tr></thead><tbody>`;

    for (let i = 1; i <= n; i++) {
        let interest = Math.round(balance * r);
        let principal = emiFixed - interest;
        let emi = emiFixed;

        if (i === n) {
            principal = balance;
            emi = principal + interest;
            let diff = emi - emiFixed;
            principal -= diff;
            emi = emiFixed;
            balance = 0;
        } else {
            if (principal > balance) principal = balance;
            balance -= principal;
            balance = Math.round(balance);
        }

        totalPayment += emi;
        totalInterest += interest;

        html += `<tr>
            <td>${i}</td>
            <td>${currency(emi)}</td>
            <td>${currency(principal)}</td>
            <td>${currency(interest)}</td>
            <td>${i === n ? '0' : currency(balance)}</td>
        </tr>`;
    }

    html += `<tr class="total-row">
        <td>Tổng</td>
        <td>${currency(totalPayment)}</td>
        <td></td>
        <td>${currency(totalInterest)}</td>
        <td></td>
    </tr></tbody></table>`;

    tableWrap.innerHTML = html;
    show(tableContainer);
    show(btnViewNote);
    originalTableHTML = html;

    feeButton.style.display = 'inline-block';
    feeButton.textContent = 'Phí thu hộ';
    feeButton.disabled = false;
    hasAppliedFee = false;
    hide(btnFeeNote);

    printBtn.disabled = false;
    shareBtn.disabled = false;
    printBtn.style.opacity = '1';
    shareBtn.style.opacity = '1';
};

feeButton.onclick = () => {
    if (hasAppliedFee) return;
    const rows = tableWrap.querySelectorAll('tbody tr:not(.total-row)');
    rows.forEach(row => {
        let val = Number(row.cells[1].textContent.replace(/\D/g, '')) + 12000;
        row.cells[1].textContent = val.toLocaleString('vi-VN');
    });
    const total = [...rows].reduce((s, r) => s + Number(r.cells[1].textContent.replace(/\D/g, '')), 0);
    tableWrap.querySelector('.total-row td:nth-child(2)').textContent = total.toLocaleString('vi-VN');

    const firstEMI = Number(rows[0].cells[1].textContent.replace(/\D/g, ''));
    btnFeeNote.innerHTML = `<div>Tiền trả góp mỗi kỳ: <span class="amount">${(firstEMI-12000).toLocaleString('vi-VN')} VNĐ</span></div><div>Phí thu hộ: <span class="amount1">+12.000 VNĐ</span></div><div>Tổng mỗi kỳ: <span class="amount">${firstEMI.toLocaleString('vi-VN')} VNĐ</span></div>`;
    show(btnFeeNote);

    feeButton.textContent = 'Đã áp dụng';
    feeButton.disabled = true;
    hasAppliedFee = true;
};

deleteButton.onclick = () => {
    const inputs = [
        customerNameInput,
        productNameInput,
        priceInput,
        prepaidInput,
        loanInput,
        termInput,
        rateInput,
        document.getElementById('monthlyInterestRate')
    ].filter(i => i);

    inputs.forEach(i => i.value = '');
    insuranceRate.value = "0";

    [resultBox, insuranceBox, tableContainer, btnFeeNote, btnViewNote].forEach(el => {
        if (el) el.style.display = 'none';
    });

    [errorEmptyPrice, errorPrepaid, errorEmptyBH, errorEmptySchedule].forEach(hide);
    tableWrap.innerHTML = '';

    originalLoanAmount = 0;
    hasAppliedFee = false;
    originalTableHTML = '';
    feeButton.style.display = 'none';
    printBtn.disabled = true;
    shareBtn.disabled = true;
    printBtn.style.opacity = '0.5';
    shareBtn.style.opacity = '0.5';

    show(btnDeleteNote, 5000);
};

feeButton.style.display = 'none';
printBtn.disabled = true;
shareBtn.disabled = true;
printBtn.style.opacity = '0.5';
shareBtn.style.opacity = '0.5';

function captureAndDownload(mode) {
    if (!tableWrap.innerHTML.trim()) return alert("Vui lòng Xem bảng trước!");

    const customer = customerNameInput.value.trim() || "KH";
    const product = productNameInput.value.trim() || "SP";
    const fileName = customer.replace(/[^a-zA-Z0-9]/g, '_');
    const rAnnual = parseFloat(rateInput.value) || 0;
    const rMonthly = Number((rAnnual / 12).toFixed(3).slice(0, -1)).toString();
    const now = new Date();
    const dateStr = now.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    const timeStr = now.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
    });
    const dateTimeText = `<p style="color:#dc2626; font-weight:600; margin-bottom:8px;">
        Ngày tạo: ${dateStr.replace(/\//g, '/')} ${timeStr}
    </p>`;

    let insuranceText = '';
    if (insuranceRate.value !== "0") {
        const rate = parseFloat(insuranceRate.value);
        const bhFee = Math.round(originalLoanAmount * rate / 100);
        const rateText = insuranceRate.options[insuranceRate.selectedIndex].text;
        insuranceText = `<p><strong>Bảo hiểm khoản vay:</strong> ${rateText} (+${bhFee.toLocaleString('vi-VN')} VNĐ)</p>`;
    }

    let feeText = '';
    if (hasAppliedFee) {
        const firstRow = tableWrap.querySelector('tbody tr:not(.total-row)');
        if (firstRow) {
            const emiWithFee = Number(firstRow.cells[1].textContent.replace(/\D/g, ''));
            const emiBefore = emiWithFee - 12000;
            //feeText = `<p><strong>Phí thu hộ:</strong> Góp mỗi kỳ ${emiBefore.toLocaleString('vi-VN')} + 12.000 (${emiWithFee.toLocaleString('vi-VN')} VNĐ)</p>`;
            feeText = `<p><strong>Phí thu hộ:</strong> +12.000 (${emiWithFee.toLocaleString('vi-VN')} VNĐ)</p>`;
        } else {
            feeText = `<p><strong>Phí thu hộ:</strong> +12.000 VNĐ/kỳ</p>`;
        }
    }

    const safeValue = (input) => input.value.trim() ? input.value : '0';
    const info = `
        ${dateTimeText}
        <p><strong>Tên khách hàng:</strong> ${customer}</p>
        <p><strong>Tên sản phẩm:</strong> ${product}</p>
        <p><strong>Giá sản phẩm:</strong> ${safeValue(priceInput)} VNĐ</p>
        <p><strong>Trả trước:</strong> ${safeValue(prepaidInput)} VNĐ</p>
        ${insuranceText}
        <p><strong>Trả góp:</strong> ${safeValue(loanInput)} VNĐ</p>
        <p><strong>Thời hạn:</strong> ${termInput.value.trim() || '0'} tháng</p>
        <p><strong>Lãi suất:</strong> ${rAnnual || '0'}%/năm (${rMonthly}%/tháng)</p>
        ${feeText}
    `;

    document.getElementById("printInfo").innerHTML = info;
    document.getElementById("printTable").innerHTML = tableWrap.innerHTML;

    const area = document.getElementById("printArea");
    area.classList.remove("d-none");

    return html2canvas(area, {
        scale: 2,
        useCORS: true
    }).then(canvas => {
        area.classList.add("d-none");
        const data = canvas.toDataURL('image/png');

        if (mode === 'print') {
            const a = document.createElement('a');
            a.download = `BangTraGop_${fileName}_${dateStr.replace(/\//g, '-')}_${timeStr.replace(/:/g, '')}.png`;
            a.href = data;
            a.click();
            return;
        }

        return new Promise((resolve) => {
            canvas.toBlob(blob => {
                const file = new File([blob], `BangTraGop_${fileName}.png`, {
                    type: 'image/png'
                });
                resolve({
                    data,
                    file,
                    fileName
                });
            }, 'image/png');
        });
    });
}

function fallback(data, name) {
    const a = document.createElement('a');
    a.download = `BangTraGop_${name}.png`;
    a.href = data;
    a.click();
}

printBtn.onclick = () => captureAndDownload('print');

shareBtn.onclick = () => {
    captureAndDownload('share').then(({
        data,
        file
    }) => {
        if (navigator.share && navigator.canShare && navigator.canShare({
                files: [file]
            })) {
            navigator.share({
                title: `Bang tra gop - ${customerNameInput.value.trim() || 'KH'}`,
                files: [file]
            }).catch(() => {
                 });
        } else {
            fallback(data, customerNameInput.value.trim() || 'KH');
        }
    });
};

const resetOnInputChange = () => {
    tableContainer.style.display = 'none';
    tableWrap.innerHTML = '';

    hide(btnViewNote);
    hide(btnFeeNote);

    feeButton.style.display = 'none';
    feeButton.textContent = 'Phí thu hộ';
    feeButton.disabled = false;
    hasAppliedFee = false;

    printBtn.disabled = true;
    shareBtn.disabled = true;
    printBtn.style.opacity = '0.5';
    shareBtn.style.opacity = '0.5';

    originalTableHTML = '';
};

[loanInput, termInput, rateInput].forEach(input => {
    input.addEventListener('input', () => {
        if (tableWrap.innerHTML.trim()) {
            resetOnInputChange();
        }
    });
});

document.querySelectorAll('input').forEach(input => {
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            this.blur();
        }
    });
});
