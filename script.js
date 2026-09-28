/**
 * الموقع الرسمي لجمعية حنطة الخيرية التنموية - طرطوس
 * الكود الشامل والمتكامل (النظام المالي، التبويبات، وإدارة القرى)
 * تطوير وبرمجة: طارق ابراهيم
 */

document.addEventListener('DOMContentLoaded', () => {
    loadStoredData();
    initFormValidation();
});

// الذاكرة المؤقتة (تخزين محلي)
let officialMembersQueue = JSON.parse(localStorage.getItem('heintah_members')) || [];
let expensesList = JSON.parse(localStorage.getItem('heintah_expenses')) || [];
let aidOutList = JSON.parse(localStorage.getItem('heintah_aid_out')) || [];
let initiativesExpensesList = JSON.parse(localStorage.getItem('heintah_initiatives')) || [];

let villagesList = JSON.parse(localStorage.getItem('heintah_villages')) || [
    {
        id: 'v_1',
        name: 'قرية الشيخ بدر - المركز',
        cases: [
            {
                name: "أحمد محمد العلي",
                familyCount: 5,
                nationalId: "03011122334",
                details: "ذكور: 2 (12، 8 سنوات) | إناث: 2 (10، 5 سنوات)",
                phone: "0933112233",
                reason: "تعطل عن العمل بسبب ظروف صحية مزمنة"
            }
        ]
    }
];

let currentAdminRole = null;
let currentSubTab = 'expenses';

/**
 * التنقل السلس بين الأقسام الرئيسية
 */
function switchTab(sectionId, btnElement) {
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('nav button').forEach(btn => btn.classList.remove('active-nav'));
    
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        if(btnElement) btnElement.classList.add('active-nav');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if(sectionId === 'admin') {
        renderSubTabContent();
    }
}

/**
 * وظائف عرض وإغلاق النظام الداخلي
 */
function openInternalRules() {
    const modal = document.getElementById('internalRulesModal');
    if (modal) modal.style.display = 'flex';
}

function closeInternalRules() {
    const modal = document.getElementById('internalRulesModal');
    if (modal) modal.style.display = 'none';
}

/**
 * التحقق من صحة المدخلات والأرقام
 */
function initFormValidation() {
    const nationalIdInput = document.getElementById('nationalId');
    if (nationalIdInput) {
        nationalIdInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '').slice(0, 11);
        });
    }

    const whatsappInput = document.getElementById('whatsapp');
    if (whatsappInput) {
        whatsappInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
        });
    }
}

/**
 * تقديم استمارة الانتساب الرسمية
 */
function submitOfficialForm(e) {
    e.preventDefault();
    const nationalId = document.getElementById('nationalId').value;
    if (nationalId.length !== 11) {
        showNotification('عذراً، الرقم الوطني يجب أن يكون مؤلفاً من 11 رقماً بدقة.', 'error');
        return;
    }

    const memberData = {
        fullName: document.getElementById('fullName').value,
        fatherName: document.getElementById('fatherName').value,
        motherName: document.getElementById('motherName').value,
        birthPlaceDate: document.getElementById('birthPlaceDate').value,
        nationalId: nationalId,
        education: document.getElementById('education').value,
        job: document.getElementById('job').value,
        address: document.getElementById('address').value,
        whatsapp: document.getElementById('whatsapp').value,
        email: document.getElementById('email').value,
        socialStatus: document.getElementById('socialStatus').value,
        familyMembers: document.getElementById('familyMembers').value,
        experience: document.getElementById('experience').value,
        dateAdded: new Date().toLocaleDateString('ar-SY')
    };

    officialMembersQueue.push(memberData);
    saveDataToLocalStorage();

    showNotification('تم تقديم استمارة الانتساب بنجاح وإرسالها لمجلس الإدارة لدراستها.', 'success');
    document.getElementById('officialForm').reset();
    switchTab('home', document.querySelector('nav button'));
}

