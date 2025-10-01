// Red Hatters WA - Enhanced JavaScript with Bootstrap 5 Integration
// Version 2.1 - Cache Busting and Performance Optimized

// Global configuration
const CONFIG = {
    scrollThreshold: 100,
    animationDuration: 300,
    debounceDelay: 16, // ~60fps
    throttleDelay: 100,
    errorReporting: true,
    performanceMonitoring: true,
    version: '2.2' // Cache busting version
};

// Cache Busting Utility
const CacheBuster = {
    // Force reload with cache busting
    forceReload: function() {
        const timestamp = new Date().getTime();
        const currentUrl = new URL(window.location);
        currentUrl.searchParams.set('_cb', timestamp);
        window.location.href = currentUrl.toString();
    },
    
    // Check if page needs refresh (for development)
    checkForUpdates: function() {
        // Only run in development mode
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            const lastVersion = localStorage.getItem('rhwa_version');
            if (lastVersion !== CONFIG.version) {
                console.log('New version detected, clearing cache...');
                this.clearCache();
                localStorage.setItem('rhwa_version', CONFIG.version);
            }
        }
    },
    
    // Clear various caches
    clearCache: function() {
        // Clear service worker cache if available
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(function(registrations) {
                for(let registration of registrations) {
                    registration.unregister();
                }
            });
        }
        
        // Clear localStorage cache markers
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith('rhwa_cache_')) {
                localStorage.removeItem(key);
            }
        });
    }
};

// Global Error Handler
window.addEventListener('error', function(event) {
    console.error('Global Error:', event.error);
    
    if (CONFIG.errorReporting) {
        // Send error to analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'exception', {
                description: event.error?.message || 'Unknown error',
                fatal: false
            });
        }
        
        // Show user-friendly error message
        Utils.showToast('Something went wrong. Please try again.', 'error');
    }
});

// Unhandled Promise Rejection Handler
window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled Promise Rejection:', event.reason);
    
    if (CONFIG.errorReporting) {
        // Send error to analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'exception', {
                description: event.reason?.message || 'Promise rejection',
                fatal: false
            });
        }
        
        // Show user-friendly error message
        Utils.showToast('A network error occurred. Please check your connection.', 'error');
    }
    
    // Prevent the default handler
    event.preventDefault();
});

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
    },

    // Performance monitoring
    measurePerformance: function(name, fn) {
        if (!CONFIG.performanceMonitoring) return fn();
        
        const start = performance.now();
        const result = fn();
        const end = performance.now();
        
        console.log(`Performance: ${name} took ${end - start} milliseconds`);
        
        // Send to analytics if available
        if (typeof gtag !== 'undefined') {
            gtag('event', 'timing_complete', {
                name: name,
                value: Math.round(end - start)
            });
        }
        
        return result;
    },

    // Network status monitoring
    monitorNetworkStatus: function() {
        const updateNetworkStatus = () => {
            const isOnline = navigator.onLine;
            const statusElement = document.getElementById('network-status');
            
            if (statusElement) {
                statusElement.textContent = isOnline ? 'Online' : 'Offline';
                statusElement.className = isOnline ? 'status-online' : 'status-offline';
            }
            
            // Show notification for status changes
            if (isOnline) {
                Utils.showToast('Connection restored!', 'success');
            } else {
                Utils.showToast('You are now offline. Some features may not be available.', 'warning');
            }
        };
        
        window.addEventListener('online', updateNetworkStatus);
        window.addEventListener('offline', updateNetworkStatus);
        
        // Initial check
        updateNetworkStatus();
    },

    // Enhanced error handling for async operations
    handleAsyncError: function(error, context = 'Unknown') {
        console.error(`Error in ${context}:`, error);
        
        if (CONFIG.errorReporting && typeof gtag !== 'undefined') {
            gtag('event', 'exception', {
                description: `${context}: ${error.message || error}`,
                fatal: false
            });
        }
        
        return Utils.showToast(`An error occurred in ${context}. Please try again.`, 'error');
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
                const isOpen = dropdown.classList.contains('show');
                
                // Close all other dropdowns and reset their aria-expanded
                document.querySelectorAll('.dropdown-menu').forEach(menu => {
                    menu.classList.remove('show');
                    menu.classList.add('hide');
                });
                document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
                    toggle.setAttribute('aria-expanded', 'false');
                });
                
                // Toggle current dropdown
                if (isOpen) {
                    dropdown.classList.remove('show');
                    dropdown.classList.add('hide');
                    this.setAttribute('aria-expanded', 'false');
                } else {
                    dropdown.classList.remove('hide');
                    dropdown.classList.add('show');
                    this.setAttribute('aria-expanded', 'true');
                }
            });
        });

        // Close dropdowns when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.nav-dropdown')) {
                document.querySelectorAll('.dropdown-menu').forEach(menu => {
                    menu.classList.remove('show');
                    menu.classList.add('hide');
                });
                document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
                    toggle.setAttribute('aria-expanded', 'false');
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

// Backend Configuration - Now uses external config.js
const BackendConfig = {
    getConfig: function() {
        return window.RedHattersConfig.utils.getCurrentConfig();
    },
    
    getEndpoint: function(type) {
        const config = this.getConfig();
        
        // If using fallback with Formspree
        if (config.useFormspree && window.RedHattersConfig.formspree[type]) {
            return window.RedHattersConfig.formspree[type];
        }
        
        // Otherwise use API endpoint
        return window.RedHattersConfig.utils.getApiEndpoint(type);
    },
    
    isFallbackMode: function() {
        const config = this.getConfig();
        return config.useFormspree === true;
    }
};

// Enhanced Form handling with backend integration
const FormManager = {
    init: function() {
        this.initNewsletterForms();
        this.initContactForms();
        this.initRegistrationForms();
        this.initAccountForms();
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

    initAccountForms: function() {
        const accountForms = document.querySelectorAll('.account-form');
        accountForms.forEach(form => {
            // Determine form type based on class names
            if (form.classList.contains('profile-form')) {
                form.addEventListener('submit', this.handleProfileUpdate.bind(this));
            } else if (form.classList.contains('password-form')) {
                form.addEventListener('submit', this.handlePasswordChange.bind(this));
            } else if (form.classList.contains('settings-form')) {
                form.addEventListener('submit', this.handleSettingsUpdate.bind(this));
            } else if (form.classList.contains('donation-form')) {
                form.addEventListener('submit', this.handleDonationSubmit.bind(this));
            }
        });
    },

    // Enhanced newsletter submission with backend integration
    handleNewsletterSubmit: function(event) {
        event.preventDefault();
        const form = event.target;
        const email = form.querySelector('input[type="email"]').value;
        
        if (!email) {
            Utils.showToast('Please enter a valid email address.', 'warning');
            return;
        }

        this.setLoadingState(form, true);
        
        const formData = {
            email: email,
            type: 'newsletter',
            timestamp: new Date().toISOString(),
            source: window.location.href
        };

        this.submitToBackend('newsletter', formData)
            .then(() => {
                Utils.showToast('Thank you for subscribing to our newsletter!', 'success');
                form.reset();
            })
            .catch((error) => {
                console.error('Newsletter submission error:', error);
                Utils.showToast('Failed to subscribe. Please try again later.', 'error');
            })
            .finally(() => {
                this.setLoadingState(form, false);
            });
    },

    // Enhanced contact form submission with backend integration
    handleContactSubmit: function(event) {
        event.preventDefault();
        const form = event.target;
        
        // Validate form before submission
        if (!this.validateForm(form)) {
            return;
        }
        
        this.setLoadingState(form, true);
        
        const formData = this.collectFormData(form);
        
        // Add additional metadata
        formData.type = 'contact';
        formData.timestamp = new Date().toISOString();
        formData.source = window.location.href;
        formData.userAgent = navigator.userAgent;

        this.submitToBackend('contact', formData)
            .then(() => {
                Utils.showToast('Thank you for your message! We will get back to you soon.', 'success');
                this.clearFormErrors(form);
                form.reset();
            })
            .catch((error) => {
                console.error('Contact submission error:', error);
                Utils.showToast('Failed to send message. Please try again later.', 'error');
            })
            .finally(() => {
                this.setLoadingState(form, false);
            });
    },

    // Enhanced form validation
    validateForm: function(form) {
        let isValid = true;
        this.clearFormErrors(form);
        
        // Validate required fields
        const requiredFields = form.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                this.showFieldError(field, 'This field is required');
                isValid = false;
            }
        });
        
        // Validate email
        const emailField = form.querySelector('input[type="email"]');
        if (emailField && emailField.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailField.value)) {
                this.showFieldError(emailField, 'Please enter a valid email address');
                isValid = false;
            }
        }
        
        // Validate URL
        const urlField = form.querySelector('input[type="url"]');
        if (urlField && urlField.value) {
            try {
                new URL(urlField.value);
            } catch {
                this.showFieldError(urlField, 'Please enter a valid URL');
                isValid = false;
            }
        }
        
        // Validate text length
        const textFields = form.querySelectorAll('input[type="text"], textarea');
        textFields.forEach(field => {
            if (field.minLength && field.value.length < field.minLength) {
                this.showFieldError(field, `Minimum ${field.minLength} characters required`);
                isValid = false;
            }
            if (field.maxLength && field.value.length > field.maxLength) {
                this.showFieldError(field, `Maximum ${field.maxLength} characters allowed`);
                isValid = false;
            }
        });
        
        return isValid;
    },

    // Show field error
    showFieldError: function(field, message) {
        field.classList.add('error');
        const errorElement = document.getElementById(field.name + '-error');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }
    },

    // Clear form errors
    clearFormErrors: function(form) {
        const errorElements = form.querySelectorAll('.form-error');
        errorElements.forEach(error => {
            error.classList.remove('show');
            error.textContent = '';
        });
        
        const fields = form.querySelectorAll('input, textarea');
        fields.forEach(field => {
            field.classList.remove('error');
        });
    },

    // Enhanced registration submission with backend integration
    handleRegistrationSubmit: function(event) {
        event.preventDefault();
        const form = event.target;
        
        this.setLoadingState(form, true);
        
        const formData = this.collectFormData(form);
        
        // Add additional metadata
        formData.type = 'registration';
        formData.timestamp = new Date().toISOString();
        formData.source = window.location.href;

        this.submitToBackend('registration', formData)
            .then(() => {
                Utils.showToast('Thank you for your interest in joining Red Hatters WA! We will contact you soon.', 'success');
                form.reset();
            })
            .catch((error) => {
                console.error('Registration submission error:', error);
                Utils.showToast('Failed to submit registration. Please try again later.', 'error');
            })
            .finally(() => {
                this.setLoadingState(form, false);
            });
    },

    // Profile update form handler
    handleProfileUpdate: function(event) {
        event.preventDefault();
        const form = event.target;
        
        this.setLoadingState(form, true);
        
        const formData = this.collectFormData(form);
        
        // Add additional metadata
        formData.type = 'profile_update';
        formData.timestamp = new Date().toISOString();
        formData.source = window.location.href;
        formData.userId = this.getCurrentUserId(); // You'll need to implement this

        this.submitToBackend('profile', formData)
            .then(() => {
                Utils.showToast('Profile updated successfully!', 'success');
                // Optionally update the UI to reflect changes
                this.updateProfileDisplay(formData);
            })
            .catch((error) => {
                console.error('Profile update error:', error);
                Utils.showToast('Failed to update profile. Please try again later.', 'error');
            })
            .finally(() => {
                this.setLoadingState(form, false);
            });
    },

    // Password change form handler
    handlePasswordChange: function(event) {
        event.preventDefault();
        const form = event.target;
        
        // Validate passwords match
        const newPassword = form.querySelector('input[name="newPassword"]').value;
        const confirmPassword = form.querySelector('input[name="confirmPassword"]').value;
        
        if (newPassword !== confirmPassword) {
            Utils.showToast('New passwords do not match. Please try again.', 'warning');
            return;
        }
        
        this.setLoadingState(form, true);
        
        const formData = this.collectFormData(form);
        
        // Add additional metadata
        formData.type = 'password_change';
        formData.timestamp = new Date().toISOString();
        formData.source = window.location.href;
        formData.userId = this.getCurrentUserId();

        this.submitToBackend('password', formData)
            .then(() => {
                Utils.showToast('Password updated successfully!', 'success');
                form.reset();
            })
            .catch((error) => {
                console.error('Password change error:', error);
                Utils.showToast('Failed to update password. Please check your current password and try again.', 'error');
            })
            .finally(() => {
                this.setLoadingState(form, false);
            });
    },

    // Settings update form handler
    handleSettingsUpdate: function(event) {
        event.preventDefault();
        const form = event.target;
        
        this.setLoadingState(form, true);
        
        const formData = this.collectFormData(form);
        
        // Add additional metadata
        formData.type = 'settings_update';
        formData.timestamp = new Date().toISOString();
        formData.source = window.location.href;
        formData.userId = this.getCurrentUserId();

        this.submitToBackend('settings', formData)
            .then(() => {
                Utils.showToast('Settings saved successfully!', 'success');
            })
            .catch((error) => {
                console.error('Settings update error:', error);
                Utils.showToast('Failed to save settings. Please try again later.', 'error');
            })
            .finally(() => {
                this.setLoadingState(form, false);
            });
    },

    // Donation form handler
    handleDonationSubmit: function(event) {
        event.preventDefault();
        const form = event.target;
        
        // Validate required fields
        const amount = form.querySelector('input[name="amount"]').value;
        const donorName = form.querySelector('input[name="donorName"]').value;
        const donorEmail = form.querySelector('input[name="donorEmail"]').value;
        
        if (!amount || amount <= 0) {
            Utils.showToast('Please enter a valid donation amount.', 'warning');
            return;
        }
        
        if (!donorName || !donorEmail) {
            Utils.showToast('Please fill in all required fields.', 'warning');
            return;
        }
        
        this.setLoadingState(form, true);
        
        const formData = this.collectFormData(form);
        
        // Add additional metadata
        formData.type = 'donation';
        formData.timestamp = new Date().toISOString();
        formData.source = window.location.href;
        formData.currency = 'AUD';
        formData.status = 'pending';

        this.submitToBackend('donation', formData)
            .then(() => {
                const donationType = formData.donationType === 'recurring' ? 'recurring donation' : 'donation';
                Utils.showToast(`Thank you for your ${donationType} of $${amount}! You will be redirected to our secure payment processor.`, 'success');
                form.reset();
            })
            .catch((error) => {
                console.error('Donation submission error:', error);
                Utils.showToast('Failed to process donation. Please try again later.', 'error');
            })
            .finally(() => {
                this.setLoadingState(form, false);
            });
    },

    // Collect form data into a structured object
    collectFormData: function(form) {
        const formData = new FormData(form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        return data;
    },

    // Get current user ID (placeholder - implement based on your auth system)
    getCurrentUserId: function() {
        // This should be implemented based on your authentication system
        // For now, return a placeholder or get from localStorage/sessionStorage
        return localStorage.getItem('userId') || 'current_user';
    },

    // Update profile display after successful update
    updateProfileDisplay: function(formData) {
        // Update the profile info in the sidebar
        const profileInfo = document.querySelector('.profile-info h3');
        if (profileInfo && formData.firstName && formData.lastName) {
            profileInfo.textContent = `${formData.firstName} ${formData.lastName}`;
        }
        
        // Update other profile elements as needed
        // This is a placeholder - implement based on your UI needs
    },

    // Set loading state for form submission
    setLoadingState: function(form, isLoading) {
        const submitButton = form.querySelector('button[type="submit"]');
        if (!submitButton) return;

        if (isLoading) {
            submitButton.disabled = true;
            submitButton.dataset.originalText = submitButton.textContent;
            submitButton.textContent = 'Loading...';
            submitButton.classList.add('loading');
        } else {
            submitButton.disabled = false;
            submitButton.textContent = submitButton.dataset.originalText || 'Submit';
            submitButton.classList.remove('loading');
            delete submitButton.dataset.originalText;
        }
    },

    // Submit data to backend with proper error handling
    submitToBackend: function(type, data) {
        const endpoint = BackendConfig.getEndpoint(type);
        const config = BackendConfig.getConfig();
        
        // Debug logging
        window.RedHattersConfig.utils.debug(`Submitting ${type} form`, {
            endpoint: endpoint,
            environment: window.RedHattersConfig.environment.current,
            data: data
        });
        
        // If using fallback (Formspree), handle differently
        if (BackendConfig.isFallbackMode()) {
            return this.submitToFallback(endpoint, data);
        }
        
        // Production/Development API submission
        return fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        });
    },

    // Handle fallback service submission (e.g., Formspree)
    submitToFallback: function(endpoint, data) {
        const formData = new FormData();
        
        // Convert data object to FormData for Formspree
        for (let key in data) {
            if (data.hasOwnProperty(key)) {
                formData.append(key, data[key]);
            }
        }

        return fetch(endpoint, {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        });
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

// Authentication Manager
const AuthManager = {
    // Session management
    sessionTimeout: 30 * 60 * 1000, // 30 minutes in milliseconds
    inactivityTimer: null,
    warningTimer: null,
    
    isLoggedIn: function() {
        const loginTime = localStorage.getItem('redHattersLoginTime');
        if (!loginTime) return false;
        
        const now = Date.now();
        const timeSinceLogin = now - parseInt(loginTime);
        
        // Check if session has expired
        if (timeSinceLogin > this.sessionTimeout) {
            this.logout();
            return false;
        }
        
        return localStorage.getItem('redHattersLoggedIn') === 'true';
    },

    login: function(username, password) {
        // Demo credentials for testing
        const demoCredentials = {
            'demo': 'password123',
            'testuser': 'testpass',
            'admin': 'admin123',
            'member': 'member123'
        };
        
        // Simple authentication - in production, this would connect to a backend
        if (username && password) {
            // Check demo credentials first
            if (demoCredentials[username] && demoCredentials[username] === password) {
                localStorage.setItem('redHattersLoggedIn', 'true');
                localStorage.setItem('redHattersUsername', username);
                localStorage.setItem('redHattersUserRole', 'member');
                localStorage.setItem('redHattersUserEmail', `${username}@redhatterswa.com.au`);
                localStorage.setItem('redHattersLoginTime', Date.now().toString());
                Utils.showToast(`Welcome back, ${username}!`, 'success');
                this.startSessionManagement();
                return true;
            }
            // For demo purposes, accept any username/password combination
            else if (username.length >= 3 && password.length >= 6) {
                localStorage.setItem('redHattersLoggedIn', 'true');
                localStorage.setItem('redHattersUsername', username);
                localStorage.setItem('redHattersUserRole', 'member');
                localStorage.setItem('redHattersUserEmail', `${username}@redhatterswa.com.au`);
                localStorage.setItem('redHattersLoginTime', Date.now().toString());
                Utils.showToast(`Welcome, ${username}!`, 'success');
                this.startSessionManagement();
                return true;
            }
        }
        
        Utils.showToast('Invalid username or password. Try demo/password123', 'error');
        return false;
    },

    logout: function() {
        localStorage.removeItem('redHattersLoggedIn');
        localStorage.removeItem('redHattersUsername');
        localStorage.removeItem('redHattersUserRole');
        localStorage.removeItem('redHattersUserEmail');
        localStorage.removeItem('redHattersLoginTime');
        this.stopSessionManagement();
        window.location.href = 'index.html';
    },

    startSessionManagement: function() {
        this.stopSessionManagement(); // Clear any existing timers
        
        // Reset timers on user activity
        const resetTimers = () => {
            this.resetInactivityTimer();
        };
        
        // Listen for user activity
        document.addEventListener('mousedown', resetTimers);
        document.addEventListener('mousemove', resetTimers);
        document.addEventListener('keypress', resetTimers);
        document.addEventListener('scroll', resetTimers);
        document.addEventListener('touchstart', resetTimers);
        
        // Start the initial timer
        this.resetInactivityTimer();
    },

    stopSessionManagement: function() {
        if (this.inactivityTimer) {
            clearTimeout(this.inactivityTimer);
            this.inactivityTimer = null;
        }
        if (this.warningTimer) {
            clearTimeout(this.warningTimer);
            this.warningTimer = null;
        }
    },

    resetInactivityTimer: function() {
        if (this.inactivityTimer) {
            clearTimeout(this.inactivityTimer);
        }
        
        // Set warning timer (5 minutes before logout)
        this.warningTimer = setTimeout(() => {
            this.showSessionWarning();
        }, this.sessionTimeout - (5 * 60 * 1000));
        
        // Set logout timer
        this.inactivityTimer = setTimeout(() => {
            this.handleSessionTimeout();
        }, this.sessionTimeout);
    },

    showSessionWarning: function() {
        Utils.showToast('Your session will expire in 5 minutes due to inactivity. Click anywhere to extend your session.', 'warning', 10000);
    },

    handleSessionTimeout: function() {
        Utils.showToast('Your session has expired due to inactivity. Please log in again.', 'error');
        this.logout();
    },

    // Clear demo state for public pages
    clearDemoState: function() {
        localStorage.removeItem('redHattersLoggedIn');
        localStorage.removeItem('redHattersUsername');
        localStorage.removeItem('redHattersUserRole');
        this.updateNavigation();
    },

    getUsername: function() {
        return localStorage.getItem('redHattersUsername') || 'Member';
    },

    checkProtectedAccess: function() {
        const protectedPages = [
            'members-corner.html', 'member-search.html', 'member-role.html', 'member-handbook.html',
            'resources.html', 'events.html', 'newsletter.html', 'games.html', 'crafts.html', 
            'printables.html', 'recipes.html', 'news-notes.html', 'discussions.html', 'offers.html',
            'account.html', 'wa-chapters.html', 'hatter-customs.html'
        ];
        
        const currentPage = window.location.pathname.split('/').pop();
        
        if (protectedPages.includes(currentPage) && !this.isLoggedIn()) {
            Utils.showToast('Please log in to access this page.', 'warning');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        }
    },

    updateNavigation: function() {
        const isLoggedIn = this.isLoggedIn();
        const username = this.getUsername();
        
        // Update navigation based on login status
        this.toggleNavigationElements(isLoggedIn);
        
        // Update user display
        this.updateUserDisplay(isLoggedIn, username);
    },

    toggleNavigationElements: function(isLoggedIn) {
        // Hide/show protected navigation elements
        const protectedNavElements = document.querySelectorAll('.protected-nav');
        const publicNavElements = document.querySelectorAll('.public-nav');
        
        protectedNavElements.forEach(element => {
            element.style.display = isLoggedIn ? 'block' : 'none';
        });
        
        publicNavElements.forEach(element => {
            element.style.display = isLoggedIn ? 'none' : 'block';
        });
    },

    updateUserDisplay: function(isLoggedIn, username) {
        const userDisplay = document.querySelector('.user-display');
        const loginButton = document.querySelector('.login-button');
        const logoutButton = document.querySelector('.logout-button');
        
        if (userDisplay) {
            userDisplay.textContent = isLoggedIn ? `Welcome, ${username}!` : '';
            userDisplay.style.display = isLoggedIn ? 'block' : 'none';
        }
        
        if (loginButton) {
            loginButton.style.display = isLoggedIn ? 'none' : 'block';
        }
        
        if (logoutButton) {
            logoutButton.style.display = isLoggedIn ? 'block' : 'none';
        }
    },

    // Note: Donate and Contact Us links are now handled by HTML structure
    // - Public pages: standalone links in navbar
    // - Member pages: links inside About dropdown
    // No JavaScript needed for this functionality
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
        // Check for cache updates first
        CacheBuster.checkForUpdates();
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', this.initializeComponents.bind(this));
        } else {
            this.initializeComponents();
        }
    },

    initializeComponents: function() {
        // Clear any demo login state for public pages
        const currentPage = window.location.pathname.split('/').pop();
        const publicPages = ['index.html', 'about-us.html', 'benefits.html', 'history.html', 'pinkhatters.html', 'faq.html', 'contact-us.html', 'register.html', 'login.html', 'donate.html'];
        
        if (publicPages.includes(currentPage)) {
            // Clear demo login state for public pages
            localStorage.removeItem('redHattersLoggedIn');
            localStorage.removeItem('redHattersUsername');
            localStorage.removeItem('redHattersUserRole');
        }
        
        // Initialize authentication first
        AuthManager.checkProtectedAccess();
        AuthManager.updateNavigation();
        
        // Start session management if user is logged in
        if (AuthManager.isLoggedIn()) {
            AuthManager.startSessionManagement();
        }
        
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
        ChatbotManager.init();
        HootIdeasFormManager.init();
        
        // Initialize monitoring
        Utils.monitorNetworkStatus();

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

// Like System Functionality
function toggleLike(newsletterId) {
    const likeBtn = document.querySelector(`[data-newsletter="${newsletterId}"]`);
    const likeCount = document.getElementById(`like-count-${newsletterId}`);
    
    if (!likeBtn || !likeCount) return;
    
    // Toggle liked state
    const isLiked = likeBtn.classList.contains('liked');
    let currentCount = parseInt(likeCount.textContent) || 0;
    
    if (isLiked) {
        // Unlike
        likeBtn.classList.remove('liked');
        currentCount--;
    } else {
        // Like
        likeBtn.classList.add('liked');
        currentCount++;
    }
    
    // Update count
    likeCount.textContent = currentCount;
    
    // Store like state in localStorage
    const likedNewsletters = JSON.parse(localStorage.getItem('likedNewsletters') || '{}');
    likedNewsletters[newsletterId] = !isLiked;
    localStorage.setItem('likedNewsletters', JSON.stringify(likedNewsletters));
    
    // Show feedback
    showLikeFeedback(!isLiked);
}

function showLikeFeedback(liked) {
    // Create temporary feedback message
    const feedback = document.createElement('div');
    feedback.className = `like-feedback ${liked ? 'liked' : 'unliked'}`;
    feedback.innerHTML = `<i class="fas fa-${liked ? 'heart' : 'heart-broken'}"></i> ${liked ? 'Liked!' : 'Unliked'}`;
    
    // Style the feedback
    Object.assign(feedback.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: liked ? 'var(--primary-red)' : 'var(--text-light)',
        color: 'white',
        padding: '10px 15px',
        borderRadius: '25px',
        fontSize: '14px',
        fontWeight: '500',
        zIndex: '9999',
        boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
        transform: 'translateX(100px)',
        opacity: '0',
        transition: 'all 0.3s ease'
    });
    
    document.body.appendChild(feedback);
    
    // Animate in
    setTimeout(() => {
        feedback.style.transform = 'translateX(0)';
        feedback.style.opacity = '1';
    }, 10);
    
    // Remove after 2 seconds
    setTimeout(() => {
        feedback.style.transform = 'translateX(100px)';
        feedback.style.opacity = '0';
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
            }
        }, 300);
    }, 2000);
}

