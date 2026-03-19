import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  if (!q) {
    return NextResponse.json({ error: "Query parameter 'q' is required" }, { status: 400 });
  }

  const apiKey = process.env.Weather_api_key;
  if (!apiKey) {
    return NextResponse.json({ error: "Weather API key not configured" }, { status: 500 });
  }

  try {
    const response = await fetch(
      `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${q}&days=1&aqi=no&alerts=no`
    );
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.error?.message || "Failed to fetch weather data" }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("WeatherAPI fetch error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