/**
 * تسجيل الدخول لوحة الإدارة والمؤسسين مع التحقق من كلمة المرور henta2226
 */
function loginAdminSystem() {
    const role = document.getElementById('adminRole').value;
    const passwordInput = document.getElementById('adminPassword').value;
    
    if ((role === 'president' || role === 'vice') && passwordInput !== 'henta2226') {
        showNotification('عذراً، كلمة المرور غير صحيحة للمؤسسين.', 'error');
        return;
    }

    currentAdminRole = role; 
    
    const titles = {
        'president': '👑 رئيس الجمعية (صلاحيات كاملة للمؤسسين)',
        'vice': '⭐ نائب الرئيس (صلاحيات الإشراف والمتابعة للمؤسسين)',
        'treasurer': '💼 أمين الصندوق (إدارة النفقات والمالية)'
    };
    
    const loginBox = document.getElementById('loginBox');
    const dashboard = document.getElementById('adminDashboard');
    
    if (loginBox && dashboard) {
        loginBox.style.display = 'none';
        dashboard.style.display = 'block';
        document.getElementById('adminTitle').innerText = titles[role];
        
        renderSubTabContent();
        showNotification('تم تسجيل الدخول بنجاح.', 'success');
    }
}

/**
 * التبديل بين التبويبات الفرعية في لوحة الإدارة
 */
function switchAdminSubTab(tabName, btnElement) {
    currentSubTab = tabName;
    document.querySelectorAll('.sub-tab-btn').forEach(b => {
        b.style.background = '#555';
    });
    if(btnElement) btnElement.style.background = 'var(--primary)';
    renderSubTabContent();
}

/**
 * عرض محتوى التبويب النشط
 */
