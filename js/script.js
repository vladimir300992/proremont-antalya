// Функция расчета стоимости
function calculatePrice() {
    // Получаем значения
    const perimeter = parseFloat(document.getElementById('perimeter').value) || 0;
    const area = parseFloat(document.getElementById('area').value) || 0;
    const lights = parseInt(document.getElementById('lights').value) || 0;
    const profileType = document.querySelector('input[name="profile"]:checked').value;
    const tiles = document.getElementById('tileDrilling');

    // Расчет стоимости

    let price = perimeter * 7.4 + area * 18 + lights * 10;

    // Надбавка за теневой профиль
    if (profileType === 'shadow') {
        price += 20 + (perimeter * 1.6);
    }
    if (tiles.checked) {
         price += perimeter * 6;
    }
    // Округление до 10
    price = Math.round(price / 10) * 10;

    // Расчет скидки
    const discount = Math.round(price * 0.1);
    const finalPrice = price - discount;

    // Отображаем результат с анимацией
    const result = document.getElementById('calcResult');
    result.innerHTML = `
        <div style="margin-bottom: 15px; font-size: 18px; font-weight: 500;"> Стоимость по заданным параметрам:</div>
        <div class="price-container">
            <div class="old-price-wrapper">
                <div class="old-price">${price} $ </div>
            </div>
            <div class="discount-badge">Ваша скидка 10%: -${discount} $</div>
            <div class="new-price">Итого: ${finalPrice} $</div>
        </div>
    `;
    result.style.display = 'block';

    // Сбрасываем анимации для повторного расчета
    const animatedElements = result.querySelectorAll('.old-price, .discount-badge, .new-price');
    animatedElements.forEach(el => {
        el.style.animation = 'none';
        void el.offsetHeight;
        el.style.animation = null;
    });

    // Показываем форму для контактов
    document.getElementById('clientForm').style.display = 'block';
}

// Функция отправки данных в Telegram
async function sendCalculationToTelegram() {
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const perimeter = document.getElementById('perimeter').value;
    const area = document.getElementById('area').value;
    const lights = document.getElementById('lights').value;
    const canvasType = document.querySelector('input[name="canvas"]:checked').value;
    const profileType = document.querySelector('input[name="profile"]:checked').value;
    const tileDrilling = document.getElementById('tileDrilling').checked;

    // Получаем рассчитанные значения
    const resultBox = document.getElementById('calcResult');
    const resultText = resultBox ? resultBox.innerText.trim() : '';

    if (!resultText) {
        alert('Пожалуйста, сначала рассчитайте стоимость.');
        return;
    }

    const config = window.TELEGRAM_CONFIG || {};
    const TELEGRAM_TOKEN = config.token;
    const TELEGRAM_CHAT_ID = config.chatId;

    if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) {
        console.error('Telegram config is missing.');
        alert('Произошла ошибка. Пожалуйста, позвоните нам напрямую.');
        return;
    }

    const canvasTypeLabel = canvasType === 'glossy' ? 'Глянцевый' : 'Матовый';
    const profileTypeLabel = profileType === 'shadow' ? 'Теневой' : 'Стандартный';

    const messageParts = [
        '🔔 Новая заявка с сайта',
        '',
        `Имя: ${name || 'не указано'}`,
        `Телефон: ${phone || 'не указан'}`,
        '',
        'Параметры расчёта:',
        `• Площадь: ${area || '—'} м²`,
        `• Периметр: ${perimeter || '—'} м`,
        `• Светильники: ${lights || '0'} шт.`,
        `• Тип полотна: ${canvasTypeLabel}`,
        `• Тип профиля: ${profileTypeLabel}`,
        `• Сверление плитки: ${tileDrilling ? 'Да' : 'Нет'}`,
        '',
        'Результат расчёта:',
        resultText,
        '',
        `Отправлено: ${new Date().toLocaleString()}`
    ];

    const message = messageParts.join('\n');

    try {
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message
            })
        });

        const result = await response.json();

        if (!result.ok) {
            throw new Error(result.description || 'Ошибка Telegram API');
        }

        alert('Спасибо! Мы скоро с вами свяжемся.');
        document.getElementById('calcForm').reset();
        document.getElementById('calcResult').style.display = 'none';
        document.getElementById('clientForm').style.display = 'none';
    } catch (error) {
        console.error('Error:', error);
        alert('Произошла ошибка. Пожалуйста, позвоните нам напрямую.');
    }
}

