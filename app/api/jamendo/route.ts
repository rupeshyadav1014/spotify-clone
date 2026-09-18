import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.JAMENDO_CLIENT_ID;

  if (!clientId) {
    return NextResponse.json(
      { error: "JAMENDO_CLIENT_ID is missing" },
      { status: 500 }
    );
  }

  const url = new URL("https://api.jamendo.com/v3.0/tracks/");

  url.searchParams.set("client_id", clientId);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "30");
  url.searchParams.set("audioformat", "mp31");

  try {
    const response = await fetch(url.toString(), {
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Jamendo API request failed",
          details: data,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Jamendo API error:", error);

    return NextResponse.json(
      { error: "Unable to connect to Jamendo API" },
      { status: 500 }
    );
  }
}