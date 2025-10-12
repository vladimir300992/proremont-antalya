const TELEGRAM_CONFIG = window.TELEGRAM_CONFIG || {
    token: '1403690168:AAHqRNU27X5THfsdASyZHMHdWwHX9d5SZcs',
    chatId: '335094318'
};

window.TELEGRAM_CONFIG = TELEGRAM_CONFIG;

const TELEGRAM_FIELD_LABELS = {
    name: 'Имя',
    phone: 'Телефон',
    message: 'Комментарий'
};

// Функция инициализации общих компонентов
function initCommonComponents() {
    // Инициализация мобильного меню
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const menu = document.querySelector('.navbar-menu');
    if (menuToggle && menu) {
        menuToggle.addEventListener('click', function() {
            menu.classList.toggle('show');
            this.classList.toggle('open');
        });

        // Закрываем меню при выборе пункта
        menu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                menu.classList.remove('show');
                menuToggle.classList.remove('open');
            });
        });
    }

    // Установка активного пункта меню
    function setActiveMenuItem() {
        const currentPage = window.location.pathname.split('/').pop();
        const menuItems = document.querySelectorAll('.navbar-menu a');

        menuItems.forEach(item => {
            const href = item.getAttribute('href');
            if (href === currentPage) {
                item.parentElement.classList.add('active');
                item.removeAttribute('href');
                item.setAttribute('aria-current', 'page');
            }
        });
    }

    setActiveMenuItem();

    // Плавная прокрутка к калькулятору
    const scrollBtn = document.getElementById('scrollToCalculator');
    if (scrollBtn) {
        scrollBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const calculatorSection = document.getElementById('calculatorSection');
            if (calculatorSection) {
                calculatorSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });

                // Анимация подсветки
                calculatorSection.classList.remove('highlight-animation');
                void calculatorSection.offsetWidth;
                calculatorSection.classList.add('highlight-animation');
            }
        });
    }

    // Инициализация модального окна
    const modal = document.getElementById('modal');
    const openModalButtons = document.querySelectorAll('[data-open-modal]');
    const closeBtn = document.querySelector('.close');

    if (modal && openModalButtons.length > 0) {
        openModalButtons.forEach(button => {
            button.addEventListener('click', () => {
                modal.style.display = 'flex';
            });
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    window.addEventListener('click', (e) => {
        if (modal && e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Ограничение и нормализация ввода телефона
    const phoneInputs = document.querySelectorAll('input[type="tel"], input[name="phone"]');
    if (phoneInputs.length) {
        const formatPhoneValue = (value = '') => {
            const stringValue = String(value);
            const sanitized = stringValue.replace(/[^\d+]/g, '');
            const digits = sanitized.replace(/\D/g, '').slice(0, 20);
            const hasPlus = sanitized.includes('+');

            if (hasPlus) {
                return digits.length ? `+${digits}` : '+';
            }

            return digits;
        };

        const enforcePhoneFormat = (event) => {
            const { target } = event;
            if (!target) {
                return;
            }

            const formattedValue = formatPhoneValue(target.value);
            if ((event.type === 'blur' || event.type === 'change') && formattedValue === '+') {
                target.value = '';
                return;
            }

            target.value = formattedValue;
        };

        phoneInputs.forEach(input => {
            if (!input.hasAttribute('inputmode')) {
                input.setAttribute('inputmode', 'tel');
            }

            input.setAttribute('maxlength', '21');
            input.setAttribute('pattern', '^\\+?\\d{1,20}$');

            input.addEventListener('input', enforcePhoneFormat);
            input.addEventListener('blur', enforcePhoneFormat);
            input.addEventListener('change', enforcePhoneFormat);
        });
    }

    initLandscapeHeaderCompaction();
    initTelegramForms();
}

// Обновляем функцию инициализации мобильного меню
function initMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const menu = document.querySelector('.navbar-menu');

    if (menuToggle && menu) {
        menuToggle.addEventListener('click', function() {
            menu.classList.toggle('show');
            this.classList.toggle('open');
        });

        // Закрываем меню при клике на пункт
        menu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                menu.classList.remove('show');
                menuToggle.classList.remove('open');
            });
        });

        // Закрываем меню при изменении ориентации
        window.addEventListener('orientationchange', () => {
            menu.classList.remove('show');
            menuToggle.classList.remove('open');
        });
    }
}

