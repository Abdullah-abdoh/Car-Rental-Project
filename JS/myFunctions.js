/* ==========================================
   myFunctions.js - السكريبت الموحد والنهائي للموقع
   ========================================== */

(function() {
    var savedTheme = localStorage.getItem('site_theme');
    if (savedTheme) {
        if (savedTheme === 'dark') {
            document.documentElement.classList.add('dark-mode');
        }
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark-mode');
    }
})();

$(document).ready(function() {

    // 1. إدارة الثيم والقائمة الجانبية
    $('#themeToggleBtn').on('click', function() {
        document.documentElement.classList.toggle('dark-mode');
        var isDark = document.documentElement.classList.contains('dark-mode');
        localStorage.setItem('site_theme', isDark ? 'dark' : 'light');
    });

    $('#menuToggleBtn').on('click', function() {
        $('.nav-links').toggleClass('mobile-open');
        var $icon = $(this).find('i');
        if ($('.nav-links').hasClass('mobile-open')) {
            $icon.removeClass('fa-bars').addClass('fa-times');
        } else {
            $icon.removeClass('fa-times').addClass('fa-bars');
        }
    });

    $('.nav-links a').on('click', function() {
        if ($('.nav-links').hasClass('mobile-open')) {
            $('.nav-links').removeClass('mobile-open');
            $('#menuToggleBtn').find('i').removeClass('fa-times').addClass('fa-bars');
        }
    });

    // 2. تحديد اللون النشط عند فتح الصفحة لأول مرة
    function setInitialActiveNav() {
        var currentPath = window.location.pathname.split("/").pop();
        var currentHash = window.location.hash;
        
        if (currentPath === "" || currentPath === "index.html") currentPath = "home.html";
        $('.nav-links a').removeClass('active-nav');
        
        if (currentHash) {
            $('.nav-links a[href$="' + currentHash + '"]').addClass('active-nav');
        } else if (currentPath === "AboutUs.html") {
            $('.nav-links a[href$="#welcome-section"]').addClass('active-nav');
        } else if (currentPath === "Cars.html") {
            $('.nav-links a[href$="#cars-section"]').addClass('active-nav');
        } else {
            $('.nav-links a[href="' + currentPath + '"]').addClass('active-nav');
        }
    }
    setInitialActiveNav();

    // 3. تتبع التمرير (ScrollSpy) المطور الذي يتجاهل الأقسام المخفية!
    $(window).on('scroll', function() {
        var scrollPos = $(window).scrollTop() + 200;
        var windowHeight = $(window).height();
        var documentHeight = $(document).height();

        // التفعيل للفوتر عند الوصول لأسفل الصفحة
        if ((windowHeight + $(window).scrollTop()) >= documentHeight - 40) {
            $('.nav-links a').removeClass('active-nav');
            $('.nav-links a[href$="#footer-section"]').addClass('active-nav');
            return;
        }

        var activeId = null;
        $('.section').each(function() {
            // الشرط الذهبي: نعالج السكشن فقط إذا كان ظاهراً على الشاشة (ليس مخفياً)
            if ($(this).is(':visible')) {
                var top = $(this).offset().top;
                var height = $(this).outerHeight();
                var id = $(this).attr('id');

                if (id && scrollPos >= top && scrollPos < top + height) {
                    activeId = id;
                }
            }
        });

        if (activeId) {
            var $link = $('.nav-links a[href$="#' + activeId + '"]');
            if ($link.length) {
                $('.nav-links a').removeClass('active-nav');
                $link.addClass('active-nav');
            }
        }
    });

    // 4. التمرير الناعم ضمن نفس الصفحة
    $('.nav-links a').on('click', function(e) {
        var targetUrl = $(this).attr('href');
        var hashIndex = targetUrl.indexOf('#');
        
        if (hashIndex !== -1) {
            var hash = targetUrl.substring(hashIndex);
            var page = targetUrl.substring(0, hashIndex);
            var currentPath = window.location.pathname.split("/").pop();
            
            if (page === "" || page === currentPath) {
                e.preventDefault();
                var $targetElem = $(hash);
                // تأكد من أن السكشن المستهدف موجود ومرئي
                if ($targetElem.length && $targetElem.is(':visible')) {
                    $('.nav-links a').removeClass('active-nav');
                    $(this).addClass('active-nav');

                    var offsetTop = ($targetElem.is('#footer-section')) ? $targetElem.offset().top : $targetElem.offset().top - 70;

                    $('html, body').animate({
                        scrollTop: offsetTop
                    }, 500);
                }
            }
        }
    });

    // ==========================================
    // 5. برمجيات السيارات ونموذج الحجز
    // ==========================================
    $('.toggle-details-checkbox').on('change', function() {
        var $detailsRow = $(this).closest('tr').next('.car-details-row');
        if ($(this).is(':checked')) {
            $detailsRow.stop(true, true).fadeIn(300);
        } else {
            $detailsRow.stop(true, true).fadeOut(200);
        }
    });

    $('#proceedBtn').on('click', function() {
        var selectedCount = $('.car-select-checkbox:checked').length;
        if (selectedCount === 0) {
            alert('الرجاء اختيار سيارة واحدة على الأقل من الجدول للمتابعة.');
            return;
        }
        $('#bookingFormSection').stop(true, true).slideDown(500);
        $('html, body').animate({
            scrollTop: $('#bookingFormSection').offset().top - 70
        }, 500);
    });

    $('#rentalForm').on('submit', function(e) {
        e.preventDefault();
        let isValid = true;

        let fullName = $('#fullName').val().trim();
        let nationalId = $('#nationalId').val().trim();
        let startDate = $('#startDate').val();
        let endDate = $('#endDate').val();
        let mobile = $('#mobileNo').val().trim();
        let email = $('#emailAddr').val().trim();

        $('.error-msg').text('');

        let arabicRegex = /^[\u0600-\u06FF\s]+$/;
        if (fullName !== '' && !arabicRegex.test(fullName)) {
            $('#nameError').text('الاسم يجب أن يتكون من أحرف هجائية عربية فقط.');
            isValid = false;
        }

        let idRegex = /^(0[1-9]|1[0-4])[0-9]{9}$/;
        if (!idRegex.test(nationalId)) {
            $('#idError').text('الرقم الوطني غير صالح (يجب أن يكون 11 خانة وتبدأ المحافظة بـ 01 إلى 14).');
            isValid = false;
        }

        if (!startDate || !endDate) {
            $('#startError').text('تاريخ البداية والنهاية إلزاميان.');
            isValid = false;
        } else {
            let startD = new Date(startDate);
            let endD = new Date(endDate);
            if (endD <= startD) {
                $('#endError').text('تاريخ النهاية يجب أن يكون لاحقاً لتاريخ البداية.');
                isValid = false;
            }
        }

        let mobileRegex = /^09[345689][0-9]{7}$/;
        if (!mobileRegex.test(mobile)) {
            $('#mobileError').text('رقم الموبايل غير صالح (يجب أن يتبع شبكتي Syriatel أو MTN).');
            isValid = false;
        }

        if (email !== '') {
            let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                $('#emailError').text('البريد الإلكتروني غير صالح.');
                isValid = false;
            }
        }

        if (isValid) {
            let startD = new Date(startDate);
            let endD = new Date(endDate);
            let diffTime = Math.abs(endD - startD);
            let rentalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            let totalAmount = 0;
            let htmlDetails = '<p><strong>اسم المستأجر:</strong> ' + fullName + '</p>';
            htmlDetails += '<p><strong>مدة التأجير:</strong> ' + rentalDays + ' أيام</p><hr/>';
            htmlDetails += '<ul>';

            $('.car-select-checkbox:checked').each(function() {
                let carName = $(this).val();
                let dailyPrice = parseFloat($(this).attr('data-price'));
                let carTotal = dailyPrice * rentalDays;
                totalAmount += carTotal;

                htmlDetails += '<li><strong>' + carName + '</strong>: ' + rentalDays + ' أيام × ' + dailyPrice.toLocaleString() + ' ل.س = ' + carTotal.toLocaleString() + ' ل.س</li>';
            });

            htmlDetails += '</ul><hr/>';

            let discountApplied = false;
            if (rentalDays > 7) {
                let discount = totalAmount * 0.10;
                totalAmount -= discount;
                discountApplied = true;
                htmlDetails += '<p class="discount-notice">تم تطبيق خصم 10% لتجاوز مدة التأجير 7 أيام.</p>';
            }

            htmlDetails += '<h4 class="final-total">المبلغ الإجمالي النهائي: ' + totalAmount.toLocaleString() + ' ل.س</h4>';

            $('#resultContentBody').html(htmlDetails);
            $('#resultModal').css('display', 'flex').hide().fadeIn(300);
        }
    });

    $('#closeResultModal, #resultModal').on('click', function(e) {
        if (e.target === this) {
            $('#resultModal').fadeOut(200);
        }
    });

});