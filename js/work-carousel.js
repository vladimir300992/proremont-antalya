// Автокарусель для страницы "Наши работы" с отображением предыдущего и следующего изображения

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.carousel').forEach(carousel => {
        const track = carousel.querySelector('.carousel-track');
        const slides = Array.from(track ? track.children : []);
        if (!track || slides.length === 0) return;

        let index = 0;
        const total = slides.length;

        function update() {
            const width = carousel.clientWidth;
            const isMobile = window.innerWidth <= 576;
            const activeRatio = isMobile ? 0.9 : 0.6;
            const maxActive = isMobile ? 360 : 420;
            const minActive = 220;
            const cappedMax = Math.min(maxActive, width);
            const cappedMin = Math.min(minActive, width);
            const targetSize = width * activeRatio;
            const activeSize = Math.max(Math.min(targetSize, cappedMax), cappedMin);
            const sideSize = activeSize * (isMobile ? 0.7 : 0.55);
            const centerLeft = (width - activeSize) / 2;
            const gap = Math.max(width * 0.05, 16);
            const offLeft = -sideSize - gap;
            const offRight = width + gap;

            track.style.height = `${activeSize}px`;

            const prev = (index - 1 + total) % total;
            const prevPrev = (index - 2 + total) % total;
            const next = (index + 1) % total;

            slides.forEach((slide, i) => {
                slide.style.position = 'absolute';
                slide.style.top = '50%';
                slide.style.left = '0';
                slide.style.objectFit = 'cover';
                slide.style.transition = 'transform 0.6s ease, width 0.6s ease, height 0.6s ease, opacity 0.6s ease';
                slide.style.borderRadius = '10px';

                if (i === index) {
                    slide.style.width = `${activeSize}px`;
                    slide.style.height = `${activeSize}px`;
                    slide.style.transform = `translate(${centerLeft}px, -50%)`;
                    slide.style.opacity = '1';
                    slide.style.zIndex = 2;
                } else if (i === prev) {
                    slide.style.width = `${sideSize}px`;
                    slide.style.height = `${sideSize}px`;
                    slide.style.transform = `translate(${offLeft}px, -50%)`;
                    slide.style.opacity = '0.4';
                    slide.style.zIndex = 1;
                } else if (i === next) {
                    slide.style.width = `${sideSize}px`;
                    slide.style.height = `${sideSize}px`;
                    slide.style.transform = `translate(${offRight}px, -50%)`;
                    slide.style.opacity = '0.4';
                    slide.style.zIndex = 1;
                } else if (i === prevPrev) {
                    slide.style.width = `${sideSize}px`;
                    slide.style.height = `${sideSize}px`;
                    slide.style.transform = `translate(${offLeft}px, -50%)`;
                    slide.style.opacity = '0';
                    slide.style.zIndex = 0;
                } else {
                    slide.style.width = `${sideSize}px`;
                    slide.style.height = `${sideSize}px`;
                    slide.style.transform = `translate(${offRight}px, -50%)`;
                    slide.style.opacity = '0';
                    slide.style.zIndex = 0;
                }
            });
        }

        function startAuto() {
            return setInterval(() => {
                index = (index + 1) % total;
                update();
            }, 3000);
        }

        let intervalId;
        update();

        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        if (!intervalId) intervalId = startAuto();
                    } else {
                        clearInterval(intervalId);
                        intervalId = null;
                    }
                });
            }, { threshold: 0.5 });

            observer.observe(carousel);
        } else {
            intervalId = startAuto();
        }

        window.addEventListener('resize', update);
    });
});

