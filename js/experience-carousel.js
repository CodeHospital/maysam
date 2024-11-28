class ExperienceCarousel {
    constructor() {
        this.init();
    }

    init() {
        // Wait for DOM elements to be available
        setTimeout(() => {
            this.carouselTrack = document.querySelector('.experience-track');
            this.slides = document.querySelectorAll('.experience-slide');
            this.prevButton = document.querySelector('.experience-nav.prev');
            this.nextButton = document.querySelector('.experience-nav.next');
            this.dotsContainer = document.querySelector('.experience-dots');
            
            if (!this.carouselTrack || !this.slides.length) return;

            this.currentSlide = 0;
            this.slidesCount = this.slides.length;
            this.isTransitioning = false;
            this.touchStartX = 0;
            this.touchEndX = 0;
            this.autoplayInterval = null;
            
            // Create dots
            this.createDots();
            
            // Set initial position
            this.updateCarouselPosition();
            
            // Add event listeners
            this.prevButton.addEventListener('click', () => this.prevSlide());
            this.nextButton.addEventListener('click', () => this.nextSlide());
            
            // Add touch and mouse support
            this.addTouchSupport();
            this.addMouseSupport();
            
            // Add keyboard support
            this.addKeyboardSupport();
            
            // Add resize handler
            this.addResizeHandler();
            
            // Start autoplay immediately
            this.startAutoplay();

            // Add visibility change handler
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    this.pauseAutoplay();
                } else {
                    this.startAutoplay();
                }
            });

            // Add intersection observer
            this.addIntersectionObserver();

            // Log initialization
            console.log('Experience carousel initialized');
        }, 0);
    }

    createDots() {
        this.dotsContainer.innerHTML = '';
        for (let i = 0; i < this.slidesCount; i++) {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => this.goToSlide(i));
            this.dotsContainer.appendChild(dot);
        }
    }

    updateCarouselPosition(animate = true) {
        if (!this.carouselTrack) return;
        
        if (animate) {
            this.carouselTrack.style.transition = 'transform 0.5s ease-in-out';
        } else {
            this.carouselTrack.style.transition = 'none';
        }
        
        const position = -this.currentSlide * 100;
        this.carouselTrack.style.transform = `translateX(${position}%)`;
        
        // Update dots
        const dots = this.dotsContainer.querySelectorAll('.dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentSlide);
        });
    }

    prevSlide() {
        if (this.isTransitioning) return;
        this.isTransitioning = true;
        this.currentSlide = (this.currentSlide - 1 + this.slidesCount) % this.slidesCount;
        this.updateCarouselPosition();
        setTimeout(() => this.isTransitioning = false, 500);
        this.resetAutoplay();
    }

    nextSlide() {
        if (this.isTransitioning) return;
        this.isTransitioning = true;
        this.currentSlide = (this.currentSlide + 1) % this.slidesCount;
        this.updateCarouselPosition();
        setTimeout(() => this.isTransitioning = false, 500);
        this.resetAutoplay();
    }

    goToSlide(index) {
        if (this.isTransitioning || index === this.currentSlide) return;
        this.isTransitioning = true;
        this.currentSlide = index;
        this.updateCarouselPosition();
        setTimeout(() => this.isTransitioning = false, 500);
        this.resetAutoplay();
    }

    addTouchSupport() {
        if (!this.carouselTrack) return;

        this.carouselTrack.addEventListener('touchstart', (e) => {
            this.pauseAutoplay();
            this.touchStartX = e.touches[0].clientX;
        }, { passive: true });

        this.carouselTrack.addEventListener('touchmove', (e) => {
            if (this.isTransitioning) return;
            const currentX = e.touches[0].clientX;
            const diff = this.touchStartX - currentX;
            const position = -this.currentSlide * 100 - (diff / this.carouselTrack.offsetWidth * 100);
            this.carouselTrack.style.transition = 'none';
            this.carouselTrack.style.transform = `translateX(${position}%)`;
        }, { passive: true });

        this.carouselTrack.addEventListener('touchend', (e) => {
            this.touchEndX = e.changedTouches[0].clientX;
            const diff = this.touchStartX - this.touchEndX;
            
            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    this.nextSlide();
                } else {
                    this.prevSlide();
                }
            } else {
                this.updateCarouselPosition();
            }
            this.startAutoplay();
        });
    }

    addMouseSupport() {
        if (!this.carouselTrack) return;

        let isDragging = false;
        let startX;
        let scrollLeft;

        this.carouselTrack.addEventListener('mousedown', (e) => {
            isDragging = true;
            this.pauseAutoplay();
            startX = e.pageX - this.carouselTrack.offsetLeft;
            scrollLeft = this.carouselTrack.scrollLeft;
            this.carouselTrack.style.cursor = 'grabbing';
        });

        this.carouselTrack.addEventListener('mouseleave', () => {
            isDragging = false;
            this.carouselTrack.style.cursor = 'grab';
            this.startAutoplay();
        });

        this.carouselTrack.addEventListener('mouseup', () => {
            isDragging = false;
            this.carouselTrack.style.cursor = 'grab';
            this.startAutoplay();
        });

        this.carouselTrack.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            const x = e.pageX - this.carouselTrack.offsetLeft;
            const walk = (x - startX) * 2;
            const position = -this.currentSlide * 100 + (walk / this.carouselTrack.offsetWidth * 100);
            this.carouselTrack.style.transition = 'none';
            this.carouselTrack.style.transform = `translateX(${position}%)`;
        });
    }

    addKeyboardSupport() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.prevSlide();
            } else if (e.key === 'ArrowRight') {
                this.nextSlide();
            }
        });
    }

    addResizeHandler() {
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                this.updateCarouselPosition(false);
            }, 250);
        });
    }

    addIntersectionObserver() {
        if (!this.carouselTrack) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    console.log('Experience carousel in view - starting autoplay');
                    this.startAutoplay();
                } else {
                    console.log('Experience carousel out of view - pausing autoplay');
                    this.pauseAutoplay();
                }
            });
        }, { threshold: 0.5 });

        observer.observe(this.carouselTrack);
    }

    startAutoplay() {
        this.pauseAutoplay();
        if (!this.carouselTrack) return;
        
        console.log('Starting experience carousel autoplay');
        this.autoplayInterval = setInterval(() => {
            if (!document.hidden) {
                this.nextSlide();
            }
        }, 6000);
    }

    pauseAutoplay() {
        if (this.autoplayInterval) {
            console.log('Pausing experience carousel autoplay');
            clearInterval(this.autoplayInterval);
            this.autoplayInterval = null;
        }
    }

    resetAutoplay() {
        this.pauseAutoplay();
        this.startAutoplay();
    }
}

// Initialize the carousel when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded - initializing experience carousel');
    new ExperienceCarousel();
});
