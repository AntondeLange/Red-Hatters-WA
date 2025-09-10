// Red Hatters WA - Main JavaScript File

// Header scroll effect
window.addEventListener('scroll', function() {
    const header = document.getElementById('header');
    if (window.scrollY > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Mobile menu toggle (if needed in future)
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) {
        mobileMenu.classList.toggle('active');
    }
}

// Newsletter form submission
function handleNewsletterSubmit(event) {
    event.preventDefault();
    const email = event.target.querySelector('input[type="email"]').value;
    
    if (email) {
        // Here you would typically send the email to your backend
        alert('Thank you for subscribing to our newsletter!');
        event.target.reset();
    } else {
        alert('Please enter a valid email address.');
    }
}

// Initialize newsletter forms
document.addEventListener('DOMContentLoaded', function() {
    const newsletterForms = document.querySelectorAll('.newsletter-form');
    newsletterForms.forEach(form => {
        form.addEventListener('submit', handleNewsletterSubmit);
    });
    
    // Update copyright year automatically
    updateCopyrightYear();
});

// Function to update copyright year
function updateCopyrightYear() {
    const currentYearElement = document.getElementById('current-year');
    if (currentYearElement) {
        const currentYear = new Date().getFullYear();
        currentYearElement.textContent = currentYear;
    }
}

// Contact form submission
function handleContactSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    
    // Here you would typically send the form data to your backend
    alert('Thank you for your message! We will get back to you soon.');
    event.target.reset();
}

// Initialize contact forms
document.addEventListener('DOMContentLoaded', function() {
    const contactForms = document.querySelectorAll('form:not(.newsletter-form)');
    contactForms.forEach(form => {
        form.addEventListener('submit', handleContactSubmit);
    });
});

// Dropdown menu functionality for mobile
function initDropdownMenus() {
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            const dropdown = this.nextElementSibling;
            const isOpen = dropdown.style.display === 'block';
            
            // Close all other dropdowns
            document.querySelectorAll('.dropdown-menu').forEach(menu => {
                menu.style.display = 'none';
            });
            
            // Toggle current dropdown
            dropdown.style.display = isOpen ? 'none' : 'block';
        });
    });
}

// Initialize dropdown menus
document.addEventListener('DOMContentLoaded', initDropdownMenus);

// Close dropdowns when clicking outside
document.addEventListener('click', function(e) {
    if (!e.target.closest('.nav-dropdown')) {
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
            menu.style.display = 'none';
        });
    }
});

// Utility functions
const utils = {
    // Debounce function for performance
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Throttle function for scroll events
    throttle: function(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};

// Optimized scroll handler
const optimizedScrollHandler = utils.throttle(function() {
    const header = document.getElementById('header');
    if (window.scrollY > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
}, 16); // ~60fps

// Replace the original scroll listener with optimized version
window.removeEventListener('scroll', window.scrollHandler);
window.addEventListener('scroll', optimizedScrollHandler);

