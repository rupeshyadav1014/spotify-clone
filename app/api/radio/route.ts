import { NextResponse } from "next/server";

export async function GET() {
  try {
    const url =
      "https://de1.api.radio-browser.info/json/stations/bycountry/India?limit=20&hidebroken=true";

    const response = await fetch(url, {
      headers: {
        "User-Agent": "SpotifyClone/1.0",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Radio Browser API request failed" },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Unable to connect to Radio Browser API" },
      { status: 500 }
    );
  }
}