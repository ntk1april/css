import { NextResponse } from "next/server";
import connectDB from "@/libs/mongodb";
const User = require("@/models/User");

export async function POST(request) {
  try {
    await connectDB();

    const { username, password } = await request.json();

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "กรุณากรอกชื่อผู้ใช้และรหัสผ่าน" },
        { status: 400 },
      );
    }

    // Find user
    const user = await User.findOne({ username });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "ไม่พบชื่อผู้ใช้นี้ในระบบ" },
        { status: 401 },
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { success: false, message: "บัญชีนี้ถูกระงับการใช้งาน" },
        { status: 403 },
      );
    }

    // Check password (plain text comparison - for manual DB entry)
    if (user.password !== password) {
      return NextResponse.json(
        { success: false, message: "รหัสผ่านไม่ถูกต้อง" },
        { status: 401 },
      );
    }

    // Login successful
    const response = NextResponse.json({
      success: true,
      message: "เข้าสู่ระบบสำเร็จ",
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
    });

    // Set HTTP cookie for middleware
    response.cookies.set(
      "user",
      JSON.stringify({
        id: user._id,
        username: user.username,
        role: user.role,
      }),
      {
        httpOnly: false, // Allow JavaScript to read it
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24, // 24 hours
        path: "/",
      },
    );

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ" },
      { status: 500 },
    );
  }
}
