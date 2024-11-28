$(document).ready(function(){
    // Initialize Experience Carousel
    $('.experience-carousel').slick({
        dots: true,
        arrows: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 6000,
        prevArrow: '<button type="button" class="slick-prev"></button>',
        nextArrow: '<button type="button" class="slick-next"></button>',
        responsive: [{
            breakpoint: 480,
            settings: {
                arrows: false,
                dots: true
            }
        }]
    });

    // Initialize Testimonial Slider
    $('.testimonial-slider').slick({
        dots: true,
        arrows: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 5000,
        prevArrow: '<button type="button" class="slick-prev"></button>',
        nextArrow: '<button type="button" class="slick-next"></button>',
        responsive: [{
            breakpoint: 480,
            settings: {
                arrows: false,
                dots: true
            }
        }]
    });

    // Pause on hover
    $('.experience-carousel, .testimonial-slider')
        .on('mouseenter', function() {
            $(this).slick('slickPause');
        })
        .on('mouseleave', function() {
            $(this).slick('slickPlay');
        });
});