function renderSubTabContent() {
    const container = document.getElementById('subTabContent');
    const villagesWrapper = document.getElementById('villagesSectionWrapper');
    if (!container) return;

    // إظهار قسم القرى للمؤسسين فقط
    const isFounder = currentAdminRole === 'president' || currentAdminRole === 'vice';
    if (villagesWrapper) villagesWrapper.style.display = isFounder ? 'block' : 'none';

    if (currentSubTab === 'expenses') {
        let rows = expensesList.length === 0 ? '<tr><td colspan="4" style="text-align:center; color:#777;">لا توجد نفقات مسجلة.</td></tr>' : 
            expensesList.map((item, idx) => `<tr><td>${item.desc}</td><td>${item.amount} ل.س</td><td>${item.date}</td><td><button onclick="deleteExpense(${idx})" style="background:#d32f2f; color:#fff; border:none; padding:4px 8px; border-radius:4px; cursor:pointer;">حذف</button></td></tr>`).join('');

        container.innerHTML = `
            <div class="card" style="background:#fff; padding:20px; border-radius:8px;">
                <h3 style="color:var(--primary); margin-top:0;">💸 إدارة وتسجيل النفقات العامة</h3>
                <div style="display:flex; gap:10px; margin-bottom:15px; flex-wrap:wrap;">
                    <input type="text" id="expDesc" placeholder="بيان النفقة" style="flex:2; padding:8px; border:1px solid #ccc; border-radius:4px;">
                    <input type="number" id="expAmount" placeholder="المبلغ (ل.س)" style="flex:1; padding:8px; border:1px solid #ccc; border-radius:4px;">
                    <button onclick="addExpense()" style="background:var(--accent); color:#fff; border:none; padding:8px 15px; border-radius:4px; cursor:pointer; font-weight:bold;">إضافة نفقة</button>
                </div>
                <table style="width:100%; border-collapse:collapse;">
                    <thead><tr style="background:#f4f4f4;"><th style="padding:8px; border:1px solid #ddd;">البيان</th><th style="padding:8px; border:1px solid #ddd;">المبلغ</th><th style="padding:8px; border:1px solid #ddd;">التاريخ</th><th style="padding:8px; border:1px solid #ddd;">التحكم</th></tr></thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;
    } else if (currentSubTab === 'aidOut') {
        let rows = aidOutList.length === 0 ? '<tr><td colspan="5" style="text-align:center; color:#777;">لم يتم إخراج مساعدات بعد.</td></tr>' : 
            aidOutList.map((item, idx) => `<tr><td>${item.beneficiary}</td><td>${item.aidType}</td><td>${item.quantity}</td><td>${item.date}</td><td><button onclick="deleteAidOut(${idx})" style="background:#d32f2f; color:#fff; border:none; padding:4px 8px; border-radius:4px; cursor:pointer;">حذف</button></td></tr>`).join('');

        container.innerHTML = `
            <div class="card" style="background:#fff; padding:20px; border-radius:8px;">
                <h3 style="color:var(--primary); margin-top:0;">📦 تبويب إخراج المساعدات</h3>
                <div style="display:flex; gap:10px; margin-bottom:15px; flex-wrap:wrap;">
                    <input type="text" id="aidBeneficiary" placeholder="اسم المستفيد" style="flex:1.5; padding:8px; border:1px solid #ccc; border-radius:4px;">
                    <input type="text" id="aidType" placeholder="نوع المساعدة" style="flex:1.5; padding:8px; border:1px solid #ccc; border-radius:4px;">
                    <input type="text" id="aidQty" placeholder="الكمية" style="flex:1; padding:8px; border:1px solid #ccc; border-radius:4px;">
                    <button onclick="addAidOut()" style="background:var(--accent); color:#fff; border:none; padding:8px 15px; border-radius:4px; cursor:pointer; font-weight:bold;">تسجيل إخراج</button>
                </div>
                <table style="width:100%; border-collapse:collapse;">
                    <thead><tr style="background:#f4f4f4;"><th style="padding:8px; border:1px solid #ddd;">المستفيد</th><th style="padding:8px; border:1px solid #ddd;">نوع المساعدة</th><th style="padding:8px; border:1px solid #ddd;">الكمية</th><th style="padding:8px; border:1px solid #ddd;">التاريخ</th><th style="padding:8px; border:1px solid #ddd;">التحكم</th></tr></thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;
    } else if (currentSubTab === 'initiatives') {
        let rows = initiativesExpensesList.length === 0 ? '<tr><td colspan="5" style="text-align:center; color:#777;">لا توجد مصاريف مبادرات مسجلة.</td></tr>' : 
            initiativesExpensesList.map((item, idx) => `<tr><td>${item.initiativeName}</td><td>${item.expenseDesc}</td><td>${item.amount} ل.س</td><td>${item.date}</td><td><button onclick="deleteInitiativeExp(${idx})" style="background:#d32f2f; color:#fff; border:none; padding:4px 8px; border-radius:4px; cursor:pointer;">حذف</button></td></tr>`).join('');

        container.innerHTML = `
            <div class="card" style="background:#fff; padding:20px; border-radius:8px;">
                <h3 style="color:var(--primary); margin-top:0;">💡 تبويب مصاريف المبادرات التنموية</h3>
                <div style="display:flex; gap:10px; margin-bottom:15px; flex-wrap:wrap;">
                    <input type="text" id="initName" placeholder="اسم المبادرة" style="flex:1.5; padding:8px; border:1px solid #ccc; border-radius:4px;">
                    <input type="text" id="initDesc" placeholder="بيان المصروف" style="flex:1.5; padding:8px; border:1px solid #ccc; border-radius:4px;">
                    <input type="number" id="initAmount" placeholder="المبلغ (ل.س)" style="flex:1; padding:8px; border:1px solid #ccc; border-radius:4px;">
                    <button onclick="addInitiativeExp()" style="background:var(--accent); color:#fff; border:none; padding:8px 15px; border-radius:4px; cursor:pointer; font-weight:bold;">إضافة مصروف</button>
                </div>
                <table style="width:100%; border-collapse:collapse;">
                    <thead><tr style="background:#f4f4f4;"><th style="padding:8px; border:1px solid #ddd;">اسم المبادرة</th><th style="padding:8px; border:1px solid #ddd;">بيان المصروف</th><th style="padding:8px; border:1px solid #ddd;">المبلغ</th><th style="padding:8px; border:1px solid #ddd;">التاريخ</th><th style="padding:8px; border:1px solid #ddd;">التحكم</th></tr></thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;
    } else if (currentSubTab === 'members') {
        let rows = officialMembersQueue.length === 0 ? '<tr><td colspan="5" style="text-align:center; color:#777;">لا توجد طلبات انتساب جديدة.</td></tr>' : 
            officialMembersQueue.map((m, idx) => `
                <tr>
                    <td><b>${m.fullName}</b><br><small>الأب: ${m.fatherName}</small></td>
                    <td>${m.job}</td>
                    <td><code>${m.nationalId}</code></td>
                    <td><a href="https://wa.me/963${m.whatsapp.replace(/^0/, '')}" target="_blank">${m.whatsapp} 💬</a></td>
                    <td>
                        <button onclick="approveMemberOfficial(${idx})" style="background:#2e8b57; color:#fff; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">قبول</button>
                        <button onclick="rejectMember(${idx})" style="background:#d32f2f; color:#fff; border:none; padding:5px 10px; border-radius:4px; cursor:pointer; margin-right:5px;">رفض</button>
                    </td>
                </tr>
            `).join('');

        container.innerHTML = `
            <div class="card" style="background:#fff; padding:20px; border-radius:8px;">
                <h3 style="color:var(--primary); margin-top:0;">👥 طلبات الانتساب المعلقة</h3>
                <button onclick="exportToExcel()" style="background:#27ae60; color:#fff; border:none; padding:8px 12px; border-radius:4px; cursor:pointer; margin-bottom:15px; font-weight:bold;">📥 تصدير الطلبات (Excel)</button>
                <table style="width:100%; border-collapse:collapse;">
                    <thead><tr style="background:#f4f4f4;"><th style="padding:8px; border:1px solid #ddd;">الاسم</th><th style="padding:8px; border:1px solid #ddd;">المهنة</th><th style="padding:8px; border:1px solid #ddd;">الرقم الوطني</th><th style="padding:8px; border:1px solid #ddd;">واتساب</th><th style="padding:8px; border:1px solid #ddd;">التحكم</th></tr></thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;
    }

    if (isFounder) renderVillagesManager();
}

