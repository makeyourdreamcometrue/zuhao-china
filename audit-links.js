const http = require('http');

function fetch(url) {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

async function checkLinks() {
    // Check home page for all internal links
    const home = await fetch('http://localhost:3000/');

    // Extract all href links from home page
    const linkRegex = /href="([^"]+)"/g;
    let match;
    const links = new Set();

    while ((match = linkRegex.exec(home)) !== null) {
        const href = match[1];
        // Only check internal links
        if (href.startsWith('/') && !href.startsWith('//')) {
            links.add(href);
        }
    }

    console.log('=== INTERNAL LINKS FOUND ON HOME PAGE ===\n');
    console.log('Link'.padEnd(30), 'Status');
    console.log('-'.repeat(45));

    let broken = 0;
    for (const link of Array.from(links).sort()) {
        try {
            const res = await fetch('http://localhost:3000' + link);
            console.log(link.padEnd(30), res ? 'OK' : 'FAIL');
        } catch (e) {
            console.log(link.padEnd(30), 'ERROR');
            broken++;
        }
    }

    console.log(`\nTotal: ${links.size}, Broken: ${broken}`);
}

checkLinks().catch(console.error);
