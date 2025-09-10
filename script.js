// Red Hatters WA - Enhanced JavaScript with Bootstrap 5 Integration
// Version 2.0 - Streamlined and Optimized

// Global configuration
const CONFIG = {
    scrollThreshold: 100,
    animationDuration: 300,
    debounceDelay: 16, // ~60fps
    throttleDelay: 100
};

// Utility functions
const Utils = {
    // Debounce function for performance optimization
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
    },

    // Show Bootstrap toast notification
    showToast: function(message, type = 'info') {
        const toastContainer = document.getElementById('toast-container') || this.createToastContainer();
        const toastId = 'toast-' + Date.now();
        
        const toastHTML = `
            <div class="toast" id="${toastId}" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="toast-header">
                    <i class="fas fa-${this.getToastIcon(type)} text-${type} me-2"></i>
                    <strong class="me-auto">Red Hatters WA</strong>
                    <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
                </div>
                <div class="toast-body">
                    ${message}
                </div>
            </div>
        `;
        
        toastContainer.insertAdjacentHTML('beforeend', toastHTML);
        const toastElement = document.getElementById(toastId);
        const toast = new bootstrap.Toast(toastElement);
        toast.show();
        
        // Remove toast element after it's hidden
        toastElement.addEventListener('hidden.bs.toast', () => {
            toastElement.remove();
        });
    },

    getToastIcon: function(type) {
        const icons = {
            'success': 'check-circle',
            'error': 'exclamation-circle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle'
        };
        return icons[type] || 'info-circle';
    },

    createToastContainer: function() {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container position-fixed top-0 end-0 p-3';
        container.style.zIndex = '9999';
        document.body.appendChild(container);
        return container;
    }
};

// Header scroll effect with optimization
const HeaderManager = {
    init: function() {
        const header = document.getElementById('header');
        if (!header) return;

        const scrollHandler = Utils.throttle(() => {
            if (window.scrollY > CONFIG.scrollThreshold) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }, CONFIG.debounceDelay);

        window.addEventListener('scroll', scrollHandler);
    }
};

// Smooth scrolling for anchor links
const SmoothScroll = {
    init: function() {
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
    }
};

// Dropdown menu functionality
const DropdownManager = {
    init: function() {
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

        // Close dropdowns when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.nav-dropdown')) {
                document.querySelectorAll('.dropdown-menu').forEach(menu => {
                    menu.style.display = 'none';
                });
            }
        });
    }
};

// FAQ functionality
const FAQManager = {
    init: function() {
        const faqItems = document.querySelectorAll('.faq-item');
        
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            const answer = item.querySelector('.faq-answer');
            const icon = item.querySelector('.faq-icon');
            
            if (question) {
                question.addEventListener('click', () => {
                    const isActive = item.classList.contains('active');
                    
                    // Close all other FAQ items
                    faqItems.forEach(otherItem => {
                        if (otherItem !== item) {
                            otherItem.classList.remove('active');
                        }
                    });
                    
                    // Toggle current item
                    if (isActive) {
                        item.classList.remove('active');
                    } else {
                        item.classList.add('active');
                    }
                });
            }
        });
    }
};

