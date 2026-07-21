/* 
  NIRMAN DEVELOPER - HEADER INTERACTIVE CONTROLLER
  Controls: Sticky on scroll, mobile menu toggling, accessibility, and active state tracking.
*/

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================================================
  // 1. Sticky Navigation Scroll Handler
  // ==========================================================================
  const headerNav = document.getElementById('header-nav');
  
  const handleScroll = () => {
    if (window.scrollY > 20) {
      headerNav.classList.add('scrolled');
    } else {
      headerNav.classList.remove('scrolled');
    }
  };

  // Run scroll check on load and scroll events
  window.addEventListener('scroll', handleScroll);
  handleScroll();

  // ==========================================================================
  // 2. Mobile Navigation Drawer Controller
  // ==========================================================================
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const drawerCloseBtn = document.getElementById('drawer-close-btn');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  const openMobileMenu = () => {
    mobileDrawer.classList.add('active');
    document.body.classList.add('scroll-locked');
    drawerCloseBtn.focus(); // Shift focus to close trigger for screen readers
  };

  const closeMobileMenu = () => {
    mobileDrawer.classList.remove('active');
    document.body.classList.remove('scroll-locked');
    mobileMenuBtn.focus(); // Restore keyboard focus
  };

  // Toggle events
  if (mobileMenuBtn && mobileDrawer && drawerCloseBtn) {
    mobileMenuBtn.addEventListener('click', openMobileMenu);
    drawerCloseBtn.addEventListener('click', closeMobileMenu);

    // Close when clicking links
    mobileNavLinks.forEach(link => {
      link.addEventListener('click', closeMobileMenu);
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      const isDrawerOpen = mobileDrawer.classList.contains('active');
      const clickedInsideDrawer = mobileDrawer.contains(e.target);
      const clickedMenuBtn = mobileMenuBtn.contains(e.target);
      
      if (isDrawerOpen && !clickedInsideDrawer && !clickedMenuBtn) {
        closeMobileMenu();
      }
    });

    // Keyboard ESC key exit handler
    document.addEventListener('keydown', (e) => {
      const isDrawerOpen = mobileDrawer.classList.contains('active');
      if (isDrawerOpen && e.key === 'Escape') {
        closeMobileMenu();
      }
    });
  }

  // ==========================================================================
  // 3. Multi-page Active Link Highlighter
  // ==========================================================================
  const currentPathname = window.location.pathname;
  const desktopLinks = document.querySelectorAll('.nav-menu .nav-link');
  const mobileLinks = document.querySelectorAll('.mobile-nav-list .mobile-nav-link');

  const highlightActive = (links) => {
    links.forEach(link => {
      const href = link.getAttribute('href');
      
      // Clear initial active styling
      link.classList.remove('active');

      // Check if it matches the current path
      if (href) {
        const linkPageName = href.substring(href.lastIndexOf('/') + 1);
        const currentPageName = currentPathname.substring(currentPathname.lastIndexOf('/') + 1);
        
        // Handle default root indices
        if ((currentPageName === '' || currentPageName === 'index.html') && 
            (linkPageName === 'index.html' || linkPageName === '#')) {
          link.classList.add('active');
        } else if (currentPageName !== '' && currentPageName !== 'index.html' && linkPageName === currentPageName) {
          link.classList.add('active');
        }
      }
    });
  };

  highlightActive(desktopLinks);
  highlightActive(mobileLinks);
});
