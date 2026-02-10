const dns = require('dns');

// Set DNS servers to Google's public DNS
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

console.log('Testing DNS resolution...');

// Test regular DNS
dns.lookup('cluster0.ed51bbf.mongodb.net', (err, address, family) => {
    if (err) {
        console.error('❌ Regular DNS lookup failed:', err.message);
    } else {
        console.log('✅ Regular DNS lookup succeeded:', address);
    }
});

// Test SRV DNS (what MongoDB uses)
dns.resolveSrv('_mongodb._tcp.cluster0.ed51bbf.mongodb.net', (err, addresses) => {
    if (err) {
        console.error('❌ SRV DNS lookup failed:', err.message);
        console.error('Error code:', err.code);
    } else {
        console.log('✅ SRV DNS lookup succeeded:', addresses);
    }
});