// Инициализация калькулятора
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация общих компонентов
    if (typeof initCommonComponents === 'function') {
        initCommonComponents();
    }

    const calculateBtn = document.getElementById('calculateBtn');
    if (calculateBtn) {
        calculateBtn.addEventListener('click', calculatePrice);
    }

    const faqButtons = document.querySelectorAll('.faq-question');
    const canUseResizeObserver = typeof ResizeObserver !== 'undefined';
    const answerObservers = canUseResizeObserver ? new WeakMap() : null;
    const activeAnswers = new Set();

    const recalcActiveAnswers = () => {
        activeAnswers.forEach(activeAnswer => {
            if (!activeAnswer.classList.contains('show')) {
                return;
            }

            const updatedHeight = activeAnswer.scrollHeight;
            activeAnswer.style.setProperty('--faq-answer-max-height', `${updatedHeight}px`);
        });
    };

    if (!canUseResizeObserver) {
        window.addEventListener('resize', recalcActiveAnswers);
    }

    faqButtons.forEach((button, index) => {
        const answer = button.nextElementSibling;

        if (!answer) {
            return;
        }

        answer.removeAttribute('hidden');
        answer.classList.remove('show');
        answer.setAttribute('aria-hidden', 'true');
        answer.style.setProperty('--faq-answer-max-height', '0px');
        button.setAttribute('aria-expanded', 'false');
        button.setAttribute('aria-controls', `faq-answer-${index}`);
        answer.id = `faq-answer-${index}`;

        const getObserver = () => {
            if (!canUseResizeObserver) {
                return null;
            }

            let observer = answerObservers.get(answer);

            if (!observer) {
                observer = new ResizeObserver(() => {
                    if (!answer.classList.contains('show')) {
                        return;
                    }

                    const updatedHeight = answer.scrollHeight;
                    answer.style.setProperty('--faq-answer-max-height', `${updatedHeight}px`);
                });

                answerObservers.set(answer, observer);
            }

            return observer;
        };

        const startObserving = () => {
            const observer = getObserver();

            if (observer) {
                observer.observe(answer);
            }
        };

        const stopObserving = () => {
            if (!canUseResizeObserver) {
                return;
            }

            const observer = answerObservers.get(answer);

            if (observer) {
                observer.unobserve(answer);
            }
        };

        button.addEventListener('click', () => {
            const isExpanded = button.getAttribute('aria-expanded') === 'true';
            const nextState = !isExpanded;

            button.setAttribute('aria-expanded', String(nextState));
            button.classList.toggle('active', nextState);

            if (nextState) {
                // Сбрасываем высоту перед показом, чтобы анимация запускалась корректно
                answer.style.setProperty('--faq-answer-max-height', '0px');
                answer.classList.add('show');
                answer.setAttribute('aria-hidden', 'false');
                activeAnswers.add(answer);

                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        const expandedHeight = answer.scrollHeight;
                        answer.style.setProperty('--faq-answer-max-height', `${expandedHeight}px`);
                        startObserving();
                    });
                });
            } else {
                activeAnswers.delete(answer);
                stopObserving();

                const currentHeight = answer.scrollHeight;
                answer.style.setProperty('--faq-answer-max-height', `${currentHeight}px`);

                requestAnimationFrame(() => {
                    answer.classList.remove('show');
                    answer.setAttribute('aria-hidden', 'true');

                    requestAnimationFrame(() => {
                        answer.style.setProperty('--faq-answer-max-height', '0px');
                    });
                });
            }
        });
    });

    // Инициализация AOS
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease',
            once: true,
            mirror: false,
            offset: 120,
            delay: 100,
        });
    }
});
