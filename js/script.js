/* =========================================
   Tourism Website JavaScript - ملف الجافا سكريبت الرئيسي
   يحتوي على jQuery و Ajax و Validation و Toast Notifications
   ========================================= */

// ===== 1. تهيئة الوثيقة عند تحميل الصفحة =====
$(document).ready(function() {
    console.log('تم تحميل الموقع السياحي بنجاح!');
    
    // تهيئة المكونات الرئيسية
    initializeComponents();
    
    // تهيئة أحداث النماذج
    initializeFormEvents();
    
    // تهيئة أحداث الموديل والتوست
    initializeModalEvents();
    
    // تفعيل التأثيرات التفاعلية
    initializeAnimations();
});

// ===== 2. تهيئة المكونات الرئيسية =====
function initializeComponents() {
    // تهيئة شريط الصور المتحرك (WowSlider سيتولى هذا تلقائياً)
    console.log('تم تهيئة شريط الصور المتحرك');
    
    // إضافة تأثيرات على البطاقات
    $('.destination-card').on('mouseenter', function() {
        $(this).addClass('animate__animated animate__pulse');
    }).on('mouseleave', function() {
        $(this).removeClass('animate__animated animate__pulse');
    });
    
    // تفعيل شريط التمرير السلس
    $('a[href^="#"]').on('click', function(e) {
        e.preventDefault();
        var target = this.hash;
        if ($(target).length) {
            $('html, body').animate({
                scrollTop: $(target).offset().top - 70
            }, 800);
        }
    });
}

// ===== 3. تهيئة أحداث النماذج مع Validation =====
function initializeFormEvents() {
    
    // ===== أ. نموذج الحجز السريع =====
    $('.booking-form').on('submit', function(e) {
        e.preventDefault();
        
        // التحقق من صحة البيانات
        if (validateBookingForm()) {
            // إرسال البيانات (محاكاة)
            processBooking();
        }
    });
    
    // ===== ب. نموذج الاشتراك في النشرة =====
    $('.newsletter-form').on('submit', function(e) {
        e.preventDefault();
        
        const email = $(this).find('input[type="email"]').val();
        
        // التحقق من صحة البريد الإلكتروني
        if (validateEmail(email)) {
            // محاكاة إرسال الاشتراك
            showToast('تم الاشتراك بنجاح!', 'احصل على أحدث العروض والأخبار في بريدك الإلكتروني.', 'success');
            $(this)[0].reset();
        } else {
            showToast('خطأ في البريد الإلكتروني', 'يرجى إدخال بريد إلكتروني صحيح.', 'error');
        }
    });
    
    // ===== ج. التحقق المباشر من الحقول =====
    $('input, select').on('blur', function() {
        validateField($(this));
    });
    
    // منع إدخال التواريخ السابقة
    const today = new Date().toISOString().split('T')[0];
    $('#checkin, #checkout').attr('min', today);
    
    // التحقق من تاريخ المغادرة بعد تاريخ الوصول
    $('#checkin').on('change', function() {
        const checkinDate = $(this).val();
        $('#checkout').attr('min', checkinDate);
        
        // إذا كان تاريخ المغادرة أقل من تاريخ الوصول، امحه
        if ($('#checkout').val() && $('#checkout').val() <= checkinDate) {
            $('#checkout').val('');
        }
    });
}

// ===== 4. دوال التحقق من صحة البيانات (Validation) =====

