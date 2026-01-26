"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

const Navbar = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Get user from localStorage on mount
    const updateUser = () => {
      // Check if we're in the browser (not SSR)
      if (typeof window !== "undefined") {
        const userData = localStorage.getItem("user");
        if (userData) {
          try {
            setUser(JSON.parse(userData));
          } catch (error) {
            console.error("Error parsing user data:", error);
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
    };

    // Initial load
    updateUser();
    setIsMounted(true);

    // Listen for storage changes (works across tabs)
    if (typeof window !== "undefined") {
      window.addEventListener("storage", updateUser);
      // Listen for custom event (works in same tab)
      window.addEventListener("userChanged", updateUser);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("storage", updateUser);
        window.removeEventListener("userChanged", updateUser);
      }
    };
  }, []);

  const handleLogout = async () => {
    const result = await Swal.fire({
      icon: "warning",
      title: "ออกจากระบบ?",
      text: "คุณต้องการออกจากระบบหรือไม่?",
      showCancelButton: true,
      confirmButtonText: "ออกจากระบบ",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
    });

    if (result.isConfirmed) {
      // Clear localStorage
      localStorage.removeItem("user");
      localStorage.removeItem("currentMember");

      // Clear all cart data
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("cart_")) {
          localStorage.removeItem(key);
        }
      });

      // Clear cookie
      document.cookie = "user=; path=/; max-age=0";

      // Dispatch custom event to update navbar
      window.dispatchEvent(new Event("userChanged"));

      await Swal.fire({
        icon: "success",
        title: "ออกจากระบบสำเร็จ!",
        confirmButtonColor: "#10b981",
        timer: 1500,
      });

      router.push("/login");
    }
  };

  return (
    <nav className="gradient-primary shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center group-hover:bg-opacity-30 transition-all duration-300">
              <span className="text-2xl">🏪</span>
            </div>
            <span className="text-white font-bold text-xl hidden sm:block">
              ระบบขายสินค้าสหกรณ์
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {/* Home - Both Admin and User */}
            {user && (
              <Link
                href="/"
                className="px-4 py-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-300 font-medium"
              >
                🏠 หน้าแรก
              </Link>
            )}

            {/* Product Management - Admin Only */}
            {user?.role === "admin" && (
              <Link
                href="/components/products"
                className="px-4 py-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-300 font-medium"
              >
                📦 จัดการข้อมูลสินค้า
              </Link>
            )}

            {/* Member Management - Admin Only */}
            {user?.role === "admin" && (
              <Link
                href="/components/members"
                className="px-4 py-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-300 font-medium"
              >
                👥 จัดการข้อมูลสมาชิก
              </Link>
            )}

            {/* Transactions - Both Admin and User */}
            {user && (
              <Link
                href="/components/transactions"
                className="px-4 py-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-300 font-medium"
              >
                📊 ประวัติการซื้อขาย
              </Link>
            )}

            {/* User Info & Logout OR Login Button */}
            <div className="flex items-center gap-2 ml-4 pl-4 border-l border-white border-opacity-30">
              {isMounted && user ? (
                <>
                  <span className="text-white text-sm">👤 {user.username}</span>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-300 font-medium"
                  >
                    🚪 ออกจากระบบ
                  </button>
                </>
              ) : isMounted ? (
                <Link
                  href="/login"
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all duration-300 font-medium shadow-lg"
                >
                  🔐 เข้าสู่ระบบ
                </Link>
              ) : null}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <details className="dropdown dropdown-end">
              <summary className="btn btn-ghost btn-circle text-white hover:bg-white hover:bg-opacity-20">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </summary>
              <ul className="menu dropdown-content mt-3 p-2 shadow-xl bg-white rounded-lg w-52 z-50">
                {isMounted && user && (
                  <li className="border-b border-gray-200 pb-2 mb-2">
                    <div className="text-gray-700 font-semibold pointer-events-none">
                      👤 {user.username}
                    </div>
                  </li>
                )}
                <li>
                  {user && (
                    <Link
                      href="/"
                      className="text-gray-700 hover:bg-indigo-50 font-medium"
                    >
                      🏠 หน้าแรก
                    </Link>
                  )}
                </li>

                {/* Product Management - Admin Only */}
                {user?.role === "admin" && (
                  <li>
                    <Link
                      href="/components/products"
                      className="text-gray-700 hover:bg-indigo-50 font-medium"
                    >
                      📦 สินค้า
                    </Link>
                  </li>
                )}

                {/* Member Management - Admin Only */}
                {user?.role === "admin" && (
                  <li>
                    <Link
                      href="/components/members"
                      className="text-gray-700 hover:bg-indigo-50 font-medium"
                    >
                      👥 สมาชิก
                    </Link>
                  </li>
                )}

                <li>
                  {user && (
                    <Link
                      href="/components/transactions"
                      className="text-gray-700 hover:bg-indigo-50 font-medium"
                    >
                      📊 ประวัติ
                    </Link>
                  )}
                </li>
                {isMounted && user ? (
                  <li className="border-t border-gray-200 mt-2 pt-2">
                    <button
                      onClick={handleLogout}
                      className="text-red-600 hover:bg-red-50 font-medium w-full text-left"
                    >
                      🚪 ออกจากระบบ
                    </button>
                  </li>
                ) : isMounted ? (
                  <li className="border-t border-gray-200 mt-2 pt-2">
                    <Link
                      href="/login"
                      className="text-green-600 hover:bg-green-50 font-medium"
                    >
                      🔐 เข้าสู่ระบบ
                    </Link>
                  </li>
                ) : null}
              </ul>
            </details>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