function initializeLikeStates() {
    // Load saved like states from localStorage
    const likedNewsletters = JSON.parse(localStorage.getItem('likedNewsletters') || '{}');
    
    Object.keys(likedNewsletters).forEach(newsletterId => {
        if (likedNewsletters[newsletterId]) {
            const likeBtn = document.querySelector(`[data-newsletter="${newsletterId}"]`);
            if (likeBtn) {
                likeBtn.classList.add('liked');
            }
        }
    });
}

// Start the application
App.init();

// Initialize like states when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeLikeStates();
});

// Chatbot Manager
const ChatbotManager = {
    // Public chatbot knowledge base with page links
    publicKnowledge: {
        greetings: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'],
        about: ['what is', 'tell me about', 'about red hatters', 'who are you', 'mission'],
        membership: ['join', 'membership', 'become a member', 'how to join', 'benefits'],
        events: ['events', 'activities', 'meetings', 'gatherings', 'calendar'],
        contact: ['contact', 'phone', 'email', 'address', 'location', 'where'],
        help: ['help', 'support', 'assistance', 'questions'],
        hoot_ideas: ['ideas', 'activities', 'hoot ideas', 'event ideas', 'gathering ideas'],
        crafts: ['crafts', 'crafting', 'diy', 'projects', 'making'],
        games: ['games', 'playing', 'fun activities', 'entertainment'],
        printables: ['printables', 'downloads', 'print', 'materials']
    },

    // Member chatbot knowledge base with page links
    memberKnowledge: {
        account: ['account', 'profile', 'settings', 'password', 'update'],
        resources: ['resources', 'downloads', 'handbook', 'guides', 'materials'],
        chat: ['chat', 'discussions', 'talk', 'message', 'conversation'],
        events: ['events', 'activities', 'meetings', 'calendar', 'rsvp'],
        members: ['find members', 'member search', 'directory', 'other members'],
        navigation: ['navigation', 'menu', 'pages', 'links', 'site map'],
        hoot_ideas: ['ideas', 'activities', 'hoot ideas', 'event ideas', 'gathering ideas'],
        crafts: ['crafts', 'crafting', 'diy', 'projects', 'making'],
        games: ['games', 'playing', 'fun activities', 'entertainment'],
        printables: ['printables', 'downloads', 'print', 'materials'],
        newsletter: ['newsletter', 'news', 'updates', 'subscribe'],
        chapters: ['chapters', 'wa chapters', 'local groups', 'near me']
    },

    // Page mapping for suggestions
    pageMap: {
        about: 'about-us.html',
        benefits: 'benefits.html',
        membership: 'register.html',
        events: 'events.html',
        contact: 'contact-us.html',
        resources: 'resources.html',
        hoot_ideas: 'hoot-ideas.html',
        crafts: 'crafts.html',
        games: 'games.html',
        printables: 'printables.html',
        newsletter: 'newsletter.html',
        chapters: 'wa-chapters.html',
        account: 'account.html',
        discussions: 'discussions.html',
        members: 'member-search.html',
        handbook: 'member-handbook.html',
        faq: 'faq.html',
        donate: 'donate.html'
    },

    // Response templates with suggestions
    responses: {
        public: {
            greeting: {
                message: "Hello! Welcome to Red Hatters WA! I'm here to help you learn about our amazing community. What would you like to know? 😊",
                suggestions: ['Learn About Us', 'Join Membership', 'View Events', 'Get Ideas', 'Contact Us']
            },
            about: {
                message: "Red Hatters WA is a vibrant community of women over 50 who believe in fun, friendship, and frivolity! We're part of the international Red Hat Society, celebrating life with style, laughter, and purple hats. Our mission is to connect amazing women across Western Australia through social activities, events, and lifelong friendships.",
                suggestions: ['View Benefits', 'Join Membership', 'Find Chapters', 'Read FAQ']
            },
            membership: {
                message: "Becoming a Red Hatter is easy and rewarding! Members enjoy access to exclusive events, social gatherings, member resources, our online community, and the chance to make lifelong friendships. You can join by visiting our membership page or contacting us directly. We'd love to have you in our purple sisterhood! 💜",
                suggestions: ['Register Now', 'View Benefits', 'Contact Us', 'Read FAQ']
            },
            events: {
                message: "We host wonderful events throughout Western Australia! From monthly social gatherings and themed parties to day trips, craft workshops, and special celebrations. Check our events calendar for upcoming activities, and feel free to contact us for more information about specific events.",
                suggestions: ['View Events', 'Get Ideas', 'Find Chapters', 'Contact Us']
            },
            contact: {
                message: "You can reach us through our contact form on the website, email us at info@redhatterswa.com.au, or call us. We're always happy to answer questions and help you get involved with our community!",
                suggestions: ['Contact Form', 'View Events', 'Join Membership', 'Read FAQ']
            },
            hoot_ideas: {
                message: "Looking for creative ideas for your next Red Hat gathering? We have a fantastic collection of activity ideas, themes, and event suggestions! From craft days to themed parties, there's something for everyone.",
                suggestions: ['Browse Ideas', 'View Crafts', 'See Games', 'Check Printables']
            },
            crafts: {
                message: "Crafting is a wonderful way to express creativity and bond with fellow Red Hatters! We have various craft projects, DIY ideas, and creative activities perfect for our community gatherings.",
                suggestions: ['View Crafts', 'Get Ideas', 'Check Printables', 'See Events']
            },
            games: {
                message: "Games and fun activities are at the heart of our Red Hat gatherings! We have a variety of games, entertainment ideas, and interactive activities to keep everyone engaged and having fun.",
                suggestions: ['Play Games', 'Get Ideas', 'View Events', 'Check Printables']
            },
            printables: {
                message: "We offer a range of printable materials including handbooks, guides, activity sheets, and resources to enhance your Red Hat experience. All available for easy download!",
                suggestions: ['Browse Printables', 'Get Ideas', 'View Crafts', 'Check Resources']
            },
            default: {
                message: "I'd be happy to help! You can ask me about Red Hatters WA, membership, events, or how to contact us. What would you like to know?",
                suggestions: ['Learn About Us', 'Join Membership', 'View Events', 'Get Ideas', 'Contact Us']
            }
        },
        member: {
            greeting: {
                message: "Welcome back! Great to see you again. How can I assist you with your member account today? 💜",
                suggestions: ['My Account', 'View Events', 'Find Members', 'Browse Resources']
            },
            account: {
                message: "I can help you with your account settings! You can update your profile information, change your password, manage your privacy settings, and view your membership details. Use the tabs in your account page to navigate between different sections.",
                suggestions: ['Open Account', 'Update Profile', 'Change Password', 'View Settings']
            },
            resources: {
                message: "As a member, you have access to exclusive resources including our member handbook, craft guides, event materials, and printable resources. Check the Resources section in the navigation menu to explore all available materials.",
                suggestions: ['Browse Resources', 'Read Handbook', 'View Crafts', 'Check Printables']
            },
            chat: {
                message: "You can connect with other members through our chat rooms! Visit the Discussions page to join conversations, share ideas, or just chat with your fellow Red Hatters. It's a great way to stay connected between events.",
                suggestions: ['Join Discussions', 'Find Members', 'View Events', 'Share Ideas']
            },
            events: {
                message: "Check out our Events page for upcoming activities and gatherings! You can RSVP to events, see who else is attending, and get all the details you need. Don't forget to mark your calendar for our regular social meetings.",
                suggestions: ['View Events', 'Get Ideas', 'Find Members', 'Check Calendar']
            },
            members: {
                message: "Use the Member Search feature to find and connect with other Red Hatters in your area or with similar interests. You can search by location, interests, or browse through our member directory.",
                suggestions: ['Search Members', 'View Chapters', 'Join Discussions', 'Update Profile']
            },
            hoot_ideas: {
                message: "Looking for creative ideas for your next Red Hat gathering? We have a fantastic collection of activity ideas, themes, and event suggestions! From craft days to themed parties, there's something for everyone.",
                suggestions: ['Browse Ideas', 'View Crafts', 'See Games', 'Check Printables']
            },
            crafts: {
                message: "Crafting is a wonderful way to express creativity and bond with fellow Red Hatters! We have various craft projects, DIY ideas, and creative activities perfect for our community gatherings.",
                suggestions: ['View Crafts', 'Get Ideas', 'Check Printables', 'See Events']
            },
            games: {
                message: "Games and fun activities are at the heart of our Red Hat gatherings! We have a variety of games, entertainment ideas, and interactive activities to keep everyone engaged and having fun.",
                suggestions: ['Play Games', 'Get Ideas', 'View Events', 'Check Printables']
            },
            printables: {
                message: "We offer a range of printable materials including handbooks, guides, activity sheets, and resources to enhance your Red Hat experience. All available for easy download!",
                suggestions: ['Browse Printables', 'Get Ideas', 'View Crafts', 'Check Resources']
            },
            newsletter: {
                message: "Stay updated with our newsletter! Get the latest news, event announcements, member spotlights, and exclusive content delivered to your inbox.",
                suggestions: ['Subscribe Newsletter', 'View Events', 'Check News', 'Update Settings']
            },
            chapters: {
                message: "Find Red Hat chapters near you! We have chapters throughout Western Australia where you can connect with local members and participate in regional activities.",
                suggestions: ['Find Chapters', 'Search Members', 'View Events', 'Contact Us']
            },
            navigation: {
                message: "The website is designed to be easy to navigate! Use the main menu for general pages, and the Members/Resources dropdowns for member-exclusive content. Your Account page has all your personal settings and information.",
                suggestions: ['My Account', 'Browse Resources', 'View Events', 'Find Members']
            },
            default: {
                message: "I'm here to help with your member account and website navigation! You can ask me about account settings, member resources, events, finding other members, or how to use the website.",
                suggestions: ['My Account', 'View Events', 'Find Members', 'Browse Resources']
            }
        }
    },

    // Initialize chatbots
    init: function() {
        this.initPublicChatbot();
        this.initMemberChatbot();
    },

    // Initialize public chatbot
    initPublicChatbot: function() {
        const chatbot = document.getElementById('public-chatbot');
        const toggleBtn = document.getElementById('public-chatbot-toggle-btn');
        const toggle = document.getElementById('public-chatbot-toggle');
        const input = document.getElementById('public-chatbot-input');
        const sendBtn = document.getElementById('public-chatbot-send');

        if (!chatbot || !toggleBtn) return;

        // Toggle chatbot
        toggleBtn.addEventListener('click', () => {
            chatbot.classList.toggle('open');
            toggleBtn.classList.toggle('hidden');
            if (chatbot.classList.contains('open')) {
                input.focus();
            }
        });

        toggle.addEventListener('click', () => {
            chatbot.classList.remove('open');
            toggleBtn.classList.remove('hidden');
        });

        // Send message
        const sendMessage = () => {
            const message = input.value.trim();
            if (!message) return;

            this.addMessage('public-chatbot-messages', message, 'user');
            input.value = '';
            
            // Show typing indicator
            this.showTyping('public-chatbot-messages');
            
            // Generate response
            setTimeout(() => {
                this.hideTyping('public-chatbot-messages');
                const response = this.generateResponse(message, 'public');
                this.addMessage('public-chatbot-messages', response, 'bot');
            }, 1000 + Math.random() * 1000);
        };

        sendBtn.addEventListener('click', sendMessage);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    },

    // Initialize member chatbot
    initMemberChatbot: function() {
        const chatbot = document.getElementById('member-chatbot');
        const toggleBtn = document.getElementById('member-chatbot-toggle-btn');
        const toggle = document.getElementById('member-chatbot-toggle');
        const input = document.getElementById('member-chatbot-input');
        const sendBtn = document.getElementById('member-chatbot-send');

        if (!chatbot || !toggleBtn) return;

        // Toggle chatbot
        toggleBtn.addEventListener('click', () => {
            chatbot.classList.toggle('open');
            toggleBtn.classList.toggle('hidden');
            if (chatbot.classList.contains('open')) {
                input.focus();
            }
        });

        toggle.addEventListener('click', () => {
            chatbot.classList.remove('open');
            toggleBtn.classList.remove('hidden');
        });

        // Send message
        const sendMessage = () => {
            const message = input.value.trim();
            if (!message) return;

            this.addMessage('member-chatbot-messages', message, 'user');
            input.value = '';
            
            // Show typing indicator
            this.showTyping('member-chatbot-messages');
            
            // Generate response
            setTimeout(() => {
                this.hideTyping('member-chatbot-messages');
                const response = this.generateResponse(message, 'member');
                this.addMessage('member-chatbot-messages', response, 'bot');
            }, 1000 + Math.random() * 1000);
        };

        sendBtn.addEventListener('click', sendMessage);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    },

    // Add message to chatbot
    addMessage: function(containerId, message, sender, suggestions = null) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `chatbot-message ${sender}-message`;

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = sender === 'bot' ? 
            (containerId.includes('member') ? '<i class="fas fa-user-tie"></i>' : '<i class="fas fa-robot"></i>') :
            '<i class="fas fa-user"></i>';

        const content = document.createElement('div');
        content.className = 'message-content';
        
        // Handle both string messages and object messages with suggestions
        if (typeof message === 'string') {
        content.innerHTML = `<p>${message}</p>`;
        } else if (message && message.message) {
            content.innerHTML = `<p>${message.message}</p>`;
            
            // Add suggestions if available
            if (message.suggestions && message.suggestions.length > 0) {
                const suggestionsDiv = document.createElement('div');
                suggestionsDiv.className = 'chatbot-suggestions';
                
                message.suggestions.forEach(suggestion => {
                    const button = document.createElement('button');
                    button.className = 'suggestion-button';
                    button.textContent = suggestion;
                    button.addEventListener('click', () => {
                        this.handleSuggestionClick(suggestion, containerId);
                    });
                    suggestionsDiv.appendChild(button);
                });
                
                content.appendChild(suggestionsDiv);
            }
        } else {
            content.innerHTML = `<p>${message}</p>`;
        }

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
        container.appendChild(messageDiv);
        
        // Scroll to bottom
        container.scrollTop = container.scrollHeight;
    },

    // Show typing indicator
    showTyping: function(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const typingDiv = document.createElement('div');
        typingDiv.className = 'chatbot-message bot-message typing-indicator';
        typingDiv.id = 'typing-indicator';

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = containerId.includes('member') ? '<i class="fas fa-user-tie"></i>' : '<i class="fas fa-robot"></i>';

        const content = document.createElement('div');
        content.className = 'message-content';
        content.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';

        typingDiv.appendChild(avatar);
        typingDiv.appendChild(content);
        container.appendChild(typingDiv);
        container.scrollTop = container.scrollHeight;
    },

    // Hide typing indicator
    hideTyping: function(containerId) {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    },

    // Handle suggestion button clicks
    handleSuggestionClick: function(suggestion, containerId) {
        // Map suggestion text to page navigation
        const suggestionMap = {
            'Learn About Us': 'about',
            'Join Membership': 'membership',
            'View Events': 'events',
            'Get Ideas': 'hoot_ideas',
            'Contact Us': 'contact',
            'View Benefits': 'benefits',
            'Find Chapters': 'chapters',
            'Read FAQ': 'faq',
            'Register Now': 'membership',
            'Contact Form': 'contact',
            'Browse Ideas': 'hoot_ideas',
            'View Crafts': 'crafts',
            'See Games': 'games',
            'Check Printables': 'printables',
            'My Account': 'account',
            'View Events': 'events',
            'Find Members': 'members',
            'Browse Resources': 'resources',
            'Open Account': 'account',
            'Update Profile': 'account',
            'Change Password': 'account',
            'View Settings': 'account',
            'Read Handbook': 'handbook',
            'Join Discussions': 'discussions',
            'Search Members': 'members',
            'Update Profile': 'account',
            'Subscribe Newsletter': 'newsletter',
            'Check News': 'newsletter',
            'Update Settings': 'account',
            'Play Games': 'games',
            'Check Calendar': 'events',
            'Share Ideas': 'hoot_ideas',
            'Check Resources': 'resources'
        };

        const pageKey = suggestionMap[suggestion];
        if (pageKey && this.pageMap[pageKey]) {
            // Navigate to the page
            window.location.href = this.pageMap[pageKey];
        } else {
            // If no direct page mapping, treat as a regular message
            const input = containerId.includes('member') ? 
                document.getElementById('member-chatbot-input') : 
                document.getElementById('public-chatbot-input');
            
            if (input) {
                input.value = suggestion;
                // Trigger the send message function
                const sendBtn = containerId.includes('member') ? 
                    document.getElementById('member-chatbot-send') : 
                    document.getElementById('public-chatbot-send');
                
                if (sendBtn) {
                    sendBtn.click();
                }
            }
        }
    },

    // Generate response based on message and chatbot type
    generateResponse: function(message, type) {
        const lowerMessage = message.toLowerCase();
        const knowledge = type === 'member' ? this.memberKnowledge : this.publicKnowledge;
        const responses = this.responses[type];

        // Check for specific topics
        for (const [topic, keywords] of Object.entries(knowledge)) {
            if (keywords.some(keyword => lowerMessage.includes(keyword))) {
                return responses[topic] || responses.default;
            }
        }

        // Check for greetings
        if (this.publicKnowledge.greetings.some(greeting => lowerMessage.includes(greeting))) {
            return responses.greeting;
        }

        return responses.default;
    }
};

