// Script to upgrade all pages with Bootstrap 5 and remove inline JavaScript
const fs = require('fs');
const path = require('path');

// List of all HTML files to upgrade
const htmlFiles = [
    'index.html',
    'about-us.html',
    'benefits.html',
    'faq.html',
    'events.html',
    'contact-us.html',
    'donate.html',
    'offers.html',
    'resources.html',
    'member-role.html',
    'member-search.html',
    'discussions.html',
    'news-notes.html',
    'members-corner.html',
    'website-guide.html',
    'member-handbook.html',
    'account.html',
    'wa-chapters.html',
    'newsletter.html',
    'games.html',
    'crafts.html',
    'printables.html',
    'hatter-links.html',
    'login.html',
    'register.html',
    '404.html',
    'terms.html',
    'privacy.html',
    'community-guidelines.html'
];

// Function to add Bootstrap 5 CSS and JS to a page
function addBootstrapToPage(content) {
    // Add Bootstrap CSS after Font Awesome
    content = content.replace(
        /(<link rel="stylesheet" href="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/font-awesome\/6\.0\.0\/css\/all\.min\.css">)/,
        '$1\n\t<!-- Bootstrap 5 CSS -->\n\t<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">'
    );

    // Add Bootstrap JS before custom script
    content = content.replace(
        /(<script src="script\.js"><\/script>)/,
        '<!-- Bootstrap 5 JavaScript -->\n\t<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>\n\t\n\t$1'
    );

    return content;
}

// Function to remove inline JavaScript and replace with data attributes
function removeInlineJavaScript(content) {
    // Remove common inline JavaScript patterns
    const patterns = [
        // Copyright year updates
        /document\.getElementById\('current-year'\)\.textContent = new Date\(\)\.getFullYear\(\);/g,
        // Form submissions
        /document\.querySelector\('\.\w+form'\)\.addEventListener\('submit', function\(e\)\s*\{[^}]*\}/g,
        // FAQ functionality
        /document\.addEventListener\('DOMContentLoaded', function\(\)\s*\{[^}]*faqItems[^}]*\}/g,
        // Event filtering
        /document\.querySelectorAll\('\.filter-btn'\)\.forEach[^}]*\}/g,
        // Calendar functionality
        /function renderCalendar\(\)[^}]*\}/g,
        // Other common patterns
        /<script>\s*\/\/ Update current year[^<]*<\/script>/g,
        /<script>\s*\/\/ [^<]*<\/script>/g
    ];

    patterns.forEach(pattern => {
        content = content.replace(pattern, '');
    });

    // Clean up empty script tags
    content = content.replace(/<script>\s*<\/script>/g, '');

    return content;
}

// Function to add data attributes for JavaScript functionality
function addDataAttributes(content) {
    // Add data attributes for forms
    content = content.replace(
        /<form class="([^"]*form[^"]*)"/g,
        '<form class="$1" data-form-type="contact"'
    );

    // Add data attributes for FAQ items
    content = content.replace(
        /<div class="faq-item">/g,
        '<div class="faq-item" data-faq-item>'
    );

    // Add data attributes for filter buttons
    content = content.replace(
        /<button class="filter-btn"/g,
        '<button class="filter-btn" data-filter-btn'
    );

    return content;
}

// Main upgrade function
function upgradePage(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Apply upgrades
        content = addBootstrapToPage(content);
        content = removeInlineJavaScript(content);
        content = addDataAttributes(content);
        
        // Write back to file
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Upgraded: ${filePath}`);
        
    } catch (error) {
        console.error(`❌ Error upgrading ${filePath}:`, error.message);
    }
}

// Run upgrades
console.log('🚀 Starting page upgrades...');
htmlFiles.forEach(file => {
    if (fs.existsSync(file)) {
        upgradePage(file);
    } else {
        console.log(`⚠️  File not found: ${file}`);
    }
});

console.log('✨ Page upgrades completed!');
