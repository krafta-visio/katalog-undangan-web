(function($) { 
	"use strict";

	/* JavaScript Document */
jQuery(document).ready(function() {
    'use strict';
	
	/*  Testimonial function by = owl.carousel.js */
	jQuery('.testimonial-carousel-one').owlCarousel({
		loop:true,
		autoplay:true,
		margin:0,
		nav:true,
		autoplaySpeed: 1500,
		navSpeed: 1500,
		paginationSpeed: 1500,
		slideSpeed: 1500,
		dots: true,
		navText: ['<i class="fa fa-caret-left"></i>', '<i class="fa fa-caret-right"></i>'],
		responsive:{
			0:{
				items:1
			},
			480:{
				items:1
			},			
			991:{
				items:1
			},
			1000:{
				items:1
			}
		}
	})
	
	/*  Blog post Carousel function by = owl.carousel.js */
	jQuery('.testimonial-carousel-two').owlCarousel({
		loop:true,
		autoplay:true,
		margin:0,
		nav:true,
		autoplaySpeed: 1500,
		navSpeed: 1500,
		paginationSpeed: 1500,
		slideSpeed: 1500,
		dots: true,
		navText: ['<i class="fa fa-caret-left"></i>', '<i class="fa fa-caret-right"></i>'],
		responsive:{
			0:{
				items:1
			},
			480:{
				items:1
			},			
			991:{
				items:2
			},
			1000:{
				items:2
			}
		}
	})
	
	/*  Testimonial Carousel Three function by = owl.carousel.js */
	jQuery('.testimonial-carousel-three').owlCarousel({
		loop:true,
		autoplay:true,
		center: true,
		margin: 15,
		nav:true,
		autoplaySpeed: 1500,
		navSpeed: 1500,
		paginationSpeed: 1500,
		slideSpeed: 1500,
		dots: true,
		navText: ['<i class="fa fa-caret-left"></i>', '<i class="fa fa-caret-right"></i>'],
		responsive:{
			0:{
				items:1
			},
			480:{
				items:1
			},			
			991:{
				items:2
			},
			1000:{
				items:3
			}
		}
	})
	
	/*  Testimonial Carousel Three function by = owl.carousel.js */
	jQuery('.portfolio-carousel-one').owlCarousel({
		loop:true,
		autoplay:true,
		center: true,
		margin: 0,
		nav:true,
		autoplaySpeed: 1500,
		navSpeed: 1500,
		paginationSpeed: 1500,
		slideSpeed: 1500,
		dots: true,
		navText: ['<i class="fa fa-long-arrow-left"></i>', '<i class="fa fa-long-arrow-right"></i>'],
		responsive:{
			0:{
				items:1
			},
			480:{
				items:1
			},			
			991:{
				items:1
			},
			1000:{
				items:1
			}
		}
	})
	/*  Testimonial Carousel Three function by = owl.carousel.js */
	jQuery('.portfolio-carousel-two').owlCarousel({
		loop:true,
		autoplay:true,
		margin: 30,
		nav:true,
		stagePadding: 300,
		autoplaySpeed: 1500,
		navSpeed: 1500,
		paginationSpeed: 1500,
		slideSpeed: 1500,
		dots: false,
		navText: ['<i class="fa fa-long-arrow-left"></i>', '<i class="fa fa-long-arrow-right"></i>'],
		responsive:{
			0:{
				items:1,
				stagePadding: 70,
			},
			600:{
				items:1,
				stagePadding: 70,
			},			
			768:{
				items:2,
				stagePadding: 70,
			},
			1000:{
				items:2,
				stagePadding: 100,
			},
			1200:{
				items:2,
			}
		}
	})
	
	/*  Testimonial Carousel Three function by = owl.carousel.js */
	jQuery('.portfolio-carousel-three').owlCarousel({
		loop:true,
		/* autoplay:true, */
		margin: 15,
		center: true,
		nav:true,
		autoplaySpeed: 1500,
		navSpeed: 1500,
		paginationSpeed: 1500,
		slideSpeed: 1500,
		dots: false,
		navText: ['<i class="fa fa-long-arrow-left"></i>', '<i class="fa fa-long-arrow-right"></i>'],
		responsive:{
			0:{
				items:1
			},
			600:{
				items:2
			},			
			768:{
				items:2
			},
			1000:{
				items:2
			},
			1200:{
				items:3
			}
		}
	})
	
	/*  Testimonial Carousel Three function by = owl.carousel.js */
	jQuery('.portfolio-carousel-four').owlCarousel({
		loop:true,
		autoplay:true,
		margin: 10,
		nav:true,
		autoplaySpeed: 1500,
		navSpeed: 1500,
		paginationSpeed: 1500,
		slideSpeed: 1500,
		dots: false,
		navText: ['<i class="fa fa-long-arrow-left"></i>', '<i class="fa fa-long-arrow-right"></i>'],
		responsive:{
			0:{
				items:1
			},
			480:{
				items:1
			},			
			991:{
				items:1
			},
			1000:{
				items:2
			}
		}
	})
	
	/*  Testimonial Carousel Three function by = owl.carousel.js */
	jQuery('.slide-post-carousel').owlCarousel({
		loop:true,
		autoplay:true,
		margin: 0,
		nav:true,
		autoplaySpeed: 1500,
		navSpeed: 1500,
		paginationSpeed: 1500,
		slideSpeed: 1500,
		dots: true,
		navText: ['<i class="fa fa-long-arrow-left"></i>', '<i class="fa fa-long-arrow-right"></i>'],
		responsive:{
			0:{
				items:1
			},
			480:{
				items:1
			},			
			991:{
				items:1
			},
			1000:{
				items:1
			}
		}
	})
	
});
/* Document .ready END */

	
})(jQuery);	