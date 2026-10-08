/**
 * الموقع التعريفي لجمعية حنطة الخيرية التنموية
 * تم التطوير بواسطة: طارق ابراهيم
 */

document.addEventListener('DOMContentLoaded', () => {
    initFormValidation();
});

// التحقق من صحة المدخلات (الرقم الوطني والواتساب)
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
    
    // 1. التحقق من الرقم الوطني
    const nationalId = document.getElementById('nationalId').value;
    if (nationalId.length !== 11) {
        showNotification('عذراً، الرقم الوطني يجب أن يكون مؤلفاً من 11 رقماً بدقة.', 'error');
        return;
    }

    // 2. جمع البيانات من الحقول
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

    // 3. إعداد زر الإرسال (تعطيله وتغيير النص أثناء الإرسال)
    const submitBtn = document.querySelector('#membershipForm button[type="submit"]');
    const originalBtnText = submitBtn.innerText;
    submitBtn.innerText = '⏳ جاري الإرسال...';
    submitBtn.disabled = true;

    // 4. رابط Forminit الخاص بك
    const FORM_ENDPOINT = "https://forminit.com/f/o76ei8qg6ii";

    // 5. إرسال البيانات إلى Forminit
    fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => {
        if (response.ok) {
            // نجاح الإرسال
            showNotification('تم إرسال طلب الانتساب بنجاح! سيتم مراجعته من قبل الإدارة.', 'success');
            document.getElementById('membershipForm').reset();
        } else {
            // فشل الإرسال من جهة السيرفر
            showNotification('حدث خطأ أثناء الإرسال. يرجى المحاولة لاحقاً.', 'error');
        }
    })
    .catch(error => {
        // فشل الاتصال بالإنترنت
        console.error('Error:', error);
        showNotification('حدث خطأ في الاتصال. يرجى التحقق من الإنترنت.', 'error');
    })
    .finally(() => {
        // إعادة زر الإرسال لحالته الطبيعية في كل الحالات
        submitBtn.innerText = originalBtnText;
        submitBtn.disabled = false;
    });
});

// دالة إظهار التنبيهات (Toast Notification)
function showNotification(message, type = 'success') {
    let existing = document.getElementById('toastNotification');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'toastNotification';
    toast.innerText = message;
    Object.assign(toast.style, {
        position: 'fixed', 
        bottom: '25px', 
        left: '50%', 
        transform: 'translateX(-50%)',
        backgroundColor: type === 'success' ? '#4A7C59' : '#c0392b', 
        color: '#fff',
        padding: '12px 25px', 
        borderRadius: '8px', 
        zIndex: '9999', 
        fontWeight: 'bold',
        boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
        textAlign: 'center',
        minWidth: '250px'
    });
    document.body.appendChild(toast);
    
    // إخفاء التنبيه بعد 4 ثواني
    setTimeout(() => {
        if(toast) toast.remove();
    }, 4000);
}