// دوال إضافة النفقات والمساعدات والمبادرات
function addExpense() {
    const desc = document.getElementById('expDesc').value.trim();
    const amount = parseFloat(document.getElementById('expAmount').value);
    if (!desc || isNaN(amount) || amount <= 0) {
        showNotification('يرجى إدخال بيان صحيح ومبلغ صالح.', 'error');
        return;
    }
    expensesList.unshift({ desc, amount, date: new Date().toLocaleDateString('ar-SY') });
    saveDataToLocalStorage();
    renderSubTabContent();
    showNotification('تم تسجيل النفقة بنجاح.', 'success');
}
function deleteExpense(idx) {
    expensesList.splice(idx, 1);
    saveDataToLocalStorage();
    renderSubTabContent();
}

function addAidOut() {
    const beneficiary = document.getElementById('aidBeneficiary').value.trim();
    const aidType = document.getElementById('aidType').value.trim();
    const quantity = document.getElementById('aidQty').value.trim();
    if (!beneficiary || !aidType || !quantity) {
        showNotification('يرجى تعبئة كافة الحقول.', 'error');
        return;
    }
    aidOutList.unshift({ beneficiary, aidType, quantity, date: new Date().toLocaleDateString('ar-SY') });
    saveDataToLocalStorage();
    renderSubTabContent();
    showNotification('تم تسجيل إخراج المساعدة بنجاح.', 'success');
}
function deleteAidOut(idx) {
    aidOutList.splice(idx, 1);
    saveDataToLocalStorage();
    renderSubTabContent();
}