function initLandscapeHeaderCompaction() {
    const header = document.querySelector('.header');
    if (!header) {
        return;
    }

    const topSection = header.querySelector('.container');
    if (!topSection) {
        return;
    }

    const landscapeQuery = window.matchMedia('(max-width: 992px) and (orientation: landscape)');
    let topSectionHeight = topSection.scrollHeight;

    const measureTopSection = () => {
        const wasCompact = header.classList.contains('header--menu-only');
        if (wasCompact) {
            header.classList.remove('header--menu-only');
        }

        topSectionHeight = topSection.scrollHeight;

        if (wasCompact) {
            header.classList.add('header--menu-only');
        }
    };

    const updateHeaderState = () => {
        if (!landscapeQuery.matches) {
            header.classList.remove('header--menu-only');
            return;
        }

        const shouldCompact = window.scrollY > topSectionHeight;
        header.classList.toggle('header--menu-only', shouldCompact);
    };

    const handleStateChange = () => {
        measureTopSection();
        updateHeaderState();
    };

    window.addEventListener('scroll', updateHeaderState, { passive: true });
    window.addEventListener('resize', handleStateChange);

    if (typeof landscapeQuery.addEventListener === 'function') {
        landscapeQuery.addEventListener('change', handleStateChange);
    } else if (typeof landscapeQuery.addListener === 'function') {
        landscapeQuery.addListener(handleStateChange);
    }

    measureTopSection();
    updateHeaderState();
}

async function sendTelegramLead(form) {
    const { token, chatId } = window.TELEGRAM_CONFIG || {};

    if (!token || !chatId) {
        throw new Error('Не настроены параметры Telegram.');
    }

    const formData = new FormData(form);
    const entries = [];
    const allowedFields = ['name', 'phone'];

    formData.forEach((value, key) => {
        if (!allowedFields.includes(key)) {
            return;
        }

        const stringValue = String(value).trim();
        if (!stringValue) {
            return;
        }

        const fieldElement = form.querySelector(`[name="${key}"]`);
        const label = fieldElement?.dataset.label || TELEGRAM_FIELD_LABELS[key] || key;
        entries.push(`${label}: ${stringValue}`);
    });

    if (!entries.length) {
        throw new Error('Не удалось определить контактные данные.');
    }

    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            chat_id: chatId,
            text: entries.join('\n')
        })
    });

    if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
    }

    const result = await response.json();

    if (!result.ok) {
        throw new Error(result.description || 'Ошибка Telegram API');
    }
}

function initTelegramForms() {
    const forms = document.querySelectorAll('form[data-telegram-form]');

    if (!forms.length) {
        return;
    }

    forms.forEach(form => {
        form.addEventListener('submit', async (event) => {
            event.preventDefault();

            const submitButton = form.querySelector('[type="submit"]');
            const originalText = submitButton?.textContent;

            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = submitButton.dataset.loadingText || 'Отправляем...';
            }

            try {
                await sendTelegramLead(form);
                form.reset();

                const modal = form.closest('.modal');
                if (modal) {
                    modal.style.display = 'none';
                }

                alert('Спасибо! Мы скоро с вами свяжемся.');
            } catch (error) {
                console.error('Ошибка отправки формы:', error);
                alert('Произошла ошибка. Пожалуйста, позвоните нам напрямую.');
            } finally {
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = originalText || 'Отправить';
                }
            }
        });
    });
}
