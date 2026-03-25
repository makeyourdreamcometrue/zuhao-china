const http = require('http');

function fetchPage(url) {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body: data }));
        }).on('error', reject);
    });
}

async function test() {
    const pages = [
        '/properties/new',
        '/properties/123',
        '/properties/44a1a297-ed2f-43ce-b1c4-987c9b4a9a6e'
    ];

    for (const page of pages) {
        const result = await fetchPage('http://localhost:3000' + page);
        console.log(`\n=== ${page} ===`);
        console.log('Status:', result.status);
        console.log('Body (first 300 chars):', result.body.substring(0, 300));
    }
}

test().catch(console.error);