// Hoot Ideas Form Manager
const HootIdeasFormManager = {
    init: function() {
        const form = document.getElementById('hoot-ideas-form');
        if (!form) return;

        form.addEventListener('submit', this.handleSubmit.bind(this));
        
        // Add real-time validation
        this.addRealTimeValidation();
        
        // Handle form reset
        const resetBtn = document.getElementById('reset-form');
        if (resetBtn) {
            resetBtn.addEventListener('click', this.resetForm.bind(this));
        }
    },

    handleSubmit: function(event) {
        event.preventDefault();
        const form = event.target;
        
        // Validate form
        if (!this.validateForm(form)) {
            return;
        }
        
        // Set loading state
        this.setLoadingState(form, true);
        
        // Collect form data
        const formData = this.collectFormData(form);
        
        // Add metadata
        formData.type = 'hoot_idea';
        formData.timestamp = new Date().toISOString();
        formData.source = window.location.href;
        formData.userAgent = navigator.userAgent;

        // Submit to backend
        this.submitToBackend(formData)
            .then(() => {
                Utils.showToast('Thank you for sharing your Hoot Idea! We\'ll review it and may feature it on our website.', 'success');
                this.resetForm(form);
            })
            .catch((error) => {
                console.error('Hoot idea submission error:', error);
                Utils.showToast('Failed to submit your idea. Please try again later.', 'error');
            })
            .finally(() => {
                this.setLoadingState(form, false);
            });
    },

    validateForm: function(form) {
        let isValid = true;
        this.clearFormErrors(form);
        
        // Required fields validation
        const requiredFields = form.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                this.showFieldError(field, 'This field is required');
                isValid = false;
            }
        });
        
        // Specific validations
        const ideaTitle = form.querySelector('#idea-title');
        if (ideaTitle && ideaTitle.value.length < 5) {
            this.showFieldError(ideaTitle, 'Idea title must be at least 5 characters long');
            isValid = false;
        }
        
        const ideaDescription = form.querySelector('#idea-description');
        if (ideaDescription && ideaDescription.value.length < 20) {
            this.showFieldError(ideaDescription, 'Description must be at least 20 characters long');
            isValid = false;
        }
        
        // Email validation if provided
        const emailField = form.querySelector('#your-email');
        if (emailField && emailField.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailField.value)) {
                this.showFieldError(emailField, 'Please enter a valid email address');
                isValid = false;
            }
        }
        
        return isValid;
    },

    showFieldError: function(field, message) {
        field.classList.add('error');
        const errorElement = document.getElementById(field.name + '-error');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }
    },

    clearFormErrors: function(form) {
        const errorElements = form.querySelectorAll('.form-error');
        errorElements.forEach(error => {
            error.classList.remove('show');
            error.textContent = '';
        });
        
        const fields = form.querySelectorAll('input, select, textarea');
        fields.forEach(field => {
            field.classList.remove('error');
        });
    },

    addRealTimeValidation: function() {
        const form = document.getElementById('hoot-ideas-form');
        if (!form) return;

        // Add event listeners for real-time validation
        const fields = form.querySelectorAll('input, select, textarea');
        fields.forEach(field => {
            field.addEventListener('blur', () => {
                this.validateField(field);
            });
            
            field.addEventListener('input', () => {
                if (field.classList.contains('error')) {
                    this.validateField(field);
                }
            });
        });
    },

    validateField: function(field) {
        const value = field.value.trim();
        
        // Clear previous error
        field.classList.remove('error');
        const errorElement = document.getElementById(field.name + '-error');
        if (errorElement) {
            errorElement.classList.remove('show');
        }
        
        // Required field validation
        if (field.hasAttribute('required') && !value) {
            this.showFieldError(field, 'This field is required');
            return false;
        }
        
        // Specific field validations
        if (field.id === 'idea-title' && value && value.length < 5) {
            this.showFieldError(field, 'Idea title must be at least 5 characters long');
            return false;
        }
        
        if (field.id === 'idea-description' && value && value.length < 20) {
            this.showFieldError(field, 'Description must be at least 20 characters long');
            return false;
        }
        
        if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                this.showFieldError(field, 'Please enter a valid email address');
                return false;
            }
        }
        
        return true;
    },

    collectFormData: function(form) {
        const formData = new FormData(form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        return data;
    },

    setLoadingState: function(form, isLoading) {
        const submitButton = form.querySelector('#submit-hoot-idea');
        const resetButton = form.querySelector('#reset-form');
        
        if (isLoading) {
            submitButton.disabled = true;
            submitButton.classList.add('loading');
            submitButton.innerHTML = '<i class="fas fa-spinner"></i> Submitting...';
            resetButton.disabled = true;
        } else {
            submitButton.disabled = false;
            submitButton.classList.remove('loading');
            submitButton.innerHTML = '<i class="fas fa-paper-plane"></i> Share Your Idea';
            resetButton.disabled = false;
        }
    },

    resetForm: function(form) {
        if (typeof form === 'string') {
            form = document.getElementById(form);
        }
        if (!form) {
            form = document.getElementById('hoot-ideas-form');
        }
        
        if (form) {
            form.reset();
            this.clearFormErrors(form);
            this.setLoadingState(form, false);
        }
    },

    submitToBackend: function(data) {
        const endpoint = BackendConfig.getEndpoint('hoot_ideas') || BackendConfig.getEndpoint('contact');
        const config = BackendConfig.getConfig();
        
        // Debug logging
        window.RedHattersConfig.utils.debug('Submitting hoot idea', {
            endpoint: endpoint,
            environment: window.RedHattersConfig.environment.current,
            data: data
        });
        
        // If using fallback (Formspree), handle differently
        if (BackendConfig.isFallbackMode()) {
            return this.submitToFallback(endpoint, data);
        }
        
        // Production/Development API submission
        return fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        });
    },

    submitToFallback: function(endpoint, data) {
        const formData = new FormData();
        
        // Convert data object to FormData for Formspree
        for (let key in data) {
            if (data.hasOwnProperty(key)) {
                formData.append(key, data[key]);
            }
        }

        return fetch(endpoint, {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        });
    }
};

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Utils, App, ChatbotManager, HootIdeasFormManager };
}

// RSVP System for Events
const RSVPSystem = {
    // Get RSVP data from localStorage
    getRSVPs: function() {
        const rsvps = localStorage.getItem('redhat_rsvps');
        return rsvps ? JSON.parse(rsvps) : {};
    },
    
    // Save RSVP data to localStorage
    saveRSVPs: function(rsvps) {
        localStorage.setItem('redhat_rsvps', JSON.stringify(rsvps));
    },
    
    // Get current user (simplified - in real app would get from auth system)
    getCurrentUser: function() {
        return {
            id: 'demo_user_001',
            name: 'Demo User',
            email: 'demo@redhatterswa.com'
        };
    },
    
    // RSVP to an event
    rsvpToEvent: function(eventId, status = 'yes') {
        const rsvps = this.getRSVPs();
        const user = this.getCurrentUser();
        
        if (!rsvps[eventId]) {
            rsvps[eventId] = {
                eventId: eventId,
                attendees: [],
                totalCount: 0
            };
        }
        
        // Remove user if already RSVP'd
        rsvps[eventId].attendees = rsvps[eventId].attendees.filter(attendee => attendee.id !== user.id);
        
        // Add user with new status
        if (status !== 'no') {
            rsvps[eventId].attendees.push({
                id: user.id,
                name: user.name,
                email: user.email,
                status: status,
                rsvpDate: new Date().toISOString()
            });
        }
        
        // Update total count
        rsvps[eventId].totalCount = rsvps[eventId].attendees.length;
        
        this.saveRSVPs(rsvps);
        return rsvps[eventId];
    },
    
    // Get RSVP status for an event
    getEventRSVP: function(eventId) {
        const rsvps = this.getRSVPs();
        return rsvps[eventId] || { attendees: [], totalCount: 0 };
    },
    
    // Check if user has RSVP'd to an event
    hasUserRSVPd: function(eventId) {
        const rsvps = this.getRSVPs();
        const user = this.getCurrentUser();
        
        if (!rsvps[eventId]) return false;
        return rsvps[eventId].attendees.some(attendee => attendee.id === user.id);
    },
    
    // Get user's RSVP status for an event
    getUserRSVPStatus: function(eventId) {
        const rsvps = this.getRSVPs();
        const user = this.getCurrentUser();
        
        if (!rsvps[eventId]) return null;
        const attendee = rsvps[eventId].attendees.find(attendee => attendee.id === user.id);
        return attendee ? attendee.status : null;
    },
    
    // Get all events user has RSVP'd to
    getUserRSVPEvents: function() {
        const rsvps = this.getRSVPs();
        const user = this.getCurrentUser();
        const userEvents = [];
        
        for (let eventId in rsvps) {
            const rsvp = rsvps[eventId];
            const userAttendee = rsvp.attendees.find(attendee => attendee.id === user.id);
            if (userAttendee) {
                userEvents.push({
                    eventId: eventId,
                    status: userAttendee.status,
                    rsvpDate: userAttendee.rsvpDate,
                    totalAttendees: rsvp.totalCount
                });
            }
        }
        
        return userEvents;
    }
};

