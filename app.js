/* ============================================
   HUD COM - النظام المحكم v10.0
   - شراء مباشر بدون سلة
   - جميع بيانات العميل اختيارية
   - كشف الزبون المتكرر
   - إرسال كل التفاصيل حتى الفارغة
   - نوافذ منبثقة متعددة (متتابعة)
   - خلفية ديناميكية حسب القسم
   - علامة مائية ذكية
   - دعم تعدد العملات
============================================ */

// ===== الطلب الحالي =====
let cart = []; // محجوزة للتوافق مع الكود القديم - لن تُستخدم

// ===== عند فتح الصفحة =====
document.addEventListener('DOMContentLoaded', async function(){
  try {
    injectIcons();
    initNavScroll();
    initBackTop();
    renderWalletGrid();
    applySiteSettingsToUI();
  } catch(e) {
    console.error('خطأ في التهيئة:', e);
  }
});

// ===== تطبيق إعدادات الموقع على واجهة المستخدم =====
function applySiteSettingsToUI(){
  try {
    // تنسيق رقم الهاتف
    function formatPhone(num){
      if(!num) return '';
      // إزالة كل شيء ما عدا الأرقام
      const clean = num.replace(/\D/g, '');
      // تنسيق: XXX XXX XXX XXX
      if(clean.length >= 10){
        return '+' + clean.replace(/(\d{3})(\d{3})(\d{3})(\d{3})?/, '$1 $2 $3 $4').trim();
      }
      return '+' + clean;
    }

    // تحديث أرقام خدمة العملاء
    document.querySelectorAll('.support-phone-text, .footer-support-link .contact-number').forEach(function(el){
      el.textContent = formatPhone(SUPPORT_NUMBER);
    });

    document.querySelectorAll('.footer-support-link, #menuSupportLink').forEach(function(link){
      if(link.href && link.href.indexOf('tel:') === 0){
        link.href = 'tel:+' + SUPPORT_NUMBER.replace(/\D/g, '');
      }
    });

    // تحديث أرقام الإدارة
    document.querySelectorAll('.admin-phone-text, .footer-admin-link .contact-number').forEach(function(el){
      el.textContent = formatPhone(WHATSAPP_NUMBER);
    });

    document.querySelectorAll('.footer-admin-link, #menuAdminLink').forEach(function(link){
      if(link.href && link.href.indexOf('tel:') === 0){
        link.href = 'tel:+' + WHATSAPP_NUMBER.replace(/\D/g, '');
      }
    });

    // تحديث روابط القناة
    document.querySelectorAll('.footer-channel-link, #menuChannelLink').forEach(function(link){
      if(WHATSAPP_CHANNEL) link.href = WHATSAPP_CHANNEL;
    });

    // تحديث روابط الواتساب العائمة
    document.querySelectorAll('.floating-wa-link').forEach(function(link){
      link.href = 'https://wa.me/' + WHATSAPP_NUMBER.replace(/\D/g, '');
    });

    // تطبيق وضع العملة
    applyCurrencyMode();
  } catch(e) {
    console.error('خطأ في تطبيق الإعدادات:', e);
  }
}

// ===== تطبيق وضع العملة =====
function applyCurrencyMode(){
  try {
    if(!siteSettings) return;

    // يتم تطبيق وضع العملة عند عرض الأسعار في الواجهات الأخرى
    console.log('وضع العملة:', CURRENCY_DISPLAY_MODE, '- العملات النشطة:', ACTIVE_CURRENCIES);
  } catch(e) {
    console.error('خطأ في تطبيق وضع العملة:', e);
  }
}

// ===== تنسيق السعر حسب وضع العملة =====
function renderPriceDisplay(priceInYER, currency){
  try {
    if(CURRENCY_DISPLAY_MODE === 'multi' && ACTIVE_CURRENCIES.length > 1){
      // عرض جميع العملات
      const prices = formatPriceMultiCurrency(priceInYER);
      return prices.map(function(p, i){
        const code = ACTIVE_CURRENCIES[i];
        const flag = getCurrencyFlag(code);
        return '<span class="price-multi-item">' + flag + ' ' + p + '</span>';
      }).join(' • ');
    } else {
      // عرض العملة المحددة فقط
      const displayCurrency = currency || siteSettings.defaultCurrency || DEFAULT_CURRENCY;
      const converted = convertPrice(priceInYER, displayCurrency);
      return formatPrice(converted, displayCurrency);
    }
  } catch(e) {
    return priceInYER.toLocaleString() + ' ' + getCurrencyShort(currency || 'YER');
  }
}

// ===== حقن أيقونات SVG =====
function injectIcons(){
  try {
    document.querySelectorAll('[data-icon]').forEach(function(el){
      if(el.dataset.iconDone) return;
      const name = el.getAttribute('data-icon');
      const size = el.getAttribute('data-size') || 20;
      if(typeof icon === 'function'){
        el.innerHTML = icon(name, size) + el.innerHTML;
        el.dataset.iconDone = '1';
      }
    });
  } catch(e) {
    console.error('خطأ في حقن الأيقونات:', e);
  }
}

// ===== النافبار =====
function initNavScroll(){
  const navbar = document.getElementById('navbar');
  if(!navbar) return;
  window.addEventListener('scroll', function(){
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });
}

// ===== زر العودة للأعلى =====
function initBackTop(){
  const btn = document.getElementById('backTop');
  if(!btn) return;
  window.addEventListener('scroll', function(){
    btn.classList.toggle('show', window.scrollY > 400);
  });
}

