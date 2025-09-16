# Red Hatters WA - Deployment & Launch Guide

## 🚀 Overview

This guide explains how to set up the Red Hatters WA website with proper backend integration, ready to sync with the production backend when it replaces the current live site.

## 📋 Current Setup

### ✅ What's Already Implemented

1. **Enhanced Form Handling**
   - Contact form with Name, Email, Website, and Message fields
   - Newsletter subscription form
   - Registration forms
   - Loading states with visual feedback
   - Proper error handling and user feedback

2. **Backend Integration Structure**
   - Configuration-based environment switching
   - Support for multiple backend services
   - Fallback service integration (Formspree)
   - Production-ready API structure

3. **User Experience**
   - Loading spinners during form submission
   - Toast notifications for feedback
   - Form validation and error handling
   - Responsive design

## 🔧 Configuration

### Environment Switching

The website uses a configuration system in `config.js` to switch between environments:

```javascript
// In config.js
environment: {
    current: 'fallback', // Options: 'development', 'staging', 'production', 'fallback'
}
```

### Current Environments

1. **Fallback Mode** (Current)
   - Uses Formspree for form submissions
   - No backend server required
   - Perfect for testing and initial deployment

2. **Development Mode**
   - Connects to local development server
   - Full API integration
   - Debug logging enabled

3. **Staging Mode**
   - Connects to staging API server
   - Production-like testing environment
   - Debug logging enabled

4. **Production Mode**
   - Connects to production API server
   - Optimized for performance
   - Debug logging disabled

## 🛠️ Setup Instructions

### Step 1: Configure Formspree (Fallback Mode)

1. Go to [Formspree.io](https://formspree.io)
2. Create a new form for each type:
   - Contact form
   - Newsletter subscription
   - Registration form

3. Update `config.js` with your Formspree form IDs:

```javascript
formspree: {
    contact: 'https://formspree.io/f/YOUR_CONTACT_FORM_ID',
    newsletter: 'https://formspree.io/f/YOUR_NEWSLETTER_FORM_ID',
    registration: 'https://formspree.io/f/YOUR_REGISTRATION_FORM_ID'
}
```

### Step 2: Test the Forms

1. Open `index.html` in a browser
2. Fill out the contact form
3. Check that the loading state appears
4. Verify the success message shows
5. Check your Formspree dashboard for the submission

### Step 3: Configure Account Page Forms

The Account page (`account.html`) includes several forms that need backend integration:

1. **Profile Update Form** - Updates user profile information
2. **Password Change Form** - Changes user password
3. **Settings Form** - Updates privacy and notification preferences

For Formspree fallback, create separate forms for each:
- Profile update form
- Password change form  
- Settings form

Update `config.js` with your Formspree IDs:
```javascript
formspree: {
    profile: 'https://formspree.io/f/YOUR_PROFILE_FORM_ID',
    password: 'https://formspree.io/f/YOUR_PASSWORD_FORM_ID',
    settings: 'https://formspree.io/f/YOUR_SETTINGS_FORM_ID'
}
```

### Step 4: Switch to Production Backend

When your production backend is ready:

1. Update `config.js`:
```javascript
environment: {
    current: 'production'
}
```

2. Update the production API URL:
```javascript
production: {
    debug: false,
    apiUrl: 'https://api.red-hatters-wa.net',
    enableConsoleLogging: false
}
```

## 📡 API Endpoints Expected

Your backend should implement these endpoints:

### Contact Form
```
POST /api/contact
Content-Type: application/json

{
    "name": "John Doe",
    "email": "john@example.com",
    "website": "https://example.com",
    "message": "Hello, I'm interested in joining...",
    "type": "contact",
    "timestamp": "2025-01-27T10:30:00.000Z",
    "source": "https://red-hatters-wa.net/",
    "userAgent": "Mozilla/5.0..."
}

Response:
{
    "success": true,
    "message": "Contact form submitted successfully",
    "id": "contact_123"
}
```

### Newsletter Subscription
```
POST /api/newsletter
Content-Type: application/json

{
    "email": "john@example.com",
    "type": "newsletter",
    "timestamp": "2025-01-27T10:30:00.000Z",
    "source": "https://red-hatters-wa.net/"
}

Response:
{
    "success": true,
    "message": "Successfully subscribed to newsletter",
    "id": "newsletter_456"
}
```

### Registration Form
```
POST /api/registration
Content-Type: application/json

{
    "name": "Jane Smith",
    "email": "jane@example.com",
    // ... other registration fields
    "type": "registration",
    "timestamp": "2025-01-27T10:30:00.000Z",
    "source": "https://red-hatters-wa.net/"
}

Response:
{
    "success": true,
    "message": "Registration submitted successfully",
    "id": "registration_789"
}
```

### Profile Update
```
POST /api/account/profile
Content-Type: application/json

{
    "firstName": "Sarah",
    "lastName": "Johnson",
    "email": "sarah.johnson@email.com",
    "phone": "+61 8 1234 5678",
    "address": "123 Red Hat Street, Perth WA 6000",
    "bio": "I love being part of the Red Hat Society!",
    "type": "profile_update",
    "timestamp": "2025-01-27T10:30:00.000Z",
    "source": "https://red-hatters-wa.net/account.html",
    "userId": "user_123"
}

Response:
{
    "success": true,
    "message": "Profile updated successfully",
    "id": "profile_update_456"
}
```

### Password Change
```
POST /api/account/password
Content-Type: application/json

{
    "currentPassword": "old_password",
    "newPassword": "new_secure_password",
    "confirmPassword": "new_secure_password",
    "type": "password_change",
    "timestamp": "2025-01-27T10:30:00.000Z",
    "source": "https://red-hatters-wa.net/account.html",
    "userId": "user_123"
}

Response:
{
    "success": true,
    "message": "Password updated successfully",
    "id": "password_change_789"
}
```

### Settings Update
```
POST /api/account/settings
Content-Type: application/json

{
    "showProfile": true,
    "allowMessages": true,
    "showEmail": false,
    "emailEvents": true,
    "emailMessages": true,
    "smsUpdates": false,
    "type": "settings_update",
    "timestamp": "2025-01-27T10:30:00.000Z",
    "source": "https://red-hatters-wa.net/account.html",
    "userId": "user_123"
}

Response:
{
    "success": true,
    "message": "Settings updated successfully",
    "id": "settings_update_012"
}
```

## 🔒 Security Considerations

### Rate Limiting
The configuration includes rate limiting settings:
```javascript
security: {
    rateLimit: {
        enabled: true,
        maxRequests: 5,
        timeWindow: 60000 // 1 minute
    }
}
```

### CSRF Protection
Enable CSRF protection when implementing the backend:
```javascript
security: {
    enableCSRF: true
}
```

## 📊 Monitoring & Analytics

### Debug Logging
Debug logging is available in development/staging:
```javascript
window.RedHattersConfig.utils.debug('Debug message', data);
```

### Error Tracking
All form submissions include error handling and logging for monitoring.

## 🚀 Deployment Checklist

### Before Going Live

- [ ] Update Formspree form IDs in `config.js`
- [ ] Test all forms in fallback mode
- [ ] Set up production API endpoints
- [ ] Configure email notifications
- [ ] Set up monitoring and error tracking
- [ ] Test rate limiting
- [ ] Enable CSRF protection
- [ ] Update analytics IDs
- [ ] Set `environment.current` to 'production'
- [ ] Disable debug logging
- [ ] Test with real data

### After Deployment

- [ ] Monitor form submissions
- [ ] Check error logs
- [ ] Verify email notifications
- [ ] Test on different devices/browsers
- [ ] Monitor performance metrics

## 🔄 Switching Between Modes

### To Switch to Development Mode
```javascript
// In config.js
environment: {
    current: 'development'
}
```

### To Switch to Production Mode
```javascript
// In config.js
environment: {
    current: 'production'
}
```

### To Switch Back to Fallback Mode
```javascript
// In config.js
environment: {
    current: 'fallback'
}
```

## 📞 Support

If you need help with the backend integration:

1. Check the browser console for debug messages
2. Verify the configuration in `config.js`
3. Test with Formspree fallback mode first
4. Ensure your backend implements the expected API endpoints

## 🎯 Benefits of This Setup

1. **Seamless Transition**: Easy switch from Formspree to production backend
2. **Environment Flexibility**: Test in different environments
3. **Production Ready**: Built with proper error handling and security
4. **User Experience**: Loading states and proper feedback
5. **Monitoring**: Debug logging and error tracking
6. **Maintainable**: Clean configuration system

This setup ensures your website will work immediately with Formspree and seamlessly transition to your production backend when ready.
