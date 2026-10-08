/**
 * الموقع التعريفي لجمعية حنطة الخيرية التنموية
 * تم التطوير بواسطة: طارق ابراهيم
 */

document.addEventListener('DOMContentLoaded', () => {
    initFormValidation();
});

// التحقق من صحة المدخلات
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

// معالجة إرسال الاستمارة
document.getElementById('membershipForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // التحقق من الرقم الوطني
    const nationalId = document.getElementById('nationalId').value;
    if (nationalId.length !== 11) {
        showNotification('عذراً، الرقم الوطني يجب أن يكون مؤلفاً من 11 رقماً بدقة.', 'error');
        return;
    }

    // جمع البيانات
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

    // ==========================================
    // ⚠️ هام جداً: استبدل الرابط التالي برابط Formspree الخاص بك
    // ==========================================
    const FORMSPREE_ENDPOINT = "https://formspree.io/f/YOUR_FORM_ID"; 
    
    // ⚠️ قم بإزالة علامات التعليق /* و */ من حول كود fetch التالي لتفعيل الإرسال الحقيقي
    /*
    fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
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
        showNotification('حدث خطأ في الاتصال. يرجى التحقق من الإنترنت.', 'error');
    });
    */

    // محاكاة النجاح (للتجربة فقط، احذف هذا السطر عند تفعيل الإرسال الحقيقي)
    showNotification('تم إرسال طلب الانتساب بنجاح! (محاكاة)', 'success');
    document.getElementById('membershipForm').reset();
});

// دالة إظهار التنبيهات
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
        boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
    });
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}
