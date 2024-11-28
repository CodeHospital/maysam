class TestimonialSlider {
    constructor() {
        this.init();
    }

    init() {
        // Wait for DOM elements to be available
        setTimeout(() => {
            this.slider = document.querySelector('.testimonial-slider');
            if (!this.slider) {
                console.log('Testimonial slider container not found');
                return;
            }

            this.sliderTrack = this.slider.querySelector('.slider-track');
            this.slides = this.slider.querySelectorAll('.slide');
            this.prevButton = this.slider.querySelector('.slider-nav.prev');
            this.nextButton = this.slider.querySelector('.slider-nav.next');
            this.dotsContainer = this.slider.querySelector('.slider-dots');
            
            if (!this.sliderTrack || !this.slides.length) {
                console.log('Testimonial slider elements not found');
                return;
            }

            this.currentSlide = 0;
            this.slidesCount = this.slides.length;
            this.isTransitioning = false;
            this.touchStartX = 0;
            this.touchEndX = 0;
            this.autoplayInterval = null;
            
            // Create dots
            this.createDots();
            
            // Set initial position
            this.updateSliderPosition();
            
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

            console.log('Testimonial slider initialized with', this.slidesCount, 'slides');
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

    updateSliderPosition(animate = true) {
        if (!this.sliderTrack) return;
        
        if (animate) {
            this.sliderTrack.style.transition = 'transform 0.5s ease-in-out';
        } else {
            this.sliderTrack.style.transition = 'none';
        }
        
        const position = -this.currentSlide * 100;
        this.sliderTrack.style.transform = `translateX(${position}%)`;
        
        // Update dots
        const dots = this.dotsContainer.querySelectorAll('.dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentSlide);
        });

        console.log('Updated to slide', this.currentSlide + 1, 'of', this.slidesCount);
    }

    prevSlide() {
        if (this.isTransitioning) return;
        this.isTransitioning = true;
        this.currentSlide = (this.currentSlide - 1 + this.slidesCount) % this.slidesCount;
        this.updateSliderPosition();
        setTimeout(() => this.isTransitioning = false, 500);
        this.resetAutoplay();
    }

    nextSlide() {
        if (this.isTransitioning) return;
        this.isTransitioning = true;
        this.currentSlide = (this.currentSlide + 1) % this.slidesCount;
        this.updateSliderPosition();
        setTimeout(() => this.isTransitioning = false, 500);
        this.resetAutoplay();
    }

    goToSlide(index) {
        if (this.isTransitioning || index === this.currentSlide) return;
        this.isTransitioning = true;
        this.currentSlide = index;
        this.updateSliderPosition();
        setTimeout(() => this.isTransitioning = false, 500);
        this.resetAutoplay();
    }

    addTouchSupport() {
        if (!this.sliderTrack) return;

        this.sliderTrack.addEventListener('touchstart', (e) => {
            this.pauseAutoplay();
            this.touchStartX = e.touches[0].clientX;
        }, { passive: true });

        this.sliderTrack.addEventListener('touchmove', (e) => {
            if (this.isTransitioning) return;
            const currentX = e.touches[0].clientX;
            const diff = this.touchStartX - currentX;
            const position = -this.currentSlide * 100 - (diff / this.sliderTrack.offsetWidth * 100);
            this.sliderTrack.style.transition = 'none';
            this.sliderTrack.style.transform = `translateX(${position}%)`;
        }, { passive: true });

        this.sliderTrack.addEventListener('touchend', (e) => {
            this.touchEndX = e.changedTouches[0].clientX;
            const diff = this.touchStartX - this.touchEndX;
            
            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    this.nextSlide();
                } else {
                    this.prevSlide();
                }
            } else {
                this.updateSliderPosition();
            }
            this.startAutoplay();
        });
    }

    addMouseSupport() {
        if (!this.sliderTrack) return;

        let isDragging = false;
        let startX;
        let scrollLeft;

        this.sliderTrack.addEventListener('mousedown', (e) => {
            isDragging = true;
            this.pauseAutoplay();
            startX = e.pageX - this.sliderTrack.offsetLeft;
            scrollLeft = this.sliderTrack.scrollLeft;
            this.sliderTrack.style.cursor = 'grabbing';
        });

        this.sliderTrack.addEventListener('mouseleave', () => {
            isDragging = false;
            this.sliderTrack.style.cursor = 'grab';
            this.startAutoplay();
        });

        this.sliderTrack.addEventListener('mouseup', () => {
            isDragging = false;
            this.sliderTrack.style.cursor = 'grab';
            this.startAutoplay();
        });

        this.sliderTrack.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            const x = e.pageX - this.sliderTrack.offsetLeft;
            const walk = (x - startX) * 2;
            const position = -this.currentSlide * 100 + (walk / this.sliderTrack.offsetWidth * 100);
            this.sliderTrack.style.transition = 'none';
            this.sliderTrack.style.transform = `translateX(${position}%)`;
        });
    }

    addKeyboardSupport() {
        document.addEventListener('keydown', (e) => {
            // Only handle keyboard events when the slider is in view
            const rect = this.slider.getBoundingClientRect();
            const isInView = rect.top >= 0 && rect.bottom <= window.innerHeight;
            
            if (isInView) {
                if (e.key === 'ArrowLeft') {
                    this.prevSlide();
                } else if (e.key === 'ArrowRight') {
                    this.nextSlide();
                }
            }
        });
    }

    addResizeHandler() {
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                this.updateSliderPosition(false);
            }, 250);
        });
    }

    addIntersectionObserver() {
        if (!this.sliderTrack) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    console.log('Testimonial slider in view - starting autoplay');
                    this.startAutoplay();
                } else {
                    console.log('Testimonial slider out of view - pausing autoplay');
                    this.pauseAutoplay();
                }
            });
        }, { threshold: 0.5 });

        observer.observe(this.slider);
    }

    startAutoplay() {
        this.pauseAutoplay();
        if (!this.sliderTrack) return;
        
        console.log('Starting testimonial slider autoplay');
        this.autoplayInterval = setInterval(() => {
            if (!document.hidden) {
                this.nextSlide();
            }
        }, 5000);
    }

    pauseAutoplay() {
        if (this.autoplayInterval) {
            console.log('Pausing testimonial slider autoplay');
            clearInterval(this.autoplayInterval);
            this.autoplayInterval = null;
        }
    }

    resetAutoplay() {
        this.pauseAutoplay();
        this.startAutoplay();
    }
}

// Initialize the slider when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded - initializing testimonial slider');
    new TestimonialSlider();
});
