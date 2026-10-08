/**
 * الموقع التعريفي لجمعية حنطة الخيرية التنموية
 * الحل: حفظ الطلبات مباشرة في GitHub Issues
 */

document.addEventListener('DOMContentLoaded', () => {
    initFormValidation();
});

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

document.getElementById('membershipForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const nationalId = document.getElementById('nationalId').value;
    if (nationalId.length !== 11) {
        showNotification('عذراً، الرقم الوطني يجب أن يكون 11 رقماً.', 'error');
        return;
    }

    // 1. جمع البيانات
    const formData = {
        fullName: document.getElementById('fullName').value,
        fatherName: document.getElementById('fatherName').value,
        motherName: document.getElementById('motherName').value,
        birthPlaceDate: document.getElementById('birthPlaceDate').value,
        nationalId: nationalId,
        education: document.getElementById('education').value,
        job: document.getElementById('job').value,
        whatsapp: document.getElementById('whatsapp').value,
        experience: document.getElementById('experience').value,
        certificates: document.getElementById('certificates').value,
        date: new Date().toLocaleDateString('ar-SY')
    };

    // 2. إعداد زر الإرسال
    const submitBtn = document.querySelector('#membershipForm button[type="submit"]');
    const originalBtnText = submitBtn.innerText;
    submitBtn.innerText = '⏳ جاري الإرسال...';
    submitBtn.disabled = true;

    // ==========================================
    // ⚠️ إعدادات GitHub (يجب تعديل هذه القيم)
    // ==========================================
    const GITHUB_TOKEN = "YOUR_GITHUB_TOKEN_HERE"; // ضع الرمز المميز هنا
    const OWNER = "tarekbrooo5-eng";               // اسم حسابك في GitHub
    const REPO = "heinta-association";             // اسم المستودع

    // تجهيز نص الطلب (Issue)
    const issueTitle = `طلب انتساب جديد: ${formData.fullName}`;
    const issueBody = `
**الاسم:** ${formData.fullName}
**اسم الأب:** ${formData.fatherName}
**اسم الأم:** ${formData.motherName}
**مكان وتاريخ الميلاد:** ${formData.birthPlaceDate}
**الرقم الوطني:** ${formData.nationalId}
**المؤهل العلمي:** ${formData.education}
**المهنة:** ${formData.job}
**رقم الواتساب:** ${formData.whatsapp}
**الخبرات:** ${formData.experience}
**الشهادات:** ${formData.certificates}
**تاريخ التقديم:** ${formData.date}
    `;

    // 3. إرسال الطلب إلى GitHub API
    fetch(`https://api.github.com/repos/${OWNER}/${REPO}/issues`, {
        method: 'POST',
        headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            title: issueTitle,
            body: issueBody,
            labels: ["membership-request"] // إضافة تصنيف لسهولة البحث
        })
    })
    .then(response => {
        if (response.ok) {
            showNotification('تم إرسال طلب الانتساب بنجاح! سيتم مراجعته من قبل الإدارة.', 'success');
            document.getElementById('membershipForm').reset();
        } else {
            showNotification('حدث خطأ أثناء الإرسال. يرجى المحاولة لاحقاً.', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('حدث خطأ في الاتصال.', 'error');
    })
    .finally(() => {
        submitBtn.innerText = originalBtnText;
        submitBtn.disabled = false;
    });
});

function showNotification(message, type = 'success') {
    let existing = document.getElementById('toastNotification');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.id = 'toastNotification';
    toast.innerText = message;
    Object.assign(toast.style, {
        position: 'fixed', bottom: '25px', left: '50%', transform: 'translateX(-50%)',
        backgroundColor: type === 'success' ? '#4A7C59' : '#c0392b', color: '#fff',
        padding: '12px 25px', borderRadius: '8px', zIndex: '9999', fontWeight: 'bold',
        boxShadow: '0 5px 15px rgba(0,0,0,0.2)', textAlign: 'center', minWidth: '250px'
    });
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}
