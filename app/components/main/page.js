"use client";
import axios from "axios";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

export default function Main() {
  const router = useRouter();
  const [memberId, setMemberId] = useState("");
  const [error, setError] = useState("");

  const handleNextClick = async (e) => {
    e.preventDefault();
    setError("");

    if (!memberId) {
      setError("Please enter a member ID");
      return;
    }

    try {
      // Check if member exists in database
      const response = await axios.get(`/api/members/${memberId}`);
      const member = response.data;

      // Member exists, redirect to purchase page with member data
      localStorage.setItem("currentMember", JSON.stringify(member));
      router.push("/purchase");
    } catch (error) {
      // Member not found, show alert and tell user to add member first
      if (error.response && error.response.status === 404) {
        Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด!",
          text: "ไม่พบสมาชิกที่คุณต้องการ กรุณาเพิ่มสมาชิกก่อน",
        });
        setMemberId("");
        setError("");
      } else {
        setError("Error checking member. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      {/* Page Header */}
      <div className="page-header max-w-4xl mx-auto text-center">
        <h1 className="text-5xl font-bold mb-2">ระบบขายสินค้าสหกรณ์</h1>
        <p className="text-xl text-indigo-100">โรงเรียนบ้านหนองกึ่ม</p>
      </div>

      {/* Login Card */}
      <div className="max-w-md mx-auto">
        <div className="card-modern">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
            เข้าสู่ระบบ
          </h2>
          <p className="text-center text-gray-600 mb-6">
            กรุณากรอกรหัสสมาชิกเพื่อเข้าหน้าซื้อสินค้า
          </p>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="memberId"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                รหัสสมาชิก
              </label>
              <input
                autoFocus
                id="memberId"
                type="number"
                placeholder="กรอกรหัสสมาชิก"
                className="input-modern w-full"
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleNextClick(e)}
              />
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            )}

            <button
              onClick={handleNextClick}
              disabled={!memberId}
              className="btn-primary-gradient w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ต่อไป
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
