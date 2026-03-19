import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const state = searchParams.get("state");
  const market = searchParams.get("market");
  const commodity = searchParams.get("commodity");

  const apiKey = process.env.mandi_api_key;
  if (!apiKey) {
    return NextResponse.json({ error: "Mandi API key not configured" }, { status: 500 });
  }

  // Retry helper for transient network errors (ECONNRESET, etc.)
  const fetchWithRetry = async (url: string, retries = 3): Promise<Response> => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await fetch(url);
      } catch (err) {
        if (attempt === retries) throw err;
        const delay = attempt * 500; // 500ms, 1000ms, 1500ms
        console.warn(`Mandi API attempt ${attempt} failed, retrying in ${delay}ms...`);
        await new Promise(r => setTimeout(r, delay));
      }
    }
    throw new Error("All retry attempts failed");
  };

  try {
    let url = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${apiKey}&format=json&limit=100`;

    if (state) url += `&filters[state]=${encodeURIComponent(state)}`;
    if (market) url += `&filters[market]=${encodeURIComponent(market)}`;
    if (commodity) url += `&filters[commodity]=${encodeURIComponent(commodity)}`;

    const response = await fetchWithRetry(url);
    const data = await response.json();

    if (!response.ok) {
        return NextResponse.json({ error: data.message || "Failed to fetch Mandi data" }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Mandi API fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch Mandi data. The government API may be temporarily unavailable. Please try again." }, { status: 502 });
  }
}
