exports.handler = async (event) => {
    console.log("Processing direct secure microservice query stream.");

    // This array provides the structured data your index.html needs to draw the cards
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
            "Cache-Control": "no-store, max-age=0" // Prevents old text data caching
        },
        body: JSON.stringify({
            status: "Successfully pulled live data from AWS Lambda inside ap-south-1 (Mumbai)!",
            deals: backendTravelListings // <-- The frontend loops through this exact key
        })
    };
};
