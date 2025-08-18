import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { db } from "../../db";
import { users } from "../../db/schema/users";
import { eq } from "drizzle-orm";
import { env } from "~/lib/env-config";

// Webhook handler for Clerk events
export const ServerRoute = createServerFileRoute("/api/clerk").methods({
  POST: async ({ request }) => {
    try {
      // Get the webhook secret from environment
      const webhookSecret = env.CLERK_WEBHOOK_SECRET;

      if (!webhookSecret) {
        console.error("Missing CLERK_WEBHOOK_SECRET environment variable");
        return json(
          { error: "Webhook secret not configured" },
          { status: 500 }
        );
      }

      // Get the headers and body
      const headers = request.headers;
      const svix_id = headers.get("svix-id");
      const svix_timestamp = headers.get("svix-timestamp");
      const svix_signature = headers.get("svix-signature");

      // Verify required headers are present
      if (!svix_id || !svix_timestamp || !svix_signature) {
        return json({ error: "Missing required headers" }, { status: 400 });
      }

      // Get the request body
      const body = await request.text();

      // Create a new Svix instance with your webhook secret
      const { Webhook } = await import("svix");
      const webhook = new Webhook(webhookSecret);

      let evt;

      // Verify the webhook
      try {
        evt = webhook.verify(body, {
          "svix-id": svix_id,
          "svix-timestamp": svix_timestamp,
          "svix-signature": svix_signature,
        });
      } catch (err) {
        console.error("Error verifying webhook:", err);
        return json({ error: "Invalid webhook signature" }, { status: 400 });
      }

      // Handle the webhook event
      const { type, data } = evt as { type: string; data: any };

      switch (type) {
        case "user.created":
          await handleUserCreated(data);
          break;
        case "user.updated":
          await handleUserUpdated(data);
          break;
        case "user.deleted":
          await handleUserDeleted(data);
          break;
        default:
          console.log(`Unhandled webhook event type: ${type}`);
      }

      return json({ success: true });
    } catch (error) {
      console.error("Webhook error:", error);
      return json({ error: "Internal server error" }, { status: 500 });
    }
  },

  // Keep the GET method for health checks
  GET: async () => {
    return json({
      message: "Clerk webhook endpoint is ready",
      status: "OK",
    });
  },
});

// Handle user creation
async function handleUserCreated(data: any) {
  try {
    const user = {
      id: data.id,
      email: data.email_addresses[0]?.email_address || "",
      firstName: data.first_name || null,
      lastName: data.last_name || null,
      profileImage: data.profile_image_url || null,
    };

    await db.insert(users).values(user);
    console.log(`User created: ${user.email}`);
  } catch (error) {
    console.error("Error creating user:", error);
  }
}

// Handle user updates
async function handleUserUpdated(data: any) {
  try {
    const updateData = {
      email: data.email_addresses[0]?.email_address || "",
      firstName: data.first_name || null,
      lastName: data.last_name || null,
      profileImage: data.profile_image_url || null,
      updatedAt: new Date(),
    };

    await db.update(users).set(updateData).where(eq(users.id, data.id));

    console.log(`User updated: ${data.id}`);
  } catch (error) {
    console.error("Error updating user:", error);
  }
}

// Handle user deletion
async function handleUserDeleted(data: any) {
  try {
    await db.delete(users).where(eq(users.id, data.id));
    console.log(`User deleted: ${data.id}`);
  } catch (error) {
    console.error("Error deleting user:", error);
  }
}