// التحقق من نموذج الحجز
function validateBookingForm() {
    let isValid = true;
    const requiredFields = ['#destination', '#travelers', '#checkin', '#checkout'];
    
    requiredFields.forEach(function(field) {
        const $field = $(field);
        if (!$field.val() || $field.val().trim() === '') {
            showFieldError($field, 'هذا الحقل مطلوب');
            isValid = false;
        } else {
            clearFieldError($field);
        }
    });
    
    // التحقق من عدد المسافرين
    const travelers = parseInt($('#travelers').val());
    if (travelers && (travelers < 1 || travelers > 10)) {
        showFieldError($('#travelers'), 'عدد المسافرين يجب أن يكون بين 1 و 10');
        isValid = false;
    }
    
    // التحقق من التواريخ
    const checkinDate = new Date($('#checkin').val());
    const checkoutDate = new Date($('#checkout').val());
    const today = new Date();
    
    if (checkinDate < today) {
        showFieldError($('#checkin'), 'تاريخ الوصول لا يمكن أن يكون في الماضي');
        isValid = false;
    }
    
    if (checkoutDate <= checkinDate) {
        showFieldError($('#checkout'), 'تاريخ المغادرة يجب أن يكون بعد تاريخ الوصول');
        isValid = false;
    }
    
    return isValid;
}

// التحقق من حقل واحد
function validateField($field) {
    const fieldType = $field.attr('type') || $field.prop('tagName').toLowerCase();
    const value = $field.val();
    
    // إذا كان الحقل فارغاً وليس مطلوباً، فهو صحيح
    if (!value && !$field.prop('required')) {
        clearFieldError($field);
        return true;
    }
    
    switch(fieldType) {
        case 'email':
            if (!validateEmail(value)) {
                showFieldError($field, 'يرجى إدخال بريد إلكتروني صحيح');
                return false;
            }
            break;
            
        case 'number':
            const min = parseInt($field.attr('min'));
            const max = parseInt($field.attr('max'));
            const num = parseInt(value);
            
            if (isNaN(num) || (min && num < min) || (max && num > max)) {
                showFieldError($field, `يرجى إدخال رقم صحيح بين ${min || 1} و ${max || 100}`);
                return false;
            }
            break;
            
        case 'date':
            const inputDate = new Date(value);
            const today = new Date();
            
            if (inputDate < today) {
                showFieldError($field, 'لا يمكن اختيار تاريخ في الماضي');
                return false;
            }
            break;
    }
    
    clearFieldError($field);
    return true;
}

// التحقق من صحة البريد الإلكتروني
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// عرض خطأ في الحقل
function showFieldError($field, message) {
    $field.addClass('is-invalid');
    $field.removeClass('is-valid');
    
    // إزالة رسالة الخطأ السابقة
    $field.next('.invalid-feedback').remove();
    
    // إضافة رسالة خطأ جديدة
    $field.after(`<div class="invalid-feedback">${message}</div>`);
}

// مسح خطأ الحقل
function clearFieldError($field) {
    $field.removeClass('is-invalid');
    $field.addClass('is-valid');
    $field.next('.invalid-feedback').remove();
}

// ===== 5. معالجة الحجز =====
function processBooking() {
    // إظهار مؤشر التحميل
    const $submitBtn = $('.booking-form button[type="submit"]');
    const originalText = $submitBtn.text();
    
    $submitBtn.prop('disabled', true)
              .html('<i class="fas fa-spinner fa-spin"></i> جاري الحجز...');
    
    // محاكاة إرسال البيانات (Ajax مع تأخير)
    setTimeout(function() {
        // إرجاع الزر لحالته الأصلية
        $submitBtn.prop('disabled', false).text(originalText);
        
        // عرض Toast للنجاح
        showBookingToast();
        
        // مسح النموذج
        $('.booking-form')[0].reset();
        $('.booking-form .is-valid').removeClass('is-valid');
        
        console.log('تم إرسال طلب الحجز بنجاح!');
    }, 2000);
}

// ===== 6. إدارة النوافذ المنبثقة (Modal) مع Ajax =====
function initializeModalEvents() {
    // عند فتح موديل الوجهة
    $('#destinationModal').on('show.bs.modal', function(event) {
        const modal = $(this);
        const modalBody = modal.find('#modalBody');
        
        // إظهار مؤشر التحميل
        modalBody.html(`
            <div class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">جاري التحميل...</span>
                </div>
                <p class="mt-3">جاري تحميل التفاصيل...</p>
            </div>
        `);
    });
}