// ===== القائمة الجانبية =====
function openMobileMenu(){
  const drawer = document.getElementById('menuDrawer');
  const overlay = document.getElementById('menuOverlay');
  if(drawer) drawer.classList.add('open');
  if(overlay) overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeMobileMenu(){
  const drawer = document.getElementById('menuDrawer');
  const overlay = document.getElementById('menuOverlay');
  if(drawer) drawer.classList.remove('open');
  if(overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
}

// ===== دوال السلة (معطلة - محجوزة للتوافق) =====
function openCart(){ /* معطلة - الشراء مباشر */ }
function closeCart(){ /* معطلة - الشراء مباشر */ }
function updateCartCount(){ /* معطلة */ }
function renderCartItems(){ /* معطلة */ }

// ===== بناء واجهة المحافظ بالصور =====
function renderWalletGrid(){
  try {
    const grid = document.getElementById('walletGrid');
    if (!grid || typeof WALLETS === 'undefined') return;

    const activeWallets = getActiveWallets();

    if(activeWallets.length === 0){
      grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:30px 20px; color:#888;">' +
        icon('wallet', 30) +
        '<p style="margin-top:10px;">لا توجد محافظ مفعلة</p>' +
      '</div>';
      return;
    }

    grid.innerHTML = activeWallets.map(function(w){
      const imgHTML = w.image
        ? '<img src="' + w.image + '" alt="' + w.name + '">'
        : '<div class="wallet-card-placeholder">' + w.name.charAt(0) + '</div>';

      return '<div class="wallet-card" data-wallet="' + w.id + '" onclick="selectWallet(\'' + w.id + '\')">' +
        '<div class="wallet-card-image">' + imgHTML + '</div>' +
        '<div class="wallet-card-name">' + w.name + '</div>' +
        '<div class="wallet-card-check">' + icon('check', 12) + '</div>' +
      '</div>';
    }).join('');

    injectIcons();
  } catch(e) {
    console.error('خطأ في عرض المحافظ:', e);
  }
}

// ===== اختيار محفظة =====
function selectWallet(id){
  try {
    const wallet = WALLETS.find(function(w){ return w.id === id; });
    if(!wallet) return;

    document.getElementById('custWallet').value = id;
    document.querySelectorAll('.wallet-card').forEach(function(c){
      c.classList.remove('selected');
    });
    const card = document.querySelector('.wallet-card[data-wallet="' + id + '"]');
    if(card) card.classList.add('selected');

    // إظهار رقم حساب المحفظة إن وُجد
    const accountInfo = document.getElementById('walletAccountInfo');
    const accountNumber = document.getElementById('walletAccountNumber');
    if(accountInfo && accountNumber){
      if(wallet.number && wallet.number.trim()){
        accountNumber.textContent = wallet.name + ': ' + wallet.number;
        accountInfo.style.display = 'flex';
      } else {
        accountNumber.textContent = wallet.name;
        accountInfo.style.display = 'flex';
      }
    }
  } catch(e) {
    console.error('خطأ في اختيار المحفظة:', e);
  }
}

// ===== النوافذ المنبثقة المتعددة (Multi-step Popups) =====
function showPopupsSequence(popups, onComplete){
  try {
    if(!popups || popups.length === 0){
      if(onComplete) onComplete();
      return;
    }

    currentPopups = popups;
    currentPopupIndex = 0;

    function showNext(){
      if(currentPopupIndex >= currentPopups.length){
        if(onComplete) onComplete();
        return;
      }

      const popup = currentPopups[currentPopupIndex];
      showSinglePopup(popup, function(){
        currentPopupIndex++;
        if(currentPopupIndex < currentPopups.length){
          // تأخير بسيط بين النوافذ
          setTimeout(showNext, 400);
        } else {
          if(onComplete) onComplete();
        }
      });
    }

    showNext();
  } catch(e) {
    console.error('خطأ في النوافذ المنبثقة:', e);
    if(onComplete) onComplete();
  }
}

function showSinglePopup(popup, onClose){
  try {
    // إزالة أي نافذة منبثقة سابقة
    const existing = document.getElementById('multiPopupContainer');
    if(existing) existing.remove();

    const container = document.createElement('div');
    container.id = 'multiPopupContainer';
    container.className = 'multi-popup-container';

    const isLast = currentPopupIndex === currentPopups.length - 1;
    const popupIndex = currentPopupIndex + 1;
    const totalPopups = currentPopups.length;

    const typeClass = popup.type || 'info';
    const typeIcons = {
      warning: 'alert',
      info: 'info',
      success: 'check',
      danger: 'alert'
    };
    const typeIcon = typeIcons[typeClass] || 'info';

    container.innerHTML = '<div class="multi-popup-overlay" onclick="closeMultiPopup()"></div>' +
      '<div class="multi-popup ' + typeClass + '">' +
        '<div class="multi-popup-header">' +
          '<div class="multi-popup-progress">' +
            '<div class="multi-popup-progress-bar" style="width:' + (popupIndex / totalPopups * 100) + '%"></div>' +
          '</div>' +
          '<div class="multi-popup-step">' + popupIndex + ' / ' + totalPopups + '</div>' +
          '<button class="multi-popup-close" onclick="closeMultiPopup()">' + icon('close', 18) + '</button>' +
        '</div>' +
        '<div class="multi-popup-body">' +
          '<div class="multi-popup-icon-wrap">' +
            '<div class="multi-popup-icon">' + icon(typeIcon, 32) + '</div>' +
          '</div>' +
          '<h3 class="multi-popup-title">' + (popup.title || '') + '</h3>' +
          (popup.image ? '<div class="multi-popup-image"><img src="' + popup.image + '" alt=""></div>' : '') +
          '<div class="multi-popup-content">' + (popup.content || '').replace(/\n/g, '<br>') + '</div>' +
        '</div>' +
        '<div class="multi-popup-footer">' +
          '<button class="btn btn-dark btn-full" onclick="skipMultiPopup()">' +
            icon('close', 14) + ' تخطي الكل' +
          '</button>' +
          '<button class="btn btn-gold btn-full" onclick="closeMultiPopup()">' +
            icon('arrow', 14) + ' ' + (popup.buttonText || (isLast ? 'متابعة الشراء' : 'التالي')) +
          '</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(container);
    document.body.style.overflow = 'hidden';

    // تخزين callback للاستخدام لاحقاً
    container._onClose = onClose;

    injectIcons();
  } catch(e) {
    console.error('خطأ في عرض النافذة المنبثقة:', e);
    if(onClose) onClose();
  }
}

function closeMultiPopup(){
  try {
    const container = document.getElementById('multiPopupContainer');
    if(container){
      const onClose = container._onClose;
      container.remove();
      document.body.style.overflow = '';
      if(onClose) onClose();
    }
  } catch(e) {
    console.error('خطأ في إغلاق النافذة:', e);
  }
}

function skipMultiPopup(){
  try {
    // تخطي جميع النوافذ
    currentPopupIndex = currentPopups.length;
    const container = document.getElementById('multiPopupContainer');
    if(container){
      const onClose = container._onClose;
      container.remove();
      document.body.style.overflow = '';
      // تنفيذ callback ثم تجاوز جميع النوافذ المتبقية
      if(onClose) onClose();
    }
  } catch(e) {
    console.error('خطأ في تخطي النوافذ:', e);
  }
}

// ===== الشراء المباشر - فتح نافذة العميل =====
function buyOffer(categoryId, itemId, offerId){
  try {
    const category = getCategory(categoryId);
    if(!category){
      showToast('القسم غير موجود');
      return;
    }

    if(!category.items || !Array.isArray(category.items)){
      showToast('لا توجد منتجات');
      return;
    }

    const item = category.items.find(function(i){ return i && i.id === itemId; });
    if(!item){
      showToast('المنتج غير موجود');
      return;
    }

    if(!item.offers || !Array.isArray(item.offers)){
      showToast('لا توجد عروض');
      return;
    }

    const offer = item.offers.find(function(o){ return o && o.id === offerId; });
    if(!offer){
      showToast('العرض غير موجود');
      return;
    }

    // تجهيز الطلب الحالي
    currentOrder = {
      categoryId: categoryId,
      itemId: itemId,
      offerId: offerId,
      categoryName: category.name || '',
      itemName: item.name || '',
      offerName: offer.name || '',
      image: offer.image || item.image || category.image || '',
      price: offer.price || 0,
      currency: offer.currency || DEFAULT_CURRENCY,
      item: item
    };

    // إظهار النوافذ المنبثقة المتعددة أولاً (إن وجدت)
    const popups = getItemPopups(item);

    showPopupsSequence(popups, function(){
      // بعد النوافذ، افتح نافذة العميل
      openCustomerModalWithFields(item);
    });
  } catch(e) {
    console.error('خطأ في الشراء:', e);
    showToast('حدث خطأ');
  }
}

// ===== فتح نافذة العميل مع الحقول الديناميكية =====
function openCustomerModalWithFields(item){
  try {
    const modal = document.getElementById('customerModal');
    const overlay = document.getElementById('customerOverlay');
    if(modal) modal.classList.add('open');
    if(overlay) overlay.classList.add('open');
    document.body.style.overflow = 'hidden';

    // إعادة ضبط الحقول
    resetCustomerForm();

    // إضافة الحقول الديناميكية للمنتج
    renderDynamicProductFields(item);

    // عرض تفاصيل الطلب
    showOrderDetailsInModal(currentOrder);

    // تحديث المجموع
    updateOrderTotalDisplay();

    // إعادة بناء شبكة المحافظ
    renderWalletGrid();

    // التحقق من الزبون المتكرر
    checkReturningCustomer();
  } catch(e) {
    console.error('خطأ في فتح نافذة العميل:', e);
    openCustomerModal();
  }
}

// ===== عرض الحقول الديناميكية للمنتج =====
function renderDynamicProductFields(item){
  try {
    const container = document.getElementById('dynamicFieldsContainer');
    if(!container) return;

    const fields = getProductFields(item);

    if(!fields || fields.length === 0){
      container.innerHTML = '';
      container.style.display = 'none';
      return;
    }

    container.style.display = 'block';

    const fieldTypeIcons = {
      text: 'edit',
      number: 'list',
      id: 'user',
      link: 'globe',
      note: 'info',
      email: 'send',
      password: 'lock'
    };

    container.innerHTML = '<div class="dynamic-fields-header">' +
      '<span class="dynamic-fields-icon">' + icon('package', 16) + '</span>' +
      '<span class="dynamic-fields-title">بيانات مطلوبة لـ ' + (item.name || 'هذا المنتج') + '</span>' +
    '</div>' +
    fields.map(function(field){
      const fieldIcon = fieldTypeIcons[field.type] || 'edit';
      const requiredMark = field.required ? '<span class="required">*</span>' : '<span class="optional">(اختياري)</span>';
      const inputType = field.type === 'number' ? 'tel' : 'text';

      return '<div class="form-group dynamic-field" data-field-id="' + field.id + '">' +
        '<label class="form-label">' +
          '<span data-icon="' + fieldIcon + '" data-size="16"></span>' +
          ' ' + field.label + ' ' +
          requiredMark +
        '</label>' +
        '<input type="' + inputType + '" class="form-input dynamic-field-input" ' +
          'data-field-id="' + field.id + '" ' +
          'data-field-label="' + field.label + '" ' +
          'placeholder="' + (field.placeholder || '') + '"' +
          (field.required ? ' required' : '') +
        '>' +
      '</div>';
    }).join('');

    injectIcons();
  } catch(e) {
    console.error('خطأ في عرض الحقول الديناميكية:', e);
  }
}

// ===== عرض تفاصيل الطلب في النافذة =====
function showOrderDetailsInModal(order){
  try {
    const wrap = document.getElementById('orderDetailsCard');
    if(!wrap) return;

    const imageHTML = order.image
      ? '<img src="' + order.image + '" alt="' + order.offerName + '">'
      : '<div class="placeholder">' + icon('package', 24) + '</div>';

    // عرض السعر حسب وضع العملة
    const priceDisplay = renderPriceDisplay(order.price, order.currency);

    wrap.innerHTML = '<div class="order-card">' +
      '<div class="order-card-image">' + imageHTML + '</div>' +
      '<div class="order-card-info">' +
        '<div class="order-card-category">' + order.categoryName + '</div>' +
        '<div class="order-card-item">' + order.itemName + '</div>' +
        '<div class="order-card-offer">' + order.offerName + '</div>' +
        '<div class="order-card-price">' + priceDisplay + '</div>' +
      '</div>' +
    '</div>';

    injectIcons();
  } catch(e) {
    console.error('خطأ:', e);
  }
}

// ===== تحديث المجموع في النافذة =====
function updateOrderTotalDisplay(){
  try {
    const totalEl = document.getElementById('modalTotal');
    if(!totalEl) return;

    if(currentOrder){
      const priceDisplay = renderPriceDisplay(currentOrder.price, currentOrder.currency);
      totalEl.innerHTML = priceDisplay;
    } else {
      totalEl.textContent = '0 ' + getCurrencyShort(DEFAULT_CURRENCY);
    }
  } catch(e) {}
}

// ===== فتح نافذة بيانات العميل =====
function openCustomerModal(){
  try {
    const modal = document.getElementById('customerModal');
    const overlay = document.getElementById('customerOverlay');
    if(modal) modal.classList.add('open');
    if(overlay) overlay.classList.add('open');
    document.body.style.overflow = 'hidden';

    // إعادة ضبط الحقول
    resetCustomerForm();

    // التحقق من الزبون المتكرر
    checkReturningCustomer();

    // إعادة بناء شبكة المحافظ
    renderWalletGrid();

    // تحديث المجموع
    updateOrderTotalDisplay();
  } catch(e) {
    console.error('خطأ في فتح النافذة:', e);
  }
}

// ===== إغلاق نافذة العميل =====
function closeCustomerModal(){
  try {
    const modal = document.getElementById('customerModal');
    const overlay = document.getElementById('customerOverlay');
    if(modal) modal.classList.remove('open');
    if(overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
  } catch(e) {}
}

// ===== إعادة ضبط نموذج العميل =====
function resetCustomerForm(){
  try {
    const fields = ['custName', 'custPhone', 'custGov', 'custCity', 'custAddress'];
    fields.forEach(function(id){
      const el = document.getElementById(id);
      if(el) el.value = '';
    });

    // إعادة ضبط الحقول الديناميكية
    document.querySelectorAll('.dynamic-field-input').forEach(function(input){
      input.value = '';
    });

    const walletInput = document.getElementById('custWallet');
    if(walletInput) walletInput.value = '';

    document.querySelectorAll('.wallet-card').forEach(function(c){
      c.classList.remove('selected');
    });

    const accountInfo = document.getElementById('walletAccountInfo');
    if(accountInfo) accountInfo.style.display = 'none';

    const usePrev = document.getElementById('usePreviousData');
    if(usePrev) usePrev.checked = false;
  } catch(e) {}
}

// ===== التحقق من الزبون المتكرر =====
function checkReturningCustomer(){
  try {
    const box = document.getElementById('returningCustomerBox');
    if(!box) return;

    if(!siteSettings.enableReturningCustomer){
      box.style.display = 'none';
      return;
    }

    if(hasPreviousOrder()){
      const prevData = getPreviousCustomerData();
      const lastDate = localStorage.getItem(LAST_ORDER_KEY);

      let dateText = '';
      if(lastDate){
        try {
          const d = new Date(lastDate);
          const day = d.getDate();
          const month = d.getMonth() + 1;
          const year = d.getFullYear();
          dateText = ' (' + day + '/' + month + '/' + year + ')';
        } catch(e) {}
      }

      box.innerHTML = '<div class="returning-customer-card">' +
        '<div class="returning-customer-icon">' + icon('whatsapp', 22) + '</div>' +
        '<div class="returning-customer-info">' +
          '<div class="returning-customer-title">عميل سابق - بياناتك محفوظة لدينا</div>' +
          '<div class="returning-customer-desc">آخر عملية شراء لك كانت' + dateText + '. يمكنك استخدام نفس البيانات أو إدخال بيانات جديدة.</div>' +
        '</div>' +
      '</div>' +
      '<label class="returning-customer-checkbox">' +
        '<input type="checkbox" id="usePreviousData" onchange="togglePreviousData(this.checked)">' +
        '<span class="checkmark"></span>' +
        '<span class="returning-customer-label">استخدام نفس البيانات من آخر طلب</span>' +
      '</label>' +
      '<div class="returning-customer-confirmed" id="returningCustomerConfirmed" style="display:none;">' +
        '<div class="returning-customer-confirmed-icon">' + icon('check', 16) + '</div>' +
        '<span>سيتم إخطار الإدارة تلقائياً بأنك تواصلت معنا مسبقاً</span>' +
      '</div>';

      box.style.display = 'block';
      injectIcons();
    } else {
      box.style.display = 'none';
    }
  } catch(e) {
    console.error('خطأ في التحقق من الزبون المتكرر:', e);
  }
}

// ===== تفعيل/تعطيل استخدام البيانات السابقة =====
function togglePreviousData(checked){
  try {
    const prevData = getPreviousCustomerData();
    if(!prevData) return;

    const fields = ['custName', 'custPhone', 'custGov', 'custCity', 'custAddress'];

    if(checked){
      fields.forEach(function(id){
        const el = document.getElementById(id);
        const fieldName = id.replace('cust', '').toLowerCase();
        if(el && prevData[fieldName]){
          el.value = prevData[fieldName];
        }
      });

      // إظهار رسالة التأكيد
      const confirmed = document.getElementById('returningCustomerConfirmed');
      if(confirmed){
        confirmed.style.display = 'flex';
      }

      showToast('تم تعبئة البيانات من آخر طلب');
    } else {
      fields.forEach(function(id){
        const el = document.getElementById(id);
        if(el) el.value = '';
      });

      const confirmed = document.getElementById('returningCustomerConfirmed');
      if(confirmed){
        confirmed.style.display = 'none';
      }
    }
  } catch(e) {
    console.error('خطأ:', e);
  }
}

// ===== إرسال الطلب للواتساب =====
function sendOrderToWhatsApp(e){
  e.preventDefault();

  try {
    // التحقق من اختيار المحفظة فقط
    const walletSelect = document.getElementById('custWallet');
    if(!walletSelect || !walletSelect.value){
      showToast('يرجى اختيار المحفظة');
      return;
    }

    if(!currentOrder){
      showToast('لا يوجد طلب لإرساله');
      return;
    }

    // التحقق من الحقول المطلوبة الديناميكية
    const requiredFields = document.querySelectorAll('.dynamic-field-input[required]');
    let missingFields = [];
    requiredFields.forEach(function(input){
      if(!input.value.trim()){
        const label = input.getAttribute('data-field-label') || input.getAttribute('placeholder') || 'حقل مطلوب';
        missingFields.push(label);
        input.style.borderColor = '#FF3D57';
      } else {
        input.style.borderColor = '';
      }
    });

    if(missingFields.length > 0){
      showToast('يرجى تعبئة: ' + missingFields.join('، '));
      return;
    }

    const name = document.getElementById('custName').value.trim();
    const phone = document.getElementById('custPhone').value.trim();
    const governorate = document.getElementById('custGov').value.trim();
    const city = document.getElementById('custCity').value.trim();
    const address = document.getElementById('custAddress').value.trim();

    // جمع الحقول الديناميكية
    const dynamicFields = {};
    document.querySelectorAll('.dynamic-field-input').forEach(function(input){
      const fieldId = input.getAttribute('data-field-id');
      const fieldLabel = input.getAttribute('data-field-label');
      if(fieldId && input.value.trim()){
        dynamicFields[fieldLabel || fieldId] = input.value.trim();
      }
    });

    const selectedWallet = WALLETS.find(function(w){ return w.id === walletSelect.value; });
    const walletName = selectedWallet ? selectedWallet.name : walletSelect.value;

    // التحقق من العميل السابق
    const isReturningCustomer = document.getElementById('usePreviousData')?.checked || false;
    const hasPreviousData = hasPreviousOrder();

    // ===== بناء رسالة الواتساب =====
    const priceDisplay = renderPriceDisplay(currentOrder.price, currentOrder.currency);

    let message = '🛒 *طلب جديد من متجر هود كوم*\n';
    message += '━━━━━━━━━━━━━━━━\n\n';

    // تفاصيل المنتج
    message += '📦 *تفاصيل الطلب:*\n\n';
    message += '▸ القسم: ' + currentOrder.categoryName + '\n';
    message += '▸ المنتج: ' + currentOrder.itemName + '\n';
    message += '▸ العرض: ' + currentOrder.offerName + '\n';
    message += '▸ السعر: ' + priceDisplay.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ') + '\n';
    message += '\n━━━━━━━━━━━━━━━━\n\n';

    // البيانات الديناميكية الخاصة بالمنتج
    if(Object.keys(dynamicFields).length > 0){
      message += '🎯 *بيانات خاصة بالمنتج:*\n\n';
      Object.keys(dynamicFields).forEach(function(key){
        message += '▸ ' + key + ': ' + dynamicFields[key] + '\n';
      });
      message += '\n━━━━━━━━━━━━━━━━\n\n';
    }

    // بيانات العميل - جميعها اختيارية مع توضيح الفارغ
    message += '👤 *بيانات العميل:*\n\n';

    // الاسم
    if(name){
      message += '✓ الاسم: ' + name + '\n';
    } else {
      message += '✗ الاسم: *(تركه فارغ)*\n';
    }

    // رقم الهاتف
    if(phone){
      message += '✓ رقم الهاتف: ' + phone + '\n';
    } else {
      message += '✗ رقم الهاتف: *(تركه فارغ)*\n';
    }

    // المحافظة
    if(governorate){
      message += '✓ المحافظة: ' + governorate + '\n';
    } else {
      message += '✗ المحافظة: *(تركه فارغ)*\n';
    }

    // المدينة
    if(city){
      message += '✓ المدينة: ' + city + '\n';
    } else {
      message += '✗ المدينة: *(تركه فارغ)*\n';
    }

    // العنوان
    if(address){
      message += '✓ العنوان: ' + address + '\n';
    } else {
      message += '✗ العنوان: *(تركه فارغ)*\n';
    }

    // إشارة العميل السابق
    if(isReturningCustomer){
      message += '\n🔄 *عميل سابق:* ✓ تم تأكيد استخدام البيانات السابقة\n';
    } else if(hasPreviousData){
      message += '\n🔄 *ملاحظة:* العميل لديه عمليات سابقة لكن لم يستخدم البيانات المحفوظة\n';
    }

    message += '\n━━━━━━━━━━━━━━━━\n\n';

    // معلومات الدفع
    message += '💳 *معلومات الدفع:*\n\n';
    message += '▸ المحفظة المختارة: ' + walletName + '\n';
    if(selectedWallet && selectedWallet.number){
      message += '▸ رقم المحفظة: ' + selectedWallet.number + '\n';
    }
    message += '▸ المبلغ المطلوب: ' + priceDisplay.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ') + '\n';

    message += '\n━━━━━━━━━━━━━━━━\n\n';

    // توضيح نهائي
    message += '⏳ *في انتظار تأكيد الطلب*\n';
    message += '\n💡 *ملاحظة:* البيانات المرفقة أعلاه تم إرسالها لتسهيل التواصل وسرعة الشراء فقط.';

    const url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(message);

    showToast('جاري التحويل للواتساب...');

    // حفظ بيانات العميل للزيارات القادمة
    try {
      saveCustomerData({
        name: name,
        phone: phone,
        governorate: governorate,
        city: city,
        address: address,
        lastOrderAt: new Date().toISOString(),
        isReturningCustomer: isReturningCustomer
      });
    } catch(e) {}

    // تحويل للواتساب
    setTimeout(function(){
      window.location.href = url;
    }, 400);

    // إغلاق النافذة بعد التحويل
    setTimeout(function(){
      closeCustomerModal();
      currentOrder = null;
    }, 1500);
  } catch(e) {
    console.error('خطأ في الإرسال:', e);
    showToast('حدث خطأ');
  }
}

// ===== التنبيه =====
function showToast(msg){
  try {
    const toast = document.getElementById('toast');
    if(!toast) return;
    const textEl = document.getElementById('toastText');
    if(textEl) textEl.textContent = msg;
    toast.classList.add('show');
    setTimeout(function(){ toast.classList.remove('show'); }, 3000);
  } catch(e) {}
}

// =====================================================
// ===== عرض الأقسام في الصفحة الرئيسية =====
// =====================================================
function renderHomeCategories(){
  try {
    const grid = document.getElementById('homeCategoriesGrid');
    if(!grid) return;

    if(!categories || !Array.isArray(categories) || categories.length === 0){
      grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:50px 20px; color:#888;">' +
        icon('layers', 50) +
        '<p style="margin-top:14px; font-weight:700; color:#FFD700;">لا توجد أقسام حالياً</p>' +
        '<p style="font-size:12px; margin-top:6px;">أضف الأقسام من لوحة التحكم</p>' +
        '<a href="admin.html" class="btn btn-gold" style="margin-top:14px;">' +
          icon('settings', 16) + ' فتح لوحة التحكم' +
        '</a>' +
      '</div>';
      return;
    }

    const sorted = categories.slice().sort(function(a,b){ return (a.order || 0) - (b.order || 0); });

    grid.innerHTML = sorted.map(function(cat){
      if(!cat || !cat.id) return '';

      const imageHTML = cat.image
        ? '<img src="' + cat.image + '" alt="' + (cat.name || '') + '">'
        : '<div class="placeholder">' + icon('layers', 40) + '</div>';

      return '<a href="category.html?id=' + cat.id + '" class="cat-card">' +
        '<div class="cat-image-wrap">' + imageHTML + '</div>' +
        '<h3>' + (cat.name || '') + '</h3>' +
        '<p>' + (cat.desc || '') + '</p>' +
        '<div class="cat-link">' +
          'تصفح ' + icon('arrow', 14) +
        '</div>' +
      '</a>';
    }).join('');

    injectIcons();
  } catch(e) {
    console.error('خطأ في عرض الأقسام:', e);
  }
}

// ===== القائمة الجانبية =====
function renderMenuCategories(){
  try {
    const container = document.getElementById('menuCategories');
    if(!container) return;

    if(!categories || !Array.isArray(categories) || categories.length === 0){
      container.innerHTML = '<p style="padding:14px; color:#555; font-size:12px; text-align:center;">لا توجد أقسام</p>';
      return;
    }

    const currentCat = new URLSearchParams(window.location.search).get('id');
    const sorted = categories.slice().sort(function(a,b){ return (a.order || 0) - (b.order || 0); });

    container.innerHTML = sorted.map(function(cat){
      if(!cat || !cat.id) return '';
      const active = cat.id === currentCat ? 'active' : '';
      const imgIcon = cat.image
        ? '<img src="' + cat.image + '" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">'
        : icon('layers', 18);

      return '<a href="category.html?id=' + cat.id + '" class="menu-link ' + active + '">' +
        '<div class="menu-link-icon" style="overflow:hidden; padding:0;">' + imgIcon + '</div>' +
        (cat.name || '') +
      '</a>';
    }).join('');
  } catch(e) {
    console.error('خطأ في القائمة:', e);
  }
}

// =====================================================
// ===== صفحة القسم - مع الخلفية الديناميكية =====
// =====================================================
function renderCategoryPage(){
  try {
    const params = new URLSearchParams(window.location.search);
    const catId = params.get('id');

    console.log('معرف القسم:', catId);

    const pageContent = document.getElementById('pageContent');
    if(!pageContent) return;

    if(!catId){
      pageContent.innerHTML = '<div style="padding:80px 20px; text-align:center;">' +
        icon('package', 60) +
        '<h2 style="margin:16px 0 8px; color:#FFD700;">معرف القسم مفقود</h2>' +
        '<a href="index.html" class="btn btn-gold">' + icon('home', 16) + ' العودة للرئيسية</a>' +
      '</div>';
      return;
    }

    if(!categories || categories.length === 0){
      pageContent.innerHTML = '<div style="padding:80px 20px; text-align:center;">' +
        '<div style="display:inline-block; width:50px; height:50px; border:4px solid #FFD700; border-top-color:transparent; border-radius:50%; animation:spin 1s linear infinite;"></div>' +
        '<h2 style="margin:16px 0 8px; color:#FFD700;">جاري التحميل...</h2>' +
        '<p style="color:#888;">يرجى الانتظار</p>' +
      '</div>' +
      '<style>@keyframes spin{to{transform:rotate(360deg);}}</style>';
      return;
    }

    const category = getCategory(catId);

    if(!category){
      pageContent.innerHTML = '<div style="padding:80px 20px; text-align:center;">' +
        icon('package', 60) +
        '<h2 style="margin:16px 0 8px; color:#FFD700;">القسم غير موجود</h2>' +
        '<p style="color:#888; margin-bottom:20px;">يرجى العودة للصفحة الرئيسية</p>' +
        '<a href="index.html" class="btn btn-gold">' + icon('home', 16) + ' العودة للرئيسية</a>' +
      '</div>';
      return;
    }

    document.title = category.name + ' - هود كوم';

    pageContent.innerHTML = '<div class="page-header" id="pageHeader"></div>' +
      // الخلفية الديناميكية: شعار القسم يظهر كخلفية كاملة وممتدة
      (category.image ? '<div class="page-dynamic-bg" id="pageDynamicBg">' +
        '<img src="' + category.image + '" alt="" class="page-dynamic-bg-img">' +
        '<div class="page-dynamic-bg-overlay"></div>' +
      '</div>' : '') +
      '<section class="section"><div class="items-grid" id="itemsGrid"></div></section>' +
      // نبذة "من نحن" - تظهر حسب الإعدادات
      (siteSettings.aboutEnabled ? renderAboutSection() : '') +
      '<section class="section section-dark">' +
        '<div class="section-header">' +
          '<div class="section-eyebrow">استكشف</div>' +
          '<h2 class="section-title">أقسام <span class="gold">أخرى</span></h2>' +
        '</div>' +
        '<div class="other-cats" id="otherCats"></div>' +
      '</section>';

    const pageHeader = document.getElementById('pageHeader');

    if(category.image){
      // إضافة الخلفية للهيدر مع طبقة داكنة
      pageHeader.style.backgroundImage =
        'linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.95)), url(\'' + category.image + '\')';
      pageHeader.style.backgroundSize = 'cover';
      pageHeader.style.backgroundPosition = 'center';
      pageHeader.style.backgroundRepeat = 'no-repeat';
      pageHeader.classList.add('has-bg-image');
    }

    const headerImage = category.image
      ? '<div class="page-image-wrap"><img src="' + category.image + '" alt="' + category.name + '"></div>'
      : '<div class="page-icon-wrap">' + icon('layers', 32) + '</div>';

    const itemsCount = (category.items && category.items.length) || 0;

    pageHeader.innerHTML = headerImage +
      '<h1>' + category.name + '</h1>' +
      '<p>' + (category.desc || '') + '</p>' +
      '<div class="product-count-badge">' +
        icon('package', 14) + ' <span>' + itemsCount + '</span> منتج متاح' +
      '</div>';

    const breadcrumb = document.getElementById('breadcrumbCurrent');
    if(breadcrumb) breadcrumb.textContent = category.name;

    const grid = document.getElementById('itemsGrid');

    if(!category.items || !Array.isArray(category.items) || category.items.length === 0){
      grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:60px 20px; color:#888;">' +
        icon('package', 50) +
        '<p style="font-size:16px; font-weight:700; margin-top:14px; color:#FFD700;">لا توجد منتجات حالياً</p>' +
        '<p style="font-size:12px; margin-top:6px;">سيتم إضافة المنتجات قريباً</p>' +
      '</div>';
    } else {
      grid.innerHTML = category.items.map(function(item){
        if(!item || !item.id) return '';

        // العلامة المائية على صور المنتجات
        const watermarkHTML = siteSettings.showWatermark ? '<div class="item-watermark"><img src="logo-watermark.png" alt="هود كوم"></div>' : '';
        const imageHTML = item.image
          ? '<img src="' + item.image + '" alt="' + item.name + '">' + watermarkHTML
          : '<div class="placeholder">' + icon('package', 40) + '</div>';

        const offersCount = (item.offers && item.offers.length) || 0;

        return '<div class="item-card" onclick="openItemModal(\'' + catId + '\', \'' + item.id + '\')">' +
          '<div class="item-image-wrap">' + imageHTML + '</div>' +
          '<h3 class="item-card-name">' + (item.name || '') + '</h3>' +
          '<p class="item-card-desc">' + (item.desc || '') + '</p>' +
          '<div class="item-card-badge">' +
            icon('tag', 12) + ' ' + offersCount + ' عرض' +
          '</div>' +
        '</div>';
      }).join('');
    }

    renderOtherCategories(catId);
    injectIcons();
  } catch(e) {
    console.error('خطأ في عرض الصفحة:', e);
  }
}

// ===== عرض نبذة "من نحن" حسب الموضع المحدد =====
function renderAboutSection(){
  try {
    if(!siteSettings.aboutEnabled || !siteSettings.aboutText) return '';

    return '<section class="section about-section" data-position="' + (siteSettings.aboutPosition || 'middle') + '">' +
      '<div class="about-section-inner">' +
        '<div class="about-section-icon">' + icon('info', 24) + '</div>' +
        '<div class="about-section-title">من نحن</div>' +
        '<div class="about-section-text">' + siteSettings.aboutText + '</div>' +
      '</div>' +
    '</section>';
  } catch(e) {
    return '';
  }
}

// ===== الأقسام الأخرى =====
function renderOtherCategories(currentId){
  try {
    const container = document.getElementById('otherCats');
    if(!container) return;

    if(!categories || !Array.isArray(categories)) return;

    const others = categories.filter(function(c){ return c && c.id !== currentId; });

    if(others.length === 0){
      if(container.parentElement) container.parentElement.style.display = 'none';
      return;
    }

    container.innerHTML = others.map(function(cat){
      return '<a href="category.html?id=' + cat.id + '" class="other-cat">' +
        icon('layers', 16) + ' ' + cat.name +
      '</a>';
    }).join('');
  } catch(e) {
    console.error('خطأ:', e);
  }
}

// =====================================================
// ===== نافذة العروض (Modal) =====
// =====================================================
function openItemModal(categoryId, itemId){
  try {
    const category = getCategory(categoryId);
    if(!category){
      showToast('القسم غير موجود');
      return;
    }

    if(!category.items || !Array.isArray(category.items)){
      showToast('لا توجد منتجات');
      return;
    }

    const item = category.items.find(function(i){ return i && i.id === itemId; });
    if(!item){
      showToast('المنتج غير موجود');
      return;
    }

    const modal = document.getElementById('itemModal');
    const overlay = document.getElementById('itemModalOverlay');
    if(!modal) return;

    // العلامة المائية على صورة المنتج في النافذة
    const watermarkHTML = siteSettings.showWatermark ? '<img src="logo-watermark.png" alt="" class="offer-watermark">' : '';

    const headerImage = item.image
      ? '<div class="modal-image-wrap"><img src="' + item.image + '" alt="' + item.name + '">' + watermarkHTML + '</div>'
      : '<div class="modal-image-wrap"><div class="placeholder">' + icon('package', 40) + '</div></div>';

    const imageWrap = document.getElementById('modalImageWrap');
    if(imageWrap) imageWrap.innerHTML = headerImage;

    const nameEl = document.getElementById('modalName');
    if(nameEl) nameEl.textContent = item.name || '';

    const descEl = document.getElementById('modalDesc');
    if(descEl) descEl.textContent = item.desc || '';

    const offersContainer = document.getElementById('modalOffers');
    const offers = item.offers || [];

    if(offers.length === 0){
      offersContainer.innerHTML = '<div style="text-align:center; padding:30px 20px; color:#888;">' +
        icon('package', 40) +
        '<p style="margin-top:12px;">لا توجد عروض لهذا المنتج</p>' +
      '</div>';
    } else {
      offersContainer.innerHTML = offers.map(function(offer){
        if(!offer || !offer.id) return '';

        const discount = calcDiscount(offer.price, offer.oldPrice);

        // عرض السعر حسب وضع العملة
        const priceDisplay = renderPriceDisplay(offer.price, offer.currency || DEFAULT_CURRENCY);
        const oldPriceDisplay = offer.oldPrice ? renderPriceDisplay(offer.oldPrice, offer.currency || DEFAULT_CURRENCY) : '';

        const imageHTML = offer.image
          ? '<img src="' + offer.image + '" alt="' + offer.name + '">' +
            (siteSettings.showWatermark ? '<img src="logo-watermark.png" alt="" class="offer-watermark">' : '')
          : '<div class="placeholder">' + icon('tag', 24) + '</div>';

        return '<div class="offer-card">' +
          '<div class="offer-image-wrap">' + imageHTML + '</div>' +
          '<div class="offer-info">' +
            '<h4 class="offer-name">' + offer.name + '</h4>' +
            '<div class="offer-prices">' +
              (offer.oldPrice ? '<span class="offer-old-price">' + oldPriceDisplay + '</span>' : '') +
              '<span class="offer-price">' + priceDisplay + '</span>' +
            '</div>' +
            (discount > 0 ? '<span class="offer-discount">خصم ' + discount + '%</span>' : '') +
          '</div>' +
          '<button class="offer-buy-btn" onclick="buyOffer(\'' + categoryId + '\', \'' + itemId + '\', \'' + offer.id + '\')">' +
            icon('cart2', 14) + ' شراء' +
          '</button>' +
        '</div>';
      }).join('');
    }

    modal.classList.add('open');
    if(overlay) overlay.classList.add('open');
    document.body.style.overflow = 'hidden';

    injectIcons();
  } catch(e) {
    console.error('خطأ في فتح النافذة:', e);
  }
}

function closeItemModal(){
  const modal = document.getElementById('itemModal');
  const overlay = document.getElementById('itemModalOverlay');
  if(modal) modal.classList.remove('open');
  if(overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
}

// ===== حساب نسبة الخصم =====
function calcDiscount(price, oldPrice){
  if(!oldPrice || oldPrice <= price) return 0;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

// =====================================================
// ===== دالة الجاهزية =====
// =====================================================
async function onFirebaseReady(){
  console.log('Firebase جاهز - بدء العرض');

  if(document.getElementById('homeCategoriesGrid')){
    renderHomeCategories();
  }

  if(document.getElementById('pageContent')){
    renderCategoryPage();
  }

  renderMenuCategories();
  injectIcons();
  renderWalletGrid();
  applySiteSettingsToUI();
}