function addInitiativeExp() {
    const initiativeName = document.getElementById('initName').value.trim();
    const expenseDesc = document.getElementById('initDesc').value.trim();
    const amount = parseFloat(document.getElementById('initAmount').value);
    if (!initiativeName || !expenseDesc || isNaN(amount) || amount <= 0) {
        showNotification('يرجى إدخال البيانات والمبلغ بشكل صحيح.', 'error');
        return;
    }
    initiativesExpensesList.unshift({ initiativeName, expenseDesc, amount, date: new Date().toLocaleDateString('ar-SY') });
    saveDataToLocalStorage();
    renderSubTabContent();
    showNotification('تم تسجيل مصروف المبادرة بنجاح.', 'success');
}
function deleteInitiativeExp(idx) {
    initiativesExpensesList.splice(idx, 1);
    saveDataToLocalStorage();
    renderSubTabContent();
}

function approveMemberOfficial(idx) {
    if(confirm('هل أنت متأكد من قبول العضو؟')) {
        officialMembersQueue.splice(idx, 1);
        saveDataToLocalStorage();
        renderSubTabContent();
        showNotification('تم قبول العضو بنجاح.', 'success');
    }
}
function rejectMember(idx) {
    if(confirm('هل تريد استبعاد هذا الطلب؟')) {
        officialMembersQueue.splice(idx, 1);
        saveDataToLocalStorage();
        renderSubTabContent();
        showNotification('تم استبعاد الطلب.', 'error');
    }
}

/**
 * إدارة القرى والحالات
 */
function renderVillagesManager() {
    const container = document.getElementById('villagesContainer');
    if (!container) return;

    container.innerHTML = '';
    if (villagesList.length === 0) {
        container.innerHTML = `<p style="color: #777; text-align: center; padding: 20px;">لا توجد قرى مسجلة بعد.</p>`;
        return;
    }

    villagesList.forEach((village, vIdx) => {
        let casesRows = village.cases.length === 0 ? `<tr><td colspan="7" style="text-align: center; color: #777;">لا توجد حالات مسجلة.</td></tr>` :
            village.cases.map((c, cIdx) => `
                <tr>
                    <td><b>${c.name}</b></td>
                    <td>${c.familyCount} أفراد</td>
                    <td><code>${c.nationalId}</code></td>
                    <td>${c.details}</td>
                    <td>${c.phone}</td>
                    <td>${c.reason}</td>
                    <td><button onclick="deleteCase(${vIdx}, ${cIdx})" style="background:#d32f2f; color:#fff; border:none; padding:4px 8px; border-radius:4px; cursor:pointer;">حذف</button></td>
                </tr>
            `).join('');

        container.innerHTML += `
            <div style="background: #f9f9f9; border: 1px solid #ddd; padding: 15px; border-radius: 6px; margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <h4 style="margin: 0; color: var(--primary);">🏡 قرية: ${village.name}</h4>
                    <div>
                        <button onclick="promptAddCase(${vIdx})" style="background: var(--accent); color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">➕ إضافة حالة</button>
                        <button onclick="deleteVillage(${vIdx})" style="background: #c0392b; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin-right: 5px;">🗑️ حذف القرية</button>
                    </div>
                </div>
                <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
                    <thead><tr style="background: #eee;"><th style="padding:6px; border:1px solid #ccc;">اسم المحتاج</th><th style="padding:6px; border:1px solid #ccc;">الأفراد</th><th style="padding:6px; border:1px solid #ccc;">الرقم الوطني</th><th style="padding:6px; border:1px solid #ccc;">التفاصيل</th><th style="padding:6px; border:1px solid #ccc;">الهاتف</th><th style="padding:6px; border:1px solid #ccc;">السبب</th><th style="padding:6px; border:1px solid #ccc;">التحكم</th></tr></thead>
                    <tbody>${casesRows}</tbody>
                </table>
            </div>
        `;
    });
}