// عرض تفاصيل الوجهة في الموديل باستخدام Ajax
function showDestinationModal(destinationId) {
    const destination = getDestinationData(destinationId);
    const modalTitle = $('#modalTitle');
    const modalBody = $('#modalBody');
    
    // تحديث عنوان الموديل
    modalTitle.text(`تفاصيل Destination ${destinationId}`);
    
    // محاكاة طلب Ajax لجلب البيانات
    setTimeout(function() {
        const destinationData = getDestinationData(destinationId);
        
        modalBody.html(`
            <div class="row">
                <div class="col-md-6">
                    <img src="${destinationData.image}" class="img-fluid rounded" alt="${destinationData.name}">
                </div>
                <div class="col-md-6">
                    <h4 class="mb-3">${destinationData.name}</h4>
                    <p class="mb-3">${destinationData.description}</p>
                    <ul class="list-unstyled">
                        <li><i class="fas fa-map-marker-alt text-primary"></i> <strong>الموقع:</strong> ${destinationData.location}</li>
                        <li><i class="fas fa-clock text-primary"></i> <strong>أفضل وقت للزيارة:</strong> ${destinationData.bestTime}</li>
                        <li><i class="fas fa-star text-warning"></i> <strong>التقييم:</strong> ${destinationData.rating}/5</li>
                        <li><i class="fas fa-dollar-sign text-success"></i> <strong>السعر:</strong> ابتداءً من ${destinationData.price} ريال</li>
                    </ul>
                    <div class="mt-4">
                        <h5>الأنشطة المتاحة:</h5>
                        <div class="d-flex flex-wrap gap-2">
                            ${destinationData.activities.map(activity => 
                                `<span class="badge bg-primary">${activity}</span>`
                            ).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `);
    }, 1000);
    
    // عرض الموديل
    modal.modal('show');
}

// بيانات الوجهات (محاكاة قاعدة البيانات)
function getDestinationData(destinationId) {
    const historicalData = {
        'saba': {
            name: 'مملكة سبأ العظيمة',
            description: 'مملكة سبأ كانت من أعظم الحضارات في الشرق الأدنى القديم. حكمتها الملكة بلقيس وازدهرت بتجارة البخور والعطور.',
            period: 'قبل 950 عام',
            duration: 'عدة قرون',
            achievements: ['بناء سد مأرب العظيم', 'تجارة البخور والعطور', 'الهندسة المعمارية الفريدة']
        },
        'modern_yemen': {
            name: 'اليمن في العصر الحديث',
            description: 'شهد اليمن في القرن العشرين تغييرات جذرية مع قيام الجمهورية والتطوير الحضاري. الصورة تظهر باب اليمن في الثمانينات.',
            period: '1962-1990 م',
            duration: '28 عاماً',
            achievements: ['قيام الجمهورية العربية اليمنية', 'التطوير الحضاري', 'بناء المؤسسات الحديثة']
        },
        'culture': {
            name: 'التراث والثقافة اليمنية',
            description: 'يتميز التراث اليمني بغناه وتنوعه. من الأزياء الشعبية والجنبية إلى الغناء والرقص والحرف اليدوية.',
            period: 'تراث مستمر',
            duration: 'عبر العصور',
            achievements: ['الأزياء الشعبية المتنوعة', 'الجنبية رمز الرجولة', 'الغناء والشعر الشعبي']
        }
    };
    
    return historicalData[destinationId] || null;
}

// ===== 7. Toast Notifications =====

// عرض إشعار الحجز
function showBookingToast(event) {
    if (event) {
        event.preventDefault();
    }
    
    const toastElement = document.getElementById('bookingToast');
    const toast = new bootstrap.Toast(toastElement, {
        autohide: true,
        delay: 5000
    });
    
    toast.show();
}

