// Vercel serverless function — POST /api/subscribe
// Adds an email to your Mailchimp audience.
//
// Environment variables to set in Vercel dashboard:
//   MAILCHIMP_API_KEY   — your Mailchimp API key (looks like: abc123...–us21)
//   MAILCHIMP_SERVER    — the datacenter prefix from your API key (e.g. "us21")
//   MAILCHIMP_LIST_ID   — your audience/list ID (found in Audience > Settings > Audience name and defaults)

module.exports = async function handler(req, res) {
  // CORS — allow the site to call this from any origin during dev
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { email, firstName, gender, priority } = req.body || {};

  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "Valid email required" });
  }

  const { MAILCHIMP_API_KEY, MAILCHIMP_SERVER, MAILCHIMP_LIST_ID } = process.env;

  if (!MAILCHIMP_API_KEY || !MAILCHIMP_SERVER || !MAILCHIMP_LIST_ID) {
    // Graceful fallback during local dev — log and return success so the
    // frontend still works without env vars set up yet
    console.warn("Mailchimp env vars not set — skipping API call");
    return res.status(200).json({ success: true, dev: true });
  }

  const url = `https://${MAILCHIMP_SERVER}.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}/members`;

  const body = {
    email_address: email,
    status: "subscribed",
    merge_fields: {
      FNAME: firstName || "",
      GENDER: gender || "",
      PRIORITY: priority || "",
    },
    tags: ["facet-waitlist"],
  };

  try {
    const mc = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`anystring:${MAILCHIMP_API_KEY}`).toString("base64")}`,
      },
      body: JSON.stringify(body),
    });

    const data = await mc.json();

    // 200 = new subscriber, 400 with title "Member Exists" = already subscribed (still a success)
    if (mc.ok || data.title === "Member Exists") {
      return res.status(200).json({ success: true });
    }

    console.error("Mailchimp error:", data);
    return res.status(500).json({ error: "Could not add to list" });
  } catch (err) {
    console.error("Fetch error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
