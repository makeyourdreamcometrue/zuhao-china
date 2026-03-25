const http = require('http');
const https = require('https');

function fetch(url) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        client.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body: data, time: 0 }));
        }).on('error', reject);
    });
}

const pages = [
    {url:'/',name:'Home',desc:'Landing page'},
    {url:'/properties',name:'Properties',desc:'Property listings'},
    {url:'/properties/new',name:'Add Property',desc:'Add new listing'},
    {url:'/login',name:'Login',desc:'Login page'},
    {url:'/about',name:'About',desc:'About us'},
    {url:'/terms',name:'Terms',desc:'Terms of service'},
    {url:'/privacy',name:'Privacy',desc:'Privacy policy'},
    {url:'/dashboard',name:'Dashboard',desc:'User dashboard'},
    {url:'/profile',name:'Profile',desc:'User profile'},
    {url:'/applications',name:'Applications',desc:'Applications list'},
    {url:'/my-applications',name:'My Applications',desc:'My applications'},
    {url:'/leases',name:'Leases',desc:'Lease management'},
    {url:'/payments',name:'Payments',desc:'Payment history'},
    {url:'/expenses',name:'Expenses',desc:'Expense tracking'},
    {url:'/inspections',name:'Inspections',desc:'Property inspections'},
    {url:'/maintenance',name:'Maintenance',desc:'Maintenance requests'}
];

async function audit() {
    console.log('=== WEBSITE AUDIT REPORT ===\n');
    console.log('Page'.padEnd(22), 'Status', 'Load(ms)', 'Size(KB)', 'Issues');
    console.log('-'.repeat(70));

    let totalTime = 0;
    let issues = [];

    for (const p of pages) {
        const start = Date.now();
        const res = await fetch('http://localhost:3000' + p.url);
        const loadTime = Date.now() - start;
        totalTime += loadTime;

        const sizeKB = (res.body.length / 1024).toFixed(1);
        const issuesFound = [];

        // Check for errors in content
        if (res.body.includes('error') && res.body.includes('Exception')) {
            issuesFound.push('JS Error');
        }
        if (res.body.includes('Failed to load')) {
            issuesFound.push('Load Error');
        }
        if (res.status >= 400) {
            issuesFound.push('HTTP ' + res.status);
        }

        console.log(
            p.url.padEnd(22),
            res.status.toString().padEnd(7),
            loadTime.toString().padEnd(10),
            sizeKB.padEnd(9),
            issuesFound.length ? issuesFound.join(', ') : 'OK'
        );

        if (issuesFound.length > 0) {
            issues.push({page: p.url, problems: issuesFound});
        }
    }

    console.log('\n=== SUMMARY ===');
    console.log(`Total Pages: ${pages.length}`);
    console.log(`Working: ${pages.length - issues.length}`);
    console.log(`Broken: ${issues.length}`);
    console.log(`Avg Load Time: ${Math.round(totalTime / pages.length)} ms`);

    if (issues.length > 0) {
        console.log('\n=== ISSUES ===');
        issues.forEach(i => console.log(`- ${i.page}: ${i.problems.join(', ')}`));
    }

    // Check navigation links
    console.log('\n=== NAVIGATION TEST ===');
    const homeRes = await fetch('http://localhost:3000/');
    const links = [
        '/properties', '/about', '/login', '/terms', '/privacy'
    ];
    links.forEach(l => {
        const exists = homeRes.body.includes(l);
        console.log(`${l.padEnd(15)} ${exists ? 'FOUND' : 'MISSING'}`);
    });
}

audit().catch(console.error);
