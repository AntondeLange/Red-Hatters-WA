/**
 * Red Hatters WA - Configuration File
 * 
 * This file contains all configuration settings for the website.
 * Modify these settings to switch between different environments.
 */

window.RedHattersConfig = {
    // Environment Settings
    environment: {
        // Current environment: 'development', 'staging', 'production', 'fallback'
        current: 'fallback',
        
        // Environment-specific settings
        development: {
            debug: true,
            apiUrl: 'http://localhost:3000',
            enableConsoleLogging: true
        },
        
        staging: {
            debug: true,
            apiUrl: 'https://staging-api.red-hatters-wa.net',
            enableConsoleLogging: true
        },
        
        production: {
            debug: false,
            apiUrl: 'https://api.red-hatters-wa.net',
            enableConsoleLogging: false
        },
        
        fallback: {
            debug: true,
            apiUrl: '',
            enableConsoleLogging: true,
            useFormspree: true
        }
    },

    // API Endpoints Configuration
    api: {
        endpoints: {
            contact: '/api/contact',
            newsletter: '/api/newsletter',
            registration: '/api/registration',
            profile: '/api/account/profile',
            password: '/api/account/password',
            settings: '/api/account/settings',
            donation: '/api/donation',
            events: '/api/events',
            members: '/api/members',
            hoot_ideas: '/api/hoot-ideas',
            news_submission: '/api/news-submission'
        }
    },

    // Formspree Configuration (Fallback Service)
    formspree: {
        // Replace these with your actual Formspree form IDs
        contact: 'https://formspree.io/f/YOUR_CONTACT_FORM_ID',
        newsletter: 'https://formspree.io/f/YOUR_NEWSLETTER_FORM_ID',
        registration: 'https://formspree.io/f/YOUR_REGISTRATION_FORM_ID',
        profile: 'https://formspree.io/f/YOUR_PROFILE_FORM_ID',
        password: 'https://formspree.io/f/YOUR_PASSWORD_FORM_ID',
        settings: 'https://formspree.io/f/YOUR_SETTINGS_FORM_ID',
        hoot_ideas: 'https://formspree.io/f/YOUR_HOOT_IDEAS_FORM_ID',
        news_submission: 'https://formspree.io/f/YOUR_NEWS_FORM_ID'
    },

    // Email Configuration
    email: {
        // Admin email for notifications
        adminEmail: 'info@redhatterswa.com.au',
        
        // Contact form settings
        contactForm: {
            subject: 'New Contact Form Submission - Red Hatters WA',
            autoReply: true,
            autoReplySubject: 'Thank you for contacting Red Hatters WA'
        },
        
        // Newsletter settings
        newsletter: {
            subject: 'New Newsletter Subscription - Red Hatters WA',
            listId: 'red-hatters-newsletter'
        }
    },

    // Security Settings
    security: {
        // Enable CSRF protection
        enableCSRF: true,
        
        // Rate limiting settings
        rateLimit: {
            enabled: true,
            maxRequests: 5,
            timeWindow: 60000 // 1 minute in milliseconds
        },
        
        // Content Security Policy
        csp: {
            enabled: false, // Set to true when deploying
            reportOnly: true
        }
    },

    // Analytics Configuration
    analytics: {
        // Google Analytics ID
        googleAnalytics: 'GA_MEASUREMENT_ID',
        
        // Facebook Pixel ID
        facebookPixel: 'FACEBOOK_PIXEL_ID',
        
        // Enable analytics in development
        enableInDevelopment: false
    },

    // Feature Flags
    features: {
        // Enable/disable specific features
        enableMemberSearch: true,
        enableEventRegistration: true,
        enableNewsletter: true,
        enableContactForm: true,
        enableDonations: true,
        
        // Beta features
        enableBetaFeatures: false
    },

    // UI Configuration
    ui: {
        // Toast notification settings
        toast: {
            duration: 5000,
            position: 'top-right'
        },
        
        // Loading states
        loading: {
            showSpinner: true,
            fadeInDuration: 200
        },
        
        // Form validation
        validation: {
            realTimeValidation: true,
            showErrorMessages: true
        }
    },

    // Utility Functions
    utils: {
        // Get current environment config
        getCurrentConfig: function() {
            const currentEnv = this.environment.current || 'fallback';
            return this.environment[currentEnv];
        },
        
        // Get API endpoint
        getApiEndpoint: function(type) {
            const config = this.getCurrentConfig();
            const baseUrl = config.apiUrl || '';
            return baseUrl + this.api.endpoints[type];
        },
        
        // Check if feature is enabled
        isFeatureEnabled: function(feature) {
            return this.features[feature] === true;
        },
        
        // Log debug messages
        debug: function(message, data = null) {
            const config = this.getCurrentConfig();
            if (config.debug && config.enableConsoleLogging) {
                console.log(`[Red Hatters WA] ${message}`, data);
            }
        }
    }
};

// Make config globally available
window.RedHattersConfig.debug('Configuration loaded', {
    environment: window.RedHattersConfig.environment.current,
    apiUrl: window.RedHattersConfig.utils.getCurrentConfig().apiUrl
});
