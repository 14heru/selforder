import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const result = await db.query(
      "SELECT current_database() AS database, NOW() AS server_time",
    );
    return NextResponse.json({
      success: true,
      message: " connection PostgresSQL successful",
      database: result.rows[0].database,
      server_time: result.rows[0].server_time,
    });
  } catch (error) {
    console.error("Database connection error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Koneksi database PostgresSQL gagal. Periksa konfigurasi.",
      },
      { status: 500 },
    );
  }
}
