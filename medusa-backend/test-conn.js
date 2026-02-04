const { Client } = require('pg');

const configs = [
    {
        name: "DIRECT (Port 5432)",
        url: "postgresql://postgres:Own123karma123@db.ymowrswwcmuqiyvzslht.supabase.co:5432/postgres?sslmode=require"
    },
    {
        name: "POOLER (Port 6543)",
        url: "postgresql://postgres.ymowrswwcmuqiyvzslht:Own123karma123@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?sslmode=require"
    }
];

async function test() {
    console.log("Starting connection tests...");
    for (const c of configs) {
        console.log(`\n----------------------------------------`);
        console.log(`Testing ${c.name}...`);
        // Mask password in logs just in case
        const maskedUrl = c.url.replace(/:([^@]+)@/, ':****@');
        console.log(`URL: ${maskedUrl}`);

        const client = new Client({
            connectionString: c.url,
            ssl: { rejectUnauthorized: false } // Essential for some node environments to accept self-signed or specific certs
        });

        try {
            await client.connect();
            console.log("✅ SUCCESS: Connected!");
            await client.end();
        } catch (err) {
            console.log("❌ FAILED:", err.message);
            if (err.message.includes("password")) {
                console.log("   -> Likely a WRONG PASSWORD.");
            } else if (err.message.includes("timeout")) {
                console.log("   -> Network Timeout (Firewall/IP issue).");
            }
        }
    }
    console.log(`\n----------------------------------------`);
    console.log("Done.");
}

test();
