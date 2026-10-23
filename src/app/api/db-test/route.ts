import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { success: false, message: "Endpoint tidak tersedia." },
      { status: 404 },
    );
  }

  try {
    await db.query("SELECT 1");

    return NextResponse.json({
      success: true,
      message: "Koneksi PostgreSQL berhasil.",
    });
  } catch (error) {
    console.error("Database connection error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Koneksi database gagal. Periksa konfigurasi.",
      },
      { status: 500 },
    );
  }
}
