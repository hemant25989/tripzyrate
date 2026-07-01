import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

// Pull table name dynamically from CloudFormation environment variables
const TABLE_NAME = process.env.LEADS_TABLE;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Content-Type": "application/json",
};

function respond(statusCode, body) {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify(body),
  };
}

export const handler = async (event) => {
  console.log("Received event:", JSON.stringify(event));

  // API Gateway HTTP API sends a preflight OPTIONS request for CORS;
  // the CorsConfiguration in the template handles this automatically,
  // but this guard keeps the function safe if invoked directly.
  if (event.requestContext?.http?.method === "OPTIONS") {
    return respond(200, {});
  }

  try {
    if (!event.body) {
      return respond(400, { message: "Request body is required." });
    }

    let payload;
    try {
      payload = JSON.parse(event.body);
    } catch (parseErr) {
      return respond(400, { message: "Request body must be valid JSON." });
    }

    const { name, email, message } = payload;

    if (!name || !email) {
      return respond(400, {
        message: "Fields 'name' and 'email' are required.",
      });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return respond(400, { message: "Invalid email address." });
    }

    const item = {
      id: randomUUID(),
      name,
      email,
      message: message || "",
      createdAt: new Date().toISOString(),
    };

    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: item,
      })
    );

    return respond(201, {
      message: "Inquiry submitted successfully.",
      id: item.id,
    });
  } catch (err) {
    console.error("Error processing request:", err);
    return respond(500, { message: "Internal server error." });
  }
};
