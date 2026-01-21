import connectDB from "@/libs/mongodb";
import Member from "@/models/members";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  await connectDB();
  const { id } = params;
  const member = await Member.findOne({ member_id: id });
  if (!member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }
  return NextResponse.json(member, { status: 200 });
}

export async function PUT(req, { params }) {
  await connectDB();
  const { id } = params;
  const {
    newMemberId: member_id,
    newMemberName: member_name,
    newLevel: level,
    newAvatar: avatar,
  } = await req.json();

  // Check if new member_id already exists (excluding current member)
  const existing = await Member.findOne({
    member_id,
    _id: { $ne: id }, // Exclude current member from check
  });

  if (existing) {
    return NextResponse.json(
      { error: "Member ID already exists" },
      { status: 400 },
    );
  }

  await Member.findByIdAndUpdate(id, {
    member_id,
    member_name,
    level,
    avatar,
  });

  return NextResponse.json({ message: "Member updated" }, { status: 200 });
}
