    // 4. رابط Forminit الخاص بك
    const FORM_ENDPOINT = "https://forminit.com/f/o76ei8qg6ii";

    // تحويل البيانات إلى FormData بدلاً من JSON
    const formDataObj = new FormData();
    for (const key in formData) {
        formDataObj.append(key, formData[key]);
    }

    // 5. إرسال البيانات إلى Forminit
    fetch(FORM_ENDPOINT, {
        method: 'POST',
        body: formDataObj // لا نضع headers هنا، المتصفح سيتكفل بذلك
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
        showNotification('حدث خطأ في الاتصال. يرجى التحقق من الإنترنت.', 'error');
    })
    .finally(() => {
        submitBtn.innerText = originalBtnText;
        submitBtn.disabled = false;
    });