// My Events functionality for account page
const MyEventsManager = {
    // Load and display user's RSVP'd events
    loadMyEvents: function() {
        const userEvents = RSVPSystem.getUserRSVPEvents();
        const upcomingContainer = document.getElementById('upcoming-events-list');
        const pastContainer = document.getElementById('past-events-list');
        
        if (!upcomingContainer || !pastContainer) return;
        
        // Clear existing content
        upcomingContainer.innerHTML = '';
        pastContainer.innerHTML = '';
        
        if (userEvents.length === 0) {
            upcomingContainer.innerHTML = '<div class="no-events"><p>You haven\'t RSVP\'d to any events yet.</p><a href="events.html" class="btn btn-primary">Browse Events</a></div>';
            return;
        }
        
        // Group events by upcoming/past
        const now = new Date();
        const upcomingEvents = [];
        const pastEvents = [];
        
        userEvents.forEach(userEvent => {
            // This is a simplified check - in a real app, you'd fetch event details
            const eventDate = new Date(); // Placeholder - would get actual event date
            if (eventDate >= now) {
                upcomingEvents.push(userEvent);
            } else {
                pastEvents.push(userEvent);
            }
        });
        
        // Display upcoming events
        this.displayEvents(upcomingEvents, upcomingContainer, 'upcoming');
        
        // Display past events
        this.displayEvents(pastEvents, pastContainer, 'past');
    },
    
    // Display events in a container
    displayEvents: function(events, container, type) {
        if (events.length === 0) {
            const message = type === 'upcoming' ? 'No upcoming events.' : 'No past events.';
            container.innerHTML = `<div class="no-events"><p>${message}</p></div>`;
            return;
        }
        
        events.forEach(userEvent => {
            const eventElement = this.createEventElement(userEvent, type);
            container.appendChild(eventElement);
        });
    },
    
    // Create event element
    createEventElement: function(userEvent, type) {
        const eventDiv = document.createElement('div');
        eventDiv.className = 'event-item';
        
        // This is simplified - in a real app, you'd fetch actual event details
        const eventDetails = this.getEventDetails(userEvent.eventId);
        
        eventDiv.innerHTML = `
            <div class="event-date">
                <span class="day">${eventDetails.day}</span>
                <span class="month">${eventDetails.month}</span>
            </div>
            <div class="event-details">
                <h3>${eventDetails.title}</h3>
                <p>${eventDetails.location}</p>
                <span class="event-status ${userEvent.status}">${userEvent.status.charAt(0).toUpperCase() + userEvent.status.slice(1)}</span>
            </div>
            <div class="event-actions">
                <a href="events.html" class="btn btn-secondary">View Details</a>
                <button class="btn btn-outline-primary" onclick="MyEventsManager.showRSVPModal('${userEvent.eventId}')">Manage RSVP</button>
                <button class="btn btn-outline-danger" onclick="MyEventsManager.cancelRSVP('${userEvent.eventId}')">Cancel RSVP</button>
            </div>
        `;
        
        return eventDiv;
    },
    
    // Get event details (simplified - would fetch from API in real app)
    getEventDetails: function(eventId) {
        // This is a placeholder - in a real app, you'd have event data
        const eventTemplates = {
            'event-001': { title: 'Christmas High Tea', location: 'The Ritz Carlton, Perth', day: '15', month: 'Dec' },
            'event-002': { title: 'Craft Workshop: Holiday Decorations', location: 'Community Center, Fremantle', day: '20', month: 'Dec' },
            'event-003': { title: 'New Year Celebration', location: 'Crown Perth', day: '31', month: 'Dec' }
        };
        
        return eventTemplates[eventId] || { title: 'Event', location: 'Location TBD', day: 'TBD', month: 'TBD' };
    },
    
    // Cancel RSVP
    cancelRSVP: function(eventId) {
        if (confirm('Are you sure you want to cancel your RSVP for this event?')) {
            RSVPSystem.rsvpToEvent(eventId, 'no');
            this.loadMyEvents(); // Refresh the display
            this.showNotification('Your RSVP has been cancelled.');
        }
    },
    
    // Update RSVP status
    updateRSVPStatus: function(eventId, newStatus) {
        RSVPSystem.rsvpToEvent(eventId, newStatus);
        this.loadMyEvents(); // Refresh the display
        
        const statusMessages = {
            'yes': 'You have confirmed your attendance!',
            'maybe': 'You have marked yourself as maybe attending.',
            'no': 'You have cancelled your RSVP.'
        };
        
        this.showNotification(statusMessages[newStatus]);
    },
    
    // Show RSVP management modal for My Events
    showRSVPModal: function(eventId) {
        const userEvent = RSVPSystem.getUserRSVPEvents().find(e => e.eventId === eventId);
        if (!userEvent) return;
        
        const eventDetails = this.getEventDetails(eventId);
        const rsvpData = RSVPSystem.getEventRSVP(eventId);
        
        const modal = document.createElement('div');
        modal.className = 'rsvp-modal';
        modal.innerHTML = `
            <div class="rsvp-modal-content">
                <div class="rsvp-modal-header">
                    <h3>Manage RSVP</h3>
                    <button class="rsvp-modal-close">&times;</button>
                </div>
                <div class="rsvp-modal-body">
                    <h4>${eventDetails.title}</h4>
                    <p><strong>Date:</strong> ${eventDetails.day} ${eventDetails.month}</p>
                    <p><strong>Location:</strong> ${eventDetails.location}</p>
                    
                    <div class="rsvp-status">
                        <p><strong>Your Status:</strong> <span class="status-${userEvent.status}">${userEvent.status.toUpperCase()}</span></p>
                    </div>
                    
                    <div class="rsvp-actions">
                        <button class="btn btn-success" onclick="MyEventsManager.updateRSVPStatus('${eventId}', 'yes')">Confirm Attendance</button>
                        <button class="btn btn-warning" onclick="MyEventsManager.updateRSVPStatus('${eventId}', 'maybe')">Maybe</button>
                        <button class="btn btn-danger" onclick="MyEventsManager.updateRSVPStatus('${eventId}', 'no')">Cancel RSVP</button>
                    </div>
                    
                    <div class="rsvp-attendees">
                        <h5>Attendees (${rsvpData.totalCount})</h5>
                        <div class="attendees-list">
                            ${rsvpData.attendees.map(attendee => `
                                <div class="attendee-item">
                                    <span class="attendee-name">${attendee.name}</span>
                                    <span class="attendee-status status-${attendee.status}">${attendee.status}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close modal handlers
        modal.querySelector('.rsvp-modal-close').onclick = () => modal.remove();
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };
    },
    
    // Show notification
    showNotification: function(message) {
        const notification = document.createElement('div');
        notification.className = 'rsvp-notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
};

// Add global function to clear demo state (for debugging)
window.clearDemoState = function() {
    AuthManager.clearDemoState();
    console.log('Demo state cleared. Page will show public navigation.');
};

