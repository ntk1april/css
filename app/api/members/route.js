import connectDB from "@/libs/mongodb";
import Member from "@/models/members";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();

  // Fix any members with empty level values
  await Member.updateMany(
    { $or: [{ level: "" }, { level: null }, { level: { $exists: false } }] },
    { $set: { level: "7" } },
  );

  const members = await Member.find({});
  return NextResponse.json(members);
}

export async function POST(req) {
  await connectDB();
  const { member_id, member_name, level, avatar } = await req.json();
  const existingMember = await Member.findOne({ member_id });
  if (existingMember) {
    return NextResponse.json(
      { error: "Member ID already exists" },
      { status: 400 },
    );
  }
  await Member.create({ member_id, member_name, level, avatar });
  return NextResponse.json({ message: "Member added" }, { status: 201 });
}

export async function DELETE(req) {
  await connectDB();
  const id = req.nextUrl.searchParams.get("id");
  await Member.findByIdAndDelete(id);
  return NextResponse.json({ message: "Member deleted" }, { status: 201 });
}
