/* 
  NIRMAN DEVELOPER - MAIN SITE APP SCRIPT
  Controls: Hero interactive triggers, smooth anchoring.
*/

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================================================
  // 1. Hero Section Scroll Down Indicator Handler
  // ==========================================================================
  const heroScrollBtn = document.getElementById('hero-scroll-btn');
  
  if (heroScrollBtn) {
    heroScrollBtn.addEventListener('click', () => {
      // Scrolls the window down exactly one viewport height minus header offset
      const headerOffset = 80; 
      const scrollPosition = window.innerHeight - headerOffset;
      
      window.scrollTo({
        top: scrollPosition,
        behavior: 'smooth'
      });
    });
  }

  // ==========================================================================
  // 2. Statistics Counter Animation (Intersection Observer)
  // ==========================================================================
  const statsSection = document.getElementById('statistics') || document.getElementById('about');
  const statNumbers = document.querySelectorAll('.stat-number, .about-stat-number');
  
  if (statsSection && statNumbers.length > 0) {
    const animateCounters = () => {
      statNumbers.forEach(num => {
        const target = parseInt(num.getAttribute('data-target'), 10);
        const duration = 2000; // Animation duration in milliseconds
        const startTime = performance.now();
        
        const updateCount = (currentTime) => {
          const elapsedTime = currentTime - startTime;
          const progress = Math.min(elapsedTime / duration, 1);
          
          // Easing function: easeOutQuad
          const easeProgress = progress * (2 - progress);
          
          const currentCount = Math.floor(easeProgress * target);
          num.innerText = currentCount;
          
          if (progress < 1) {
            requestAnimationFrame(updateCount);
          } else {
            num.innerText = target; // Ensure exact value at end
          }
        };
        
        requestAnimationFrame(updateCount);
      });
    };

    // Set up Intersection Observer to trigger once only
    const observerOptions = {
      root: null,
      threshold: 0.15
    };

    const statsObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounters();
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    statsObserver.observe(statsSection);
  }

  // ==========================================================================
  // 3. Viewport Scroll Reveal Action (About Fade-Up)
  // ==========================================================================
  const revealElements = document.querySelectorAll('.scroll-reveal');
  
  if (revealElements.length > 0) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.01,
      rootMargin: '0px 0px 150px 0px'
    });
    
    revealElements.forEach(el => revealObserver.observe(el));

    // Safety fallback: reveal all sections automatically after short delay
    setTimeout(() => {
      revealElements.forEach(el => el.classList.add('revealed'));
    }, 300);
  }

  // ==========================================================================
  // 4. Lightbox Gallery Modal Controller
  // ==========================================================================
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('gallery-lightbox');
  const lightboxImg = document.getElementById('lightbox-image');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const closeBtn = document.getElementById('lightbox-close');
  const prevBtn = document.getElementById('lightbox-prev');
  const nextBtn = document.getElementById('lightbox-next');
  
  if (galleryItems.length > 0 && lightbox && lightboxImg) {
    let currentIndex = 0;
    const imagesList = Array.from(galleryItems).map(item => {
      const img = item.querySelector('img');
      const title = item.querySelector('.gallery-title')?.innerText || '';
      const category = item.querySelector('.gallery-badge')?.innerText || '';
      return {
        src: img ? img.getAttribute('src') : '',
        alt: img ? img.getAttribute('alt') : '',
        caption: category ? `${title} (${category})` : title
      };
    });

    const openLightbox = (index) => {
      currentIndex = index;
      updateLightboxContent();
      lightbox.classList.add('active');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.classList.add('scroll-locked');
      closeBtn.focus();
    };

    const closeLightbox = () => {
      lightbox.classList.remove('active');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('scroll-locked');
      // Restore focus to original active gallery item trigger
      galleryItems[currentIndex]?.focus();
    };

    const updateLightboxContent = () => {
      const item = imagesList[currentIndex];
      if (item) {
        lightboxImg.setAttribute('src', item.src);
        lightboxImg.setAttribute('alt', item.alt);
        lightboxCaption.innerText = item.caption;
      }
    };

    const showPrev = (e) => {
      if (e) e.stopPropagation();
      currentIndex = (currentIndex - 1 + imagesList.length) % imagesList.length;
      updateLightboxContent();
    };

    const showNext = (e) => {
      if (e) e.stopPropagation();
      currentIndex = (currentIndex + 1) % imagesList.length;
      updateLightboxContent();
    };

    // Attach click listeners to gallery items
    galleryItems.forEach((item, index) => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        openLightbox(index);
      });

      // Keyboard support for activating item
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(index);
        }
      });
    });

    // Control triggers
    closeBtn.addEventListener('click', closeLightbox);
    prevBtn.addEventListener('click', showPrev);
    nextBtn.addEventListener('click', showNext);

    // Click outside image area to close
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox || e.target.classList.contains('lightbox-content')) {
        closeLightbox();
      }
    });

    // Keyboard controls
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('active')) return;
      
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowLeft') {
        showPrev();
      } else if (e.key === 'ArrowRight') {
        showNext();
      } else if (e.key === 'Tab') {
        // Simple accessibility tab trap inside modal
        const focusableElements = [closeBtn, prevBtn, nextBtn];
        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];
        
        if (e.shiftKey && document.activeElement === first) {
          last.focus();
          e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    });
  }

  // ==========================================================================
  // 5. Testimonial Carousel Slider Manager
  // ==========================================================================
  const slider = document.getElementById('testimonials-slider');
  const track = slider ? slider.querySelector('.slider-track') : null;
  const cards = slider ? slider.querySelectorAll('.testimonial-card') : [];
  const prevBtnSlider = document.getElementById('slider-prev');
  const nextBtnSlider = document.getElementById('slider-next');
  const dotsContainer = document.getElementById('slider-dots');

  if (slider && track && cards.length > 0) {
    let slideIndex = 0;
    let autoSlideInterval = null;
    let visibleCount = 3;

    // Detect visible cards based on CSS/screen size
    const updateVisibleCount = () => {
      const width = window.innerWidth;
      if (width > 1024) {
        visibleCount = 3;
      } else if (width > 768) {
        visibleCount = 2;
      } else {
        visibleCount = 1;
      }
    };

    // Calculate maximum slide index
    const getMaxIndex = () => Math.max(0, cards.length - visibleCount);

    // Create dot indicators dynamically
    const renderDots = () => {
      if (!dotsContainer) return;
      dotsContainer.innerHTML = '';
      const totalDots = getMaxIndex() + 1;
      
      // Only show dots if there's space to slide
      if (totalDots <= 1) return;

      for (let i = 0; i < totalDots; i++) {
        const dot = document.createElement('button');
        dot.classList.add('slider-dot');
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        if (i === slideIndex) dot.classList.add('active');
        
        dot.addEventListener('click', () => {
          goToSlide(i);
        });
        dotsContainer.appendChild(dot);
      }
    };

    // Go to a specific slide index
    const goToSlide = (index) => {
      const maxIndex = getMaxIndex();
      slideIndex = Math.min(Math.max(0, index), maxIndex);
      
      const cardWidth = cards[0].getBoundingClientRect().width;
      const gap = parseFloat(window.getComputedStyle(track).gap) || 0;
      
      track.style.transform = `translateX(-${slideIndex * (cardWidth + gap)}px)`;
      
      // Update dot active states
      const dots = dotsContainer ? dotsContainer.querySelectorAll('.slider-dot') : [];
      dots.forEach((dot, idx) => {
        if (idx === slideIndex) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });

      // Accessibility updates
      cards.forEach((card, idx) => {
        if (idx >= slideIndex && idx < slideIndex + visibleCount) {
          card.removeAttribute('aria-hidden');
          card.querySelectorAll('a, button').forEach(el => el.removeAttribute('tabindex'));
        } else {
          card.setAttribute('aria-hidden', 'true');
          card.querySelectorAll('a, button').forEach(el => el.setAttribute('tabindex', '-1'));
        }
      });
    };

    const nextSlide = () => {
      const maxIndex = getMaxIndex();
      if (slideIndex >= maxIndex) {
        goToSlide(0); // Cycle back to start
      } else {
        goToSlide(slideIndex + 1);
      }
    };

    const prevSlide = () => {
      const maxIndex = getMaxIndex();
      if (slideIndex <= 0) {
        goToSlide(maxIndex); // Cycle to end
      } else {
        goToSlide(slideIndex - 1);
      }
    };

    // Timer functions
    const startAutoSlide = () => {
      if (autoSlideInterval) clearInterval(autoSlideInterval);
      autoSlideInterval = setInterval(nextSlide, 5000);
    };

    const stopAutoSlide = () => {
      if (autoSlideInterval) clearInterval(autoSlideInterval);
    };

    // Event listeners
    if (prevBtnSlider) prevBtnSlider.addEventListener('click', () => { prevSlide(); startAutoSlide(); });
    if (nextBtnSlider) nextBtnSlider.addEventListener('click', () => { nextSlide(); startAutoSlide(); });

    // Pause on hover
    slider.addEventListener('mouseenter', stopAutoSlide);
    slider.addEventListener('mouseleave', startAutoSlide);

    // Keyboard support
    slider.setAttribute('tabindex', '0');
    slider.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
        startAutoSlide();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextSlide();
        startAutoSlide();
      }
    });

    // Touch support for mobile swipe
    let touchStartX = 0;
    let touchEndX = 0;

    slider.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      stopAutoSlide();
    }, { passive: true });

    slider.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
      startAutoSlide();
    }, { passive: true });

    const handleSwipe = () => {
      const swipeDistance = touchEndX - touchStartX;
      if (swipeDistance < -50) {
        nextSlide();
      } else if (swipeDistance > 50) {
        prevSlide();
      }
    };

    // Init & Resize
    const initSlider = () => {
      updateVisibleCount();
      renderDots();
      goToSlide(slideIndex);
      startAutoSlide();
    };

    window.addEventListener('resize', () => {
      const oldVisible = visibleCount;
      updateVisibleCount();
      if (oldVisible !== visibleCount) {
        renderDots();
        goToSlide(Math.min(slideIndex, getMaxIndex()));
      }
    });

    initSlider();
  }

  // ==========================================================================
  // 6. FAQ Accordion Manager
  // ==========================================================================
  const faqTriggers = document.querySelectorAll('.faq-trigger');

  faqTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
      const panelId = trigger.getAttribute('aria-controls');
      const panel = document.getElementById(panelId);
      const icon = trigger.querySelector('.faq-icon');

      // Collapse all other open FAQ items first (since only one can be open at a time)
      faqTriggers.forEach(otherTrigger => {
        if (otherTrigger !== trigger) {
          otherTrigger.setAttribute('aria-expanded', 'false');
          const otherPanelId = otherTrigger.getAttribute('aria-controls');
          const otherPanel = document.getElementById(otherPanelId);
          if (otherPanel) {
            otherPanel.style.maxHeight = '0';
          }
          const otherIcon = otherTrigger.querySelector('.faq-icon');
          if (otherIcon) {
            otherIcon.innerHTML = '&#43;'; // Plus icon
          }
          otherTrigger.closest('.faq-item').classList.remove('active');
        }
      });

      // Toggle active states
      if (isExpanded) {
        trigger.setAttribute('aria-expanded', 'false');
        if (panel) panel.style.maxHeight = '0';
        if (icon) icon.innerHTML = '&#43;'; // Plus icon
        trigger.closest('.faq-item').classList.remove('active');
      } else {
        trigger.setAttribute('aria-expanded', 'true');
        if (panel) panel.style.maxHeight = panel.scrollHeight + 'px';
        if (icon) icon.innerHTML = '&minus;'; // Minus icon
        trigger.closest('.faq-item').classList.add('active');
      }
    });
  });

  // ==========================================================================
  // 7. Back to Top Button Controller
  // ==========================================================================
  const backToTopBtn = document.getElementById('back-to-top-btn');

  if (backToTopBtn) {
    const toggleBackToTopBtn = () => {
      if (window.scrollY > 500) {
        backToTopBtn.classList.add('active');
      } else {
        backToTopBtn.classList.remove('active');
      }
    };

    window.addEventListener('scroll', toggleBackToTopBtn);

    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // ==========================================================================
  // 8. Enquiry Popup Modal Controller (5-Second Delay Auto-Trigger)
  // ==========================================================================
  const enquiryPopup = document.getElementById('enquiry-popup');
  const enquiryCloseBtn = document.getElementById('enquiry-popup-close');

  if (enquiryPopup) {
    const openPopup = () => {
      enquiryPopup.style.display = 'flex';
      enquiryPopup.setAttribute('aria-hidden', 'false');
      sessionStorage.setItem('enquiryPopupShown', 'true');
    };

    const closePopup = () => {
      enquiryPopup.style.display = 'none';
      enquiryPopup.setAttribute('aria-hidden', 'true');
    };

    // Auto popup after 5 seconds on first load, or 5 minutes (300,000ms) if page is refreshed
    let popupDelay = 5000;
    const navEntries = window.performance && window.performance.getEntriesByType ? window.performance.getEntriesByType('navigation') : [];
    const isReload = navEntries.length > 0 && navEntries[0].type === 'reload';

    if (isReload) {
      sessionStorage.removeItem('enquiryPopupShown');
      popupDelay = 10000; // 10 seconds
    }

    if (!sessionStorage.getItem('enquiryPopupShown')) {
      setTimeout(openPopup, popupDelay);
    }

    // Close button trigger
    if (enquiryCloseBtn) {
      enquiryCloseBtn.addEventListener('click', closePopup);
    }

    // Close by clicking background overlay
    enquiryPopup.addEventListener('click', (e) => {
      if (e.target === enquiryPopup) {
        closePopup();
      }
    });

    // Close by pressing Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && enquiryPopup.style.display === 'flex') {
        closePopup();
      }
    });
  }
});