// Form handling
const FormManager = {
    init: function() {
        this.initNewsletterForms();
        this.initContactForms();
        this.initRegistrationForms();
    },

    initNewsletterForms: function() {
        const newsletterForms = document.querySelectorAll('.newsletter-form');
        newsletterForms.forEach(form => {
            form.addEventListener('submit', this.handleNewsletterSubmit.bind(this));
        });
    },

    initContactForms: function() {
        const contactForms = document.querySelectorAll('form:not(.newsletter-form):not(.registration-form)');
        contactForms.forEach(form => {
            form.addEventListener('submit', this.handleContactSubmit.bind(this));
        });
    },

    initRegistrationForms: function() {
        const registrationForms = document.querySelectorAll('.registration-form, .form');
        registrationForms.forEach(form => {
            form.addEventListener('submit', this.handleRegistrationSubmit.bind(this));
        });
    },

    handleNewsletterSubmit: function(event) {
        event.preventDefault();
        const email = event.target.querySelector('input[type="email"]').value;
        
        if (email) {
            Utils.showToast('Thank you for subscribing to our newsletter!', 'success');
            event.target.reset();
        } else {
            Utils.showToast('Please enter a valid email address.', 'warning');
        }
    },

    handleContactSubmit: function(event) {
        event.preventDefault();
        Utils.showToast('Thank you for your message! We will get back to you soon.', 'success');
        event.target.reset();
    },

    handleRegistrationSubmit: function(event) {
        event.preventDefault();
        Utils.showToast('Thank you for your interest in joining Red Hatters WA! We will contact you soon.', 'success');
        event.target.reset();
    }
};

// Event filtering functionality
const EventFilter = {
    init: function() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        const eventsGrid = document.getElementById('eventsGrid');
        
        if (!eventsGrid) return;

        filterButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                filterButtons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                const filter = this.getAttribute('data-filter');
                this.filterEvents(filter);
            });
        });
    },

    filterEvents: function(filter) {
        const eventsGrid = document.getElementById('eventsGrid');
        if (!eventsGrid) return;

        const allEvents = eventsGrid.querySelectorAll('.event-card');
        const filteredEvents = filter === 'all' ? allEvents : 
            Array.from(allEvents).filter(event => 
                event.getAttribute('data-category') === filter
            );
        
        // Hide all events
        allEvents.forEach(event => event.style.display = 'none');
        
        // Show filtered events
        filteredEvents.forEach(event => event.style.display = 'block');
    }
};

// Search functionality
const SearchManager = {
    init: function() {
        const searchInputs = document.querySelectorAll('#search-input, .search-input');
        searchInputs.forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch(input.value);
                }
            });
        });

        const searchButtons = document.querySelectorAll('.search-btn');
        searchButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const input = btn.parentElement.querySelector('input');
                if (input) {
                    this.performSearch(input.value);
                }
            });
        });
    },

    performSearch: function(searchTerm) {
        if (searchTerm.trim()) {
            Utils.showToast(`Search functionality would be implemented here. You searched for: ${searchTerm}`, 'info');
        }
    }
};

// Tab functionality
const TabManager = {
    init: function() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.getAttribute('data-tab');
                
                // Remove active class from all buttons and contents
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Add active class to clicked button and corresponding content
                button.classList.add('active');
                const targetContent = document.getElementById(targetTab);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
            });
        });
    }
};

// Copyright year updater
const CopyrightManager = {
    init: function() {
        const currentYearElements = document.querySelectorAll('#current-year, .current-year');
        const currentYear = new Date().getFullYear();
        
        currentYearElements.forEach(element => {
            element.textContent = currentYear;
        });
    }
};

// Initialize all components
const App = {
    init: function() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', this.initializeComponents.bind(this));
        } else {
            this.initializeComponents();
        }
    },

    initializeComponents: function() {
        // Initialize all managers
        HeaderManager.init();
        SmoothScroll.init();
        DropdownManager.init();
        FAQManager.init();
        EventFilter.init();
        FormManager.init();
        SearchManager.init();
        TabManager.init();
        CopyrightManager.init();

        // Initialize Bootstrap components if available
        this.initializeBootstrapComponents();
    },

    initializeBootstrapComponents: function() {
        // Initialize Bootstrap tooltips
        if (typeof bootstrap !== 'undefined') {
            const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
            tooltipTriggerList.map(function (tooltipTriggerEl) {
                return new bootstrap.Tooltip(tooltipTriggerEl);
            });

            // Initialize Bootstrap popovers
            const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
            popoverTriggerList.map(function (popoverTriggerEl) {
                return new bootstrap.Popover(popoverTriggerEl);
            });
        }
    }
};

// Start the application
App.init();

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Utils, App };
}

