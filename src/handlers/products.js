const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");

// Initialize the DynamoDB Document Client
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

            // Generate unique Booking Details
            const confirmationId = `TZ-${Math.floor(100000 + Math.random() * 900000)}`;
            
            // Single-Table Design Schema mapping
            const bookingItem = {
                PK: `USER#${customerEmail.toLowerCase()}`, // Partition Key
                SK: `BOOKING#${confirmationId}`,          // Sort Key
                DealId: dealId,
                DealTitle: dealTitle,
                CustomerName: customerName,
                CustomerEmail: customerEmail.toLowerCase(),
                BookingDate: new Date().toISOString(),
                Status: "PROVISIONAL"
            };

            // Write into your DynamoDB Table
            await ddbDocClient.send(new PutCommand({
                TableName: tableName,
                Item: bookingItem
            }));

            console.log(`[DYNAMODB SUCCESS] Saved booking ${confirmationId} for ${customerEmail}`);

            return {
                statusCode: 201,
                headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({
                    success: true,
                    confirmationId: confirmationId,
                    message: `Pack your bags, ${customerName}! Your booking request for "${dealTitle}" has been securely processed and saved to your DynamoDB table.`
                })
            };
        } catch (err) {
            console.error("DynamoDB Write Failure Error:", err);
            return {
                statusCode: 500,
                headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({ error: "Failed to save booking data record to database." })
            };
        }
    }

    // --- HANDLE GET (Fetch Listings) ---
    const backendTravelListings = [
        { id: "api-v1-goa", title: "[LIVE API] Luxury Goa Beach Resort Villa", type: "Package", rate: "₹12,500", img: "https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?auto=format&fit=crop&w=400&q=80", desc: "Verified response directly from your Mumbai ap-south-1 Lambda cluster via CloudFront routing." },
        { id: "api-v1-paris", title: "[LIVE API] Delhi to Paris Business Class Upgrade", type: "Flight", rate: "₹68,900", img: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=400&q=80", desc: "Exclusive partner deal fetched dynamically through API Gateway hosting layers." }
    ];

    return {
        statusCode: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ status: "Live pipeline operating successfully!", deals: backendTravelListings })
    };
};