// عرض إشعار مخصص
function showToast(title, message, type = 'success') {
    // إنشاء Toast ديناميكي
    const toastId = 'toast-' + Date.now();
    const iconClass = type === 'success' ? 'fa-check-circle text-success' : 'fa-exclamation-circle text-danger';
    
    const toastHTML = `
        <div id="${toastId}" class="toast" role="alert" style="z-index: 9999;">
            <div class="toast-header">
                <i class="fas ${iconClass} me-2"></i>
                <strong class="me-auto">${title}</strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        </div>
    `;
    
    // إضافة Toast إلى الحاوية
    $('.toast-container').append(toastHTML);
    
    // عرض Toast
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, {
        autohide: true,
        delay: 4000
    });
    
    toast.show();
    
    // إزالة Toast من DOM بعد إخفائه
    toastElement.addEventListener('hidden.bs.toast', function() {
        $(this).remove();
    });
}

// ===== 8. التأثيرات والرسوم المتحركة =====
function initializeAnimations() {
    // تأثير الظهور التدريجي عند التمرير
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // مراقبة العناصر للرسم المتحرك
    $('.destination-card, .sidebar-widget, .quick-booking').each(function() {
        observer.observe(this);
    });
    
    // تأثير النقر على الأزرار
    $('.btn').on('click', function() {
        $(this).addClass('btn-animated');
        setTimeout(() => {
            $(this).removeClass('btn-animated');
        }, 600);
    });
}

// ===== 9. وظائف مساعدة =====

// تحديث عداد المسافرين في الوقت الفعلي
$('#travelers').on('input', function() {
    const count = $(this).val();
    if (count) {
        console.log(`تم اختيار ${count} مسافر/مسافرين`);
    }
});

// حفظ تفضيلات المستخدم في localStorage
function saveUserPreference(key, value) {
    localStorage.setItem('tourism_' + key, JSON.stringify(value));
}

// استرجاع تفضيلات المستخدم
function getUserPreference(key) {
    const item = localStorage.getItem('tourism_' + key);
    return item ? JSON.parse(item) : null;
}

// ===== 10. معالجة الأخطاء =====
window.addEventListener('error', function(e) {
    console.error('حدث خطأ في الموقع:', e.error);
    
    // إظهار رسالة خطأ ودية للمستخدم
    showToast('حدث خطأ', 'عذراً، حدث خطأ غير متوقع. يرجى إعادة تحميل الصفحة.', 'error');
});

// ===== 11. API للتفاعل مع الخادم (محاكاة) =====
const TourismAPI = {
    // جلب الوجهات
    getDestinations: function() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve([
                    { id: 'A', name: 'Destination A', price: 1200 },
                    { id: 'B', name: 'Destination B', price: 900 },
                    { id: 'C', name: 'Destination C', price: 1500 }
                ]);
            }, 1000);
        });
    },
    
    // إرسال طلب حجز
    submitBooking: function(bookingData) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                console.log('تم إرسال طلب الحجز:', bookingData);
                resolve({ success: true, bookingId: 'B' + Date.now() });
            }, 2000);
        });
    }
};

// ===== 12. تهيئة أحداث إضافية =====
$(window).on('scroll', function() {
    // إضافة تأثير للـ navbar عند التمرير
    if ($(window).scrollTop() > 100) {
        $('.navbar').addClass('navbar-scrolled');
    } else {
        $('.navbar').removeClass('navbar-scrolled');
    }
});

// طباعة رسالة في Console عند اكتمال التحميل
console.log(`
🌟 تم تحميل موقع السياحة بنجاح!
📅 التاريخ: ${new Date().toLocaleDateString('ar-SA')}
⏰ الوقت: ${new Date().toLocaleTimeString('ar-SA')}
🎯 جميع الميزات متاحة ومفعلة
`);

/* ===== نهاية ملف JavaScript ===== */