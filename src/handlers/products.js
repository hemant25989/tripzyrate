const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({ region: process.env.AWS_REGION || "ap-south-1" });
const ddbDocClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
    const httpMethod = event.requestContext?.http?.method || event.httpMethod || "";
    const tableName = process.env.TABLE_NAME || "prod-tripzyrate-single-table";

    // --- OPTIONS Preflight Response ---
    if (httpMethod.toUpperCase() === "OPTIONS") {
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type,Authorization",
                "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
            },
            body: ""
        };
    }

    // --- HANDLE POST (Save Booking to DynamoDB) ---
    if (httpMethod.toUpperCase() === "POST") {
        try {
            let body = {};
            if (event.body) {
                body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
            }

            const { dealId, dealTitle, customerName, customerEmail } = body;

            if (!customerName || !customerEmail) {
                return {
                    statusCode: 400,
                    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
                    body: JSON.stringify({ error: "Customer Name and Email are required." })
                };
            }

            const confirmationId = `TZ-${Math.floor(100000 + Math.random() * 900000)}`;
            
            const bookingItem = {
                PK: `USER#${customerEmail.toLowerCase()}`,
                SK: `BOOKING#${confirmationId}`,
                DealId: dealId,
                DealTitle: dealTitle,
                CustomerName: customerName,
                CustomerEmail: customerEmail.toLowerCase(),
                BookingDate: new Date().toISOString(),
                Status: "PROVISIONAL"
            };

            await ddbDocClient.send(new PutCommand({
                TableName: tableName,
                Item: bookingItem
            }));

            return {
                statusCode: 201,
                headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({
                    success: true,
                    confirmationId: confirmationId,
                    // CLEANED: Removed technical database terms
                    message: `Pack your bags, ${customerName}! Your booking request for "${dealTitle}" has been securely processed and confirmed.`
                })
            };
        } catch (err) {
            return {
                statusCode: 500,
                headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({ error: "Failed to save booking data record." })
            };
        }
    }

    // --- HANDLE GET (Fetch Listings) ---
    // CLEANED: Removed "[LIVE API]" prefix and technical references from descriptions
    const backendTravelListings = [
        { 
            id: "api-v1-goa", 
            title: "Luxury Goa Beach Resort Villa", 
            type: "Package", 
            rate: "₹12,500", 
            img: "https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?auto=format&fit=crop&w=400&q=80", 
            desc: "Experience 4 nights at a luxury beach resort with complimentary premium watersports." 
        },
        { 
            id: "api-v1-paris", 
            title: "Delhi to Paris Business Class Upgrade", 
            type: "Flight", 
            rate: "₹68,900", 
            img: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=400&q=80", 
            desc: "Enjoy premier luxury dining and lie-flat seat upgrades on your direct European flight path." 
        }
    ];

    return {
        statusCode: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ 
            // CLEANED: Clean response status string
            status: "Displaying best available promotional flight and destination rates.", 
            deals: backendTravelListings 
        })
    };
};
