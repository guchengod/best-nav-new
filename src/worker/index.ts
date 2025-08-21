import { Hono } from "hono";
import { OrderRow } from './type.ts'
// This ensures c.env.DB is correctly typed
type Bindings = {
    DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();



// Accessing D1 is via the c.env.YOUR_BINDING property
app.get("/query/users/:id", async (c) => {

    const userId = c.req.param("id");
    try {
        const { results } = await c.env.DB.prepare(
            "SELECT * FROM users WHERE user_id = ?",
        )
            .bind(userId)
            .run<OrderRow>();
        return c.json(results);
    } catch (e) {
        // Type guard to safely handle the unknown error type
        if (e instanceof Error) {
            // Log the detailed error for your own records
            console.error("DB Error:", e.message);
        } else {
            // Log the value if it's not a standard Error object
            console.error("DB Error:", e);
        }

        // Return a generic error message to the client
        return c.json({ err: "An internal server error occurred" }, 500);
    }
});





app.get("/api/", (c) => c.json({ name: "Cloudflare" }));

export default app;
