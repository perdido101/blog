const fs = require('fs-extra');
const path = require('path');
const { marked } = require('marked');

// Configuration
const config = {
    content: 'content',
    output: 'docs',
    template: 'template.html'
};

// Create base template
const baseTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}}</title>
    <link rel="stylesheet" href="/css/style.css">
</head>
<body>
    <header>
        <nav>
            <a href="/">Home</a>
            <a href="/blog">Blog</a>
            <a href="/about.html">About</a>
            <a href="/faq.html">FAQ</a>
        </nav>
    </header>
    <main>
        {{content}}
    </main>
    <footer>
        <p>&copy; 2024</p>
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
            
            const finalHtml = baseTemplate
                .replace('{{title}}', title)
                .replace('{{content}}', html);
            
            // Special handling for index page
            const outputPath = page === 'index.md' 
                ? path.join(config.output, 'index.html')
                : path.join(config.output, page.replace('.md', '.html'));
            
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
                .replace('{{content}}', html);
            
            await fs.outputFile(
                path.join(config.output, 'blog', post.replace('.md', '.html')),
                finalHtml
            );
        }
    }
}

buildSite().catch(console.error); 