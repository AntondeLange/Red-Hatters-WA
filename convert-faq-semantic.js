// Script to convert FAQ items to semantic HTML5 details/summary elements
const fs = require('fs');

function convertFAQToSemantic() {
    let content = fs.readFileSync('faq.html', 'utf8');
    
    // Pattern to match FAQ items with custom JavaScript structure
    const faqPattern = /<div class="faq-item">\s*<div class="faq-question">\s*<h3>([^<]+)<\/h3>\s*<span class="faq-icon">\+<\/span>\s*<\/div>\s*<div class="faq-answer">\s*([\s\S]*?)\s*<\/div>\s*<\/div>/g;
    
    // Replace with semantic details/summary structure
    content = content.replace(faqPattern, (match, question, answer) => {
        return `<details class="faq-item">
					<summary class="faq-question">
						<h3>${question}</h3>
					</summary>
					<div class="faq-answer">
						${answer.trim()}
					</div>
				</details>`;
    });
    
    // Update CSS to work with semantic elements
    content = content.replace(
        /\.faq-item\.active \.faq-icon\s*\{\s*transform: rotate\(45deg\);\s*\}/g,
        'details[open] .faq-icon { transform: rotate(45deg); }'
    );
    
    content = content.replace(
        /\.faq-item\.active \.faq-answer\s*\{\s*[^}]*\}/g,
        'details[open] .faq-answer { padding: 25px 30px; max-height: 500px; }'
    );
    
    // Remove custom JavaScript for FAQ functionality
    content = content.replace(
        /\/\* FAQ-specific functionality styles \*\/[\s\S]*?\.faq-item\.active \.faq-answer\s*\{\s*[^}]*\}/g,
        '/* FAQ-specific functionality styles - Now using semantic HTML5 details/summary */'
    );
    
    fs.writeFileSync('faq.html', content, 'utf8');
    console.log('✅ FAQ converted to semantic HTML5 details/summary elements');
}

convertFAQToSemantic();
