async function test() {
    try {
        console.log("Testing new API endpoint locally mapping...");
        
        // 1. Try sending the OLD format: { email, password }
        try {
            console.log("---- Testing { email, password } ----");
            const res1 = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: 'admin@ego.com', password: 'admin123' })
            });
            const data1 = await res1.json();
            if (res1.ok) console.log("Success with old format! Token size:", data1.token.length);
            else console.log("Old Format Failed:", data1);
        } catch (e) {
            console.log("Old Format Network Failed:", e.message);
        }

        // 2. Try sending the NEW format: { identifier, password }
        try {
            console.log("---- Testing { identifier, password } ----");
            const res2 = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier: 'admin@ego.com', password: 'admin123' })
            });
            const data2 = await res2.json();
            if (res2.ok) console.log("Success with new format! Token size:", data2.token.length);
            else console.log("New Format Failed:", data2);
        } catch (e) {
            console.log("New Format Network Failed:", e.message);
        }

    } catch (err) {
        console.error("Critical error:", err.message);
    }
}

test();
