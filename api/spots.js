// Vercel serverless function — GET /api/spots
// Returns the number of launch-price spots remaining (500 - subscriber count).

const TOTAL_SPOTS = 500;

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { MAILCHIMP_API_KEY, MAILCHIMP_SERVER, MAILCHIMP_LIST_ID } = process.env;

  if (!MAILCHIMP_API_KEY || !MAILCHIMP_SERVER || !MAILCHIMP_LIST_ID) {
    return res.status(200).json({ spots: TOTAL_SPOTS, dev: true });
  }

  try {
    const mc = await fetch(
      `https://${MAILCHIMP_SERVER}.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}?fields=stats.member_count`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`anystring:${MAILCHIMP_API_KEY}`).toString("base64")}`,
        },
      }
    );

    if (!mc.ok) {
      console.error("Mailchimp list fetch failed:", mc.status);
      return res.status(200).json({ spots: TOTAL_SPOTS });
    }

    const data = await mc.json();
    const memberCount = data?.stats?.member_count ?? 0;
    const spots = Math.max(0, TOTAL_SPOTS - memberCount);

    return res.status(200).json({ spots });
  } catch (err) {
    console.error("Spots fetch error:", err);
    return res.status(200).json({ spots: TOTAL_SPOTS });
  }
};
