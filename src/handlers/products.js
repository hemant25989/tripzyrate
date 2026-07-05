exports.handler = async (event) => {
    // Standardize incoming HTTP execution methods
    const httpMethod = event.requestContext?.http?.method || event.httpMethod || "";
    console.log(`Executing targeted method routine stream: ${httpMethod}`);

    // --- 1. HANDLE POST DISPATCH (RESERVATIONS/BOOKINGS) ---
    if (httpMethod.toUpperCase() === "POST") {
        try {
            // Robust parsing logic to capture incoming payload data securely
            let body = {};
            if (event.body) {
                body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
            }

            const { dealId, dealTitle, customerName, customerEmail } = body;

            if (!customerName || !customerEmail) {
                return {
                    statusCode: 400,
                    headers: { 
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*" 
                    },
                    body: JSON.stringify({ error: "Missing parameters. Customer Name and Email are required." })
                };
            }

            console.log(`[RESERVATION LOG SUCCESS] ${customerName} (${customerEmail}) provisionally locked deal: ${dealTitle}`);

            return {
                statusCode: 201,
                headers: { 
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                },
                body: JSON.stringify({
                    success: true,
                    confirmationId: `TZ-${Math.floor(100000 + Math.random() * 900000)}`,
                    message: `Pack your bags, ${customerName}! Your booking request for "${dealTitle}" has been securely processed and logged in Mumbai.`
                })
            };
        } catch (err) {
            console.error("Internal processing parsing exception error:", err);
            return {
                statusCode: 500,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ error: "Malformed payload configuration. Check structural stream parameters." })
            };
        }
    }

    // --- 2. HANDLE GET DISPATCH (TRAVEL LISTINGS LOAD) ---
    const backendTravelListings = [
        { 
            id: "api-v1-goa", 
            title: "[LIVE API] Luxury Goa Beach Resort Villa", 
            type: "Package", 
            rate: "₹12,500", 
            img: "https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?auto=format&fit=crop&w=400&q=80", 
            desc: "Verified response directly from your Mumbai ap-south-1 Lambda cluster via CloudFront routing." 
        },
        { 
            id: "api-v1-paris", 
            title: "[LIVE API] Delhi to Paris Business Class Upgrade", 
            type: "Flight", 
            rate: "₹68,900", 
            img: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=400&q=80", 
            desc: "Exclusive partner deal fetched dynamically through API Gateway hosting layers." 
        }
    ];

    return {
        statusCode: 200,
        headers: { 
            "Content-Type": "application/json",
            "Cache-Control": "no-store, max-age=0",
            "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
            status: "Successfully pulled live data from AWS Lambda inside ap-south-1 (Mumbai)!",
            deals: backendTravelListings
        })
    };
};
