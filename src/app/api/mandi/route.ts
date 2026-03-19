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

  try {
    // Note: The data.gov.in API often has different specific resource IDs for different datasets. 
    // This uses a generic example resource ID often associated with daily mandi prices. 
    // You may need to replace '9ef84268-d588-465a-a308-a864a43d0070' with the specific resource ID you intend to query.
    let url = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${apiKey}&format=json&limit=100`;

    // Add filters if provided (the exact filter keys depend on the specific data.gov dataset)
    if (state) url += `&filters[state]=${encodeURIComponent(state)}`;
    if (market) url += `&filters[market]=${encodeURIComponent(market)}`;
    if (commodity) url += `&filters[commodity]=${encodeURIComponent(commodity)}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
        return NextResponse.json({ error: data.message || "Failed to fetch Mandi data" }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Mandi API fetch error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