function promptAddVillage() {
    const name = prompt("أدخل اسم القرية الجديدة:");
    if (name && name.trim() !== "") {
        villagesList.push({ id: 'v_' + Date.now(), name: name.trim(), cases: [] });
        saveDataToLocalStorage();
        renderVillagesManager();
        showNotification('تمت إضافة القرية بنجاح.', 'success');
    }
}
function deleteVillage(vIdx) {
    if (confirm('هل أنت متأكد من حذف هذه القرية وحالاتها؟')) {
        villagesList.splice(vIdx, 1);
        saveDataToLocalStorage();
        renderVillagesManager();
        showNotification('تم حذف القرية.', 'success');
    }
}
function promptAddCase(vIdx) {
    const name = prompt("اسم المحتاج والكنية:");
    if (!name) return;
    const familyCount = prompt("عدد أفراد الأسرة:");
    const nationalId = prompt("الرقم الوطني (11 رقماً):");
    if (!nationalId || nationalId.length !== 11) { alert("الرقم الوطني خطأ."); return; }
    const details = prompt("تفاصيل الأفراد والأعمار:");
    const phone = prompt("رقم الهاتف:");
    const reason = prompt("سبب الحالة:");

    villagesList[vIdx].cases.push({ name, familyCount, nationalId, details, phone, reason });
    saveDataToLocalStorage();
    renderVillagesManager();
    showNotification('تمت إضافة الحالة بنجاح.', 'success');
}
function deleteCase(vIdx, cIdx) {
    if (confirm('حذف هذه الحالة؟')) {
        villagesList[vIdx].cases.splice(cIdx, 1);
        saveDataToLocalStorage();
        renderVillagesManager();
        showNotification('تم الحذف.', 'success');
    }
}

function exportToExcel() {
    if(officialMembersQueue.length === 0) {
        showNotification('لا توجد بيانات للتصدير.', 'error');
        return;
    }
    let csvContent = "\uFEFFالاسم,اسم الأب,الرقم الوطني,المهنة,واتساب,تاريخ التقديم\n";
    officialMembersQueue.forEach(m => {
        csvContent += `"${m.fullName}","${m.fatherName}","${m.nationalId}","${m.job}","${m.whatsapp}","${m.dateAdded}"\n`;
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'members.csv';
    a.click();
    showNotification('تم التصدير بنجاح.', 'success');
}

function showNotification(message, type = 'success') {
    let existing = document.getElementById('toastNotification');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'toastNotification';
    toast.innerText = message;
    Object.assign(toast.style, {
        position: 'fixed', bottom: '25px', left: '50%', transform: 'translateX(-50%)',
        backgroundColor: type === 'success' ? '#1b4d3e' : '#c0392b', color: '#fff',
        padding: '10px 20px', borderRadius: '6px', zIndex: '9999', fontWeight: 'bold'
    });
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}

function saveDataToLocalStorage() {
    localStorage.setItem('heintah_members', JSON.stringify(officialMembersQueue));
    localStorage.setItem('heintah_expenses', JSON.stringify(expensesList));
    localStorage.setItem('heintah_aid_out', JSON.stringify(aidOutList));
    localStorage.setItem('heintah_initiatives', JSON.stringify(initiativesExpensesList));
    localStorage.setItem('heintah_villages', JSON.stringify(villagesList));
}

function loadStoredData() {
    if (localStorage.getItem('heintah_members')) officialMembersQueue = JSON.parse(localStorage.getItem('heintah_members'));
    if (localStorage.getItem('heintah_expenses')) expensesList = JSON.parse(localStorage.getItem('heintah_expenses'));
    if (localStorage.getItem('heintah_aid_out')) aidOutList = JSON.parse(localStorage.getItem('heintah_aid_out'));
    if (localStorage.getItem('heintah_initiatives')) initiativesExpensesList = JSON.parse(localStorage.getItem('heintah_initiatives'));
    if (localStorage.getItem('heintah_villages')) villagesList = JSON.parse(localStorage.getItem('heintah_villages'));
}