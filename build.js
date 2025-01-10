const fs = require('fs-extra');
const path = require('path');
const { marked } = require('marked');

// Configuration
const config = {
    content: 'content',
    output: 'docs',
    template: 'template.html',
    baseUrl: '/blog',
    convertKitFormId: '5468061' // Replace with your actual ConvertKit form ID
};

// Newsletter form template
const newsletterTemplate = `
<div class="newsletter-box">
    <h2>Subscribe to Our Newsletter</h2>
    <p>Get the latest blogging tips and tutorials delivered to your inbox.</p>
    <script async data-uid="{{formId}}" src="https://fantastic-maker-3439.ck.page/{{formId}}/index.js"></script>
</div>
`;

// Create base template
const baseTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}} - The Blog Starter</title>
    <link rel="stylesheet" href="${config.baseUrl}/css/style.css">
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
</head>
<body>
    <header class="site-header">
        <div class="container">
            <a href="${config.baseUrl}/" class="logo">The BLOG STARTER</a>
            <nav>
                <a href="${config.baseUrl}/">Home</a>
                <a href="${config.baseUrl}/blog/">Blog</a>
                <a href="${config.baseUrl}/about.html">About Me</a>
                <a href="${config.baseUrl}/contact.html">Contact Me</a>
            </nav>
        </div>
    </header>

    <main class="container">
        <div class="content-area">
            <article class="main-content">
                {{content}}
                {{newsletter}}
            </article>
            <aside class="sidebar">
                <div class="featured-box">
                    <h2>Featured On:</h2>
                    <div class="profile-card">
                        <img src="${config.baseUrl}/images/website-magazine.png" alt="Website Magazine" class="magazine-logo">
                        <div class="profile-info">
                            <img src="${config.baseUrl}/images/profile.jpg" alt="Profile" class="profile-pic">
                            <h3>Your Name</h3>
                            <p>Helping start blogs since 2024.</p>
                        </div>
                    </div>
                </div>

                <div class="steps-box">
                    <h2>Steps For Building Your Blog</h2>
                    <div class="steps-list">
                        <div class="step">
                            <span class="step-icon">1</span>
                            <div class="step-content">
                                <h3>Step 1: Get Started</h3>
                                <p>Step 1</p>
                            </div>
                        </div>
                        <div class="step">
                            <span class="step-icon">2</span>
                            <div class="step-content">
                                <h3>Step 2: Set Up Your Blog</h3>
                                <p>Step 2</p>
                            </div>
                        </div>
                        <div class="step">
                            <span class="step-icon">3</span>
                            <div class="step-content">
                                <h3>Step 3: How to Use Your Blog</h3>
                                <p>Step 3</p>
                            </div>
                        </div>
                        <div class="step">
                            <span class="step-icon">4</span>
                            <div class="step-content">
                                <h3>Step 4: Blog Customization</h3>
                                <p>Step 4</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </div>
    </main>

    <footer>
        <div class="container">
            <p>&copy; 2024 The Blog Starter. All rights reserved.</p>
        </div>
    </footer>
</body>
</html>
`;

async function buildSite() {
    // Ensure output directory exists
    await fs.ensureDir(config.output);
    await fs.ensureDir(path.join(config.output, 'blog'));
    
    // Copy static assets
    await fs.copy('static', config.output, { overwrite: true });
    
    // Process pages
    const pages = await fs.readdir(path.join(config.content, 'pages'));
    for (const page of pages) {
        if (path.extname(page) === '.md') {
            const content = await fs.readFile(
                path.join(config.content, 'pages', page),
                'utf-8'
            );
            const html = marked(content);
            const title = page.replace('.md', '');
            
            // Add newsletter form for blog pages
            const newsletter = page === 'blog.md' ? 
                newsletterTemplate.replace('{{formId}}', config.convertKitFormId) : 
                '';
            
            const finalHtml = baseTemplate
                .replace('{{title}}', title)
                .replace('{{content}}', html)
                .replace('{{newsletter}}', newsletter);
            
            // Special handling for index and blog pages
            let outputPath;
            if (page === 'index.md') {
                outputPath = path.join(config.output, 'index.html');
            } else if (page === 'blog.md') {
                outputPath = path.join(config.output, 'blog', 'index.html');
            } else {
                outputPath = path.join(config.output, page.replace('.md', '.html'));
            }
            
            await fs.outputFile(outputPath, finalHtml);
        }
    }
    
    // Process blog posts
    const posts = await fs.readdir(path.join(config.content, 'blog'));
    for (const post of posts) {
        if (path.extname(post) === '.md') {
            const content = await fs.readFile(
                path.join(config.content, 'blog', post),
                'utf-8'
            );
            const html = marked(content);
            const title = post.replace('.md', '');
            
            const finalHtml = baseTemplate
                .replace('{{title}}', title)
                .replace('{{content}}', html)
                .replace('{{newsletter}}', ''); // No newsletter on individual posts
            
            await fs.outputFile(
                path.join(config.output, 'blog', post.replace('.md', '.html')),
                finalHtml
            );
        }
    }
}

buildSite().catch(console.error); 