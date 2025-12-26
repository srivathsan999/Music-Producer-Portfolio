// Theme Toggle Functionality
(function() {
  'use strict';

  // Initialize theme from localStorage or default to dark
  const initTheme = () => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.classList.toggle('light', savedTheme === 'light');
    updateThemeIcon(savedTheme);
  };

  // Update theme icon
  const updateThemeIcon = (theme) => {
    const themeIcons = document.querySelectorAll('.theme-icon');
    themeIcons.forEach(icon => {
      if (theme === 'light') {
        icon.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>';
      } else {
        icon.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>';
      }
    });
  };

  // Toggle theme
  const toggleTheme = () => {
    const isLight = document.documentElement.classList.contains('light');
    const newTheme = isLight ? 'dark' : 'light';
    document.documentElement.classList.toggle('light');
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
  };

  // Initialize on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTheme);
  } else {
    initTheme();
  }

  // Attach toggle handler to all theme buttons
  document.addEventListener('click', (e) => {
    if (e.target.closest('.theme-toggle')) {
      e.preventDefault();
      toggleTheme();
    }
  });

  // Navbar scroll behavior
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset;
      if (currentScroll > 100) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
      lastScroll = currentScroll;
    });
  }

  // Intersection Observer for fade-in animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe all fade-in elements
  document.addEventListener('DOMContentLoaded', () => {
    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach(el => observer.observe(el));
    
    // Observe slide-in elements
    const slideElements = document.querySelectorAll('.slide-in-left, .slide-in-right, .scale-in');
    slideElements.forEach(el => observer.observe(el));
  });

  // Enhanced Audio player controls
  const initAudioPlayers = () => {
    const playButtons = document.querySelectorAll('.play-btn[data-track]');
    if (playButtons.length === 0) return;
    
    let currentAudio = null;
    let currentTrack = null;

    const formatTime = (seconds) => {
      if (isNaN(seconds) || !isFinite(seconds) || seconds < 0) return '0:00';
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const updateProgress = (audio, trackNum) => {
      if (!audio || !audio.duration || isNaN(audio.duration)) return;
      
      const trackItem = document.querySelector(`[data-track="${trackNum}"]`)?.closest('.track-item, .track-card');
      if (!trackItem) return;
      
      const progressBar = trackItem.querySelector(`[data-progress="${trackNum}"] .progress-fill`);
      const currentTimeEl = trackItem.querySelector('.current-time');
      
      if (progressBar && currentTimeEl) {
        const percent = (audio.currentTime / audio.duration) * 100;
        progressBar.style.width = Math.min(100, Math.max(0, percent)) + '%';
        currentTimeEl.textContent = formatTime(audio.currentTime);
      }
    };

    const resetTrack = (trackNum) => {
      if (!trackNum) return;
      const trackItem = document.querySelector(`[data-track="${trackNum}"]`)?.closest('.track-item, .track-card');
      if (!trackItem) return;
      
      const playBtn = trackItem.querySelector('.play-btn');
      const progressBar = trackItem.querySelector('.progress-fill');
      const waveform = trackItem.querySelector('.waveform');
      const playIcon = trackItem.querySelector('.play-icon');
      const pauseIcon = trackItem.querySelector('.pause-icon');
      
      if (playBtn) playBtn.classList.remove('playing');
      trackItem.classList.remove('playing');
      if (progressBar) progressBar.style.width = '0%';
      if (waveform) waveform.classList.add('hidden');
      if (playIcon) playIcon.classList.remove('hidden');
      if (pauseIcon) pauseIcon.classList.add('hidden');
    };

    const playTrack = (trackNum) => {
      if (!trackNum) return;
      
      const audio = document.querySelector(`audio[data-audio="${trackNum}"]`);
      const trackItem = document.querySelector(`[data-track="${trackNum}"]`)?.closest('.track-item, .track-card');
      
      if (!audio || !trackItem) return;

      const playBtn = trackItem.querySelector('.play-btn');
      const waveform = trackItem.querySelector('.waveform');
      const playIcon = trackItem.querySelector('.play-icon');
      const pauseIcon = trackItem.querySelector('.pause-icon');

      // Pause current track if different
      if (currentAudio && currentAudio !== audio) {
        currentAudio.pause();
        if (currentTrack) resetTrack(currentTrack);
      }

      if (audio.paused) {
        // Load audio first to ensure it's ready
        audio.load();
        audio.play().then(() => {
          if (playBtn) playBtn.classList.add('playing');
          trackItem.classList.add('playing');
          if (waveform) waveform.classList.remove('hidden');
          if (playIcon) playIcon.classList.add('hidden');
          if (pauseIcon) pauseIcon.classList.remove('hidden');
          currentAudio = audio;
          currentTrack = trackNum;
        }).catch(err => {
          console.error('Error playing audio:', err);
        });
      } else {
        audio.pause();
        if (playBtn) playBtn.classList.remove('playing');
        trackItem.classList.remove('playing');
        if (waveform) waveform.classList.add('hidden');
        if (playIcon) playIcon.classList.remove('hidden');
        if (pauseIcon) pauseIcon.classList.add('hidden');
        currentAudio = null;
        currentTrack = null;
      }
    };

    // Play button click handlers
    playButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const trackNum = btn.getAttribute('data-track');
        if (trackNum) {
          playTrack(trackNum);
        }
      });
    });

    // Progress bar click handlers
    document.querySelectorAll('.progress-bar').forEach(bar => {
      bar.addEventListener('click', (e) => {
        e.stopPropagation();
        const trackNum = bar.getAttribute('data-progress');
        const audio = document.querySelector(`audio[data-audio="${trackNum}"]`);
        if (audio && audio.duration && !isNaN(audio.duration)) {
          const rect = bar.getBoundingClientRect();
          const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
          audio.currentTime = percent * audio.duration;
          updateProgress(audio, trackNum);
        }
      });
    });

    // Audio event listeners
    document.querySelectorAll('audio[data-audio]').forEach(audio => {
      const trackNum = audio.getAttribute('data-audio');
      if (!trackNum) return;
      
      audio.addEventListener('timeupdate', () => {
        updateProgress(audio, trackNum);
      });

      audio.addEventListener('loadedmetadata', () => {
        const trackItem = document.querySelector(`[data-track="${trackNum}"]`)?.closest('.track-item, .track-card');
        if (trackItem) {
          const totalTimeEl = trackItem.querySelector('.total-time');
          if (totalTimeEl && audio.duration && !isNaN(audio.duration)) {
            totalTimeEl.textContent = formatTime(audio.duration);
          }
        }
      });

      audio.addEventListener('ended', () => {
        resetTrack(trackNum);
        currentAudio = null;
        currentTrack = null;
      });

      audio.addEventListener('pause', () => {
        if (audio !== currentAudio) return;
        const trackItem = document.querySelector(`[data-track="${trackNum}"]`)?.closest('.track-item, .track-card');
        if (!trackItem) return;
        
        const playBtn = trackItem.querySelector('.play-btn');
        const waveform = trackItem.querySelector('.waveform');
        const playIcon = trackItem.querySelector('.play-icon');
        const pauseIcon = trackItem.querySelector('.pause-icon');
        
        if (playBtn) playBtn.classList.remove('playing');
        trackItem.classList.remove('playing');
        if (waveform) waveform.classList.add('hidden');
        if (playIcon) playIcon.classList.remove('hidden');
        if (pauseIcon) pauseIcon.classList.add('hidden');
      });

      audio.addEventListener('error', () => {
        const trackItem = document.querySelector(`[data-track="${trackNum}"]`)?.closest('.track-item, .track-card');
        if (trackItem) {
          const playBtn = trackItem.querySelector('.play-btn');
          if (playBtn) {
            playBtn.style.opacity = '0.5';
            playBtn.title = 'Audio file not available';
          }
        }
      });
    });
  };

  // Initialize audio players
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAudioPlayers);
  } else {
    initAudioPlayers();
  }

  // Set active state for Home dropdown
  const setHomeDropdownActive = () => {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const homeDropdown = document.querySelector('.dropdown button#home-dropdown, .mobile-dropdown-toggle');
    
    if (homeDropdown && (currentPage === 'index.html' || currentPage === 'home2.html' || currentPage === '')) {
      homeDropdown.classList.add('text-accent');
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setHomeDropdownActive);
  } else {
    setHomeDropdownActive();
  }

  // Mobile menu toggle
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const mobileMenu = document.querySelector('.mobile-menu');
  const navLinks = document.querySelectorAll('.nav-link:not(.mobile-dropdown-toggle)');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
      mobileMenuBtn.classList.toggle('active');
    });

    // Close menu when clicking a link (but not dropdown toggles)
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        // Don't close if clicking inside a dropdown
        if (!link.closest('.mobile-dropdown')) {
          mobileMenu.classList.add('hidden');
          mobileMenuBtn.classList.remove('active');
        }
      });
    });

    // Close menu when clicking dropdown menu items
    document.querySelectorAll('.mobile-dropdown-menu a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        mobileMenuBtn.classList.remove('active');
      });
    });
  }

  // Mobile dropdown toggle (must run before navLinks handler)
  const mobileDropdownToggles = document.querySelectorAll('.mobile-dropdown-toggle');
  mobileDropdownToggles.forEach(toggle => {
    // Use capture phase to ensure this runs first
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      
      const dropdown = toggle.closest('.mobile-dropdown');
      const menu = dropdown?.querySelector('.mobile-dropdown-menu');
      const icon = toggle.querySelector('svg');
      
      if (menu) {
        const isHidden = menu.classList.contains('hidden');
        
        // Close all other dropdowns
        document.querySelectorAll('.mobile-dropdown-menu').forEach(m => {
          if (m !== menu) {
            m.classList.add('hidden');
          }
        });
        document.querySelectorAll('.mobile-dropdown-toggle svg').forEach(svg => {
          if (svg !== icon) {
            svg.style.transform = '';
          }
        });
        
        // Toggle current dropdown
        if (isHidden) {
          menu.classList.remove('hidden');
          if (icon) icon.style.transform = 'rotate(180deg)';
          toggle.setAttribute('aria-expanded', 'true');
        } else {
          menu.classList.add('hidden');
          if (icon) icon.style.transform = '';
          toggle.setAttribute('aria-expanded', 'false');
        }
      }
      
      return false;
    }, true); // Use capture phase
  });

  // Close dropdowns when clicking outside (but don't close mobile menu)
  document.addEventListener('click', (e) => {
    // Don't close dropdowns if clicking inside mobile dropdown
    if (!e.target.closest('.mobile-dropdown')) {
      // Only close dropdowns if not clicking on mobile menu button
      if (!e.target.closest('.mobile-menu-btn')) {
        document.querySelectorAll('.mobile-dropdown-menu').forEach(menu => {
          menu.classList.add('hidden');
        });
        document.querySelectorAll('.mobile-dropdown-toggle').forEach(toggle => {
          const icon = toggle.querySelector('svg');
          if (icon) icon.style.transform = '';
          toggle.setAttribute('aria-expanded', 'false');
        });
      }
    }
  });

  // Keyboard navigation for dropdowns
  document.querySelectorAll('.dropdown button, .mobile-dropdown-toggle').forEach(button => {
    button.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        button.click();
      } else if (e.key === 'Escape') {
        const dropdown = button.closest('.dropdown, .mobile-dropdown');
        const menu = dropdown?.querySelector('.dropdown-menu, .mobile-dropdown-menu');
        if (menu && !menu.classList.contains('hidden')) {
          menu.classList.add('hidden');
          button.setAttribute('aria-expanded', 'false');
        }
      }
    });
  });
})();

