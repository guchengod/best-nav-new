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
        return c.json({ err: e.message }, 500);
    }
});





app.get("/api/", (c) => c.json({ name: "Cloudflare" }));

export default app;
