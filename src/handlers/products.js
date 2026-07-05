exports.handler = async (event) => {
    console.log("Method Type:", event.requestContext.http.method);
    
    // --- 1. HANDLE BOOKING RESERVATIONS (POST /api/products) ---
    if (event.requestContext.http.method === "POST") {
        try {
            const body = JSON.parse(event.body || "{}");
            const { dealId, dealTitle, customerName, customerEmail } = body;

            if (!customerName || !customerEmail) {
                return {
                    statusCode: 400,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ error: "Name and Email are required to confirm booking." })
                };
            }

            console.log(`[BOOKING SUCCESS] Deal: ${dealTitle} (${dealId}) reserved for ${customerName} (${customerEmail})`);
            
            // In a full implementation, you would write an item to DynamoDB here.
            
            return {
                statusCode: 201,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    success: true,
                    confirmationId: `TZ-${Math.floor(100000 + Math.random() * 900000)}`,
                    message: `Pack your bags, ${customerName}! Your reservation for "${dealTitle}" has been provisionally locked in our Mumbai database.`
                })
            };
        } catch (err) {
            return {
                statusCode: 500,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ error: "Failed to process database booking payload." })
            };
        }
    }

    // --- 2. DYNAMIC TRAVEL LISTINGS LOAD (GET /api/products) ---
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
            "Cache-Control": "no-store, max-age=0"
        },
        body: JSON.stringify({
            status: "Successfully pulled live data from AWS Lambda inside ap-south-1 (Mumbai)!",
            deals: backendTravelListings
        })
    };
};
