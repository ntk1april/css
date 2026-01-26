"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx-js-style";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [members, setMembers] = useState([]);
  const [filter, setFilter] = useState("day"); // 'day', 'month', 'all'
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [selectedMember, setSelectedMember] = useState("all");
  const [memberSearch, setMemberSearch] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [filter, selectedDate, selectedMember]);

  const fetchMembers = async () => {
    try {
      const response = await axios.get("/api/members");
      setMembers(response.data);
    } catch (error) {
      console.error("Failed to fetch members:", error);
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        filter: filter,
        date: selectedDate,
      });
      const response = await axios.get(`/api/transactions?${params}`);
      setTransactions(response.data);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      setError("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter((txn) => {
    if (selectedMember === "all") return true;
    return txn.member_id.toString() === selectedMember;
  });

  const calculateTotalRevenue = () => {
    return filteredTransactions.reduce((sum, txn) => sum + txn.total_amount, 0);
  };

  const handleViewDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailModal(true);
  };

  const handleExportExcel = () => {
    // Prepare data for Excel
    const excelData = filteredTransactions.map((txn) => ({
      รหัสการขาย: txn.transaction_id,
      วันที่และเวลา: formatDate(txn.transaction_date),
      ชื่อสมาชิก: txn.member_name,
      รหัสสมาชิก: txn.member_id,
      จำนวนสินค้า: txn.products.length,
      ยอดรวม: txn.total_amount.toFixed(2),
      ยอดที่จ่าย: txn.paid_amount.toFixed(2),
      เงินทอน: txn.change_amount.toFixed(2),
    }));

    const totalSales = filteredTransactions.reduce(
      (sum, txn) => sum + txn.total_amount,
      0,
    );

    excelData.push({
      รหัสการขาย: "",
      วันที่และเวลา: "",
      ชื่อสมาชิก: "ยอดขายทั้งหมด",
      รหัสสมาชิก: totalSales.toFixed(2) + " บาท",
      จำนวนสินค้า: "",
      ยอดรวม: "",
      ยอดที่จ่าย: "",
      เงินทอน: "",
    });

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    const range = XLSX.utils.decode_range(ws["!ref"]);

    // เปลี่ยนสีแถวแรก (header)
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!ws[cellAddress]) continue;

      ws[cellAddress].s = {
        fill: {
          fgColor: { rgb: "1F4E78" }, // น้ำเงินเข้ม
        },
        font: {
          color: { rgb: "FFFFFF" }, // ตัวอักษรขาว
          bold: true,
        },
        alignment: {
          horizontal: "center",
          vertical: "center",
        },
      };
    }

    ws["!cols"] = [
      { width: 20 },
      { width: 20 },
      { width: 30 },
      { width: 12 },
      { width: 12 },
      { width: 10 },
      { width: 10 },
      { width: 10 },
      { width: 10 },
    ];

    const lastRow = range.e.r;

    // ตัวหนาทั้งแถวสรุป
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cell = XLSX.utils.encode_cell({ r: lastRow, c: C });
      if (!ws[cell]) continue;

      ws[cell].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: "FFF2CC" } }, // เหลืองอ่อน
      };
    }

    // Generate filename with date
    const filename = `รายงานการขายในวันที่_${new Date().toISOString().split("T")[0]}.xlsx`;

    // Save file
    XLSX.writeFile(wb, filename);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getFilterTitle = () => {
    let title = "";
    if (filter === "day") {
      // Use consistent date format to avoid hydration errors
      const date = new Date(selectedDate);
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      title = `รายงานการขายในวันที่ ${day}/${month}/${year}`;
    } else if (filter === "month") {
      const date = new Date(selectedDate);
      const monthNames = [
        "มกราคม",
        "กุมภาพันธ์",
        "มีนาคม",
        "เมษายน",
        "พฤษภาคม",
        "มิถุนายน",
        "กรกฎาคม",
        "สิงหาคม",
        "กันยายน",
        "ตุลาคม",
        "พฤศจิกายน",
        "ธันวาคม",
      ];
      title = `รายงานการขายในเดือน ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    } else {
      title = "รายงานการขายทั้งหมด";
    }

    if (selectedMember !== "all") {
      const member = members.find(
        (m) => m.member_id.toString() === selectedMember,
      );
      if (member) {
        title += ` - ${member.member_name}`;
      }
    }

    return title;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="page-header max-w-7xl mx-auto">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">หน้าประวัติการขาย</h1>
            <p className="text-indigo-100">ดูและจัดการการขายทั้งหมด</p>
          </div>
          <button
            onClick={handleExportExcel}
            disabled={filteredTransactions.length === 0}
            className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            📊 ดาวน์โหลดรายงาน
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Filter Controls */}
        <div className="card-modern">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            <span className="text-indigo-600">🔍</span> ตัวกรองการขาย
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ตัวกรอง
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="input-modern w-full"
              >
                <option value="day">รายวัน</option>
                <option value="month">รายเดือน</option>
                <option value="all">ทั้งหมด</option>
              </select>
            </div>

            {filter !== "all" && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {filter === "day" ? "เลือกวันที่" : "เลือกเดือน"}
                </label>
                <input
                  type={filter === "day" ? "date" : "month"}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="input-modern w-full"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ตัวกรองตามสมาชิก
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder={
                    selectedMember === "all"
                      ? "สมาชิกทั้งหมด"
                      : members.find(
                          (m) => m.member_id.toString() === selectedMember,
                        )?.member_name
                  }
                  value={
                    isFocused
                      ? memberSearch
                      : selectedMember === "all"
                        ? "สมาชิกทั้งหมด"
                        : members.find(
                            (m) => m.member_id.toString() === selectedMember,
                          )?.member_name || ""
                  }
                  onChange={(e) => setMemberSearch(e.target.value)}
                  onFocus={() => {
                    setIsFocused(true);
                    setMemberSearch("");
                  }}
                  onBlur={() => {
                    // Delay hiding to allow click event on dropdown items
                    setTimeout(() => setIsFocused(false), 200);
                  }}
                  className="input-modern w-full cursor-pointer"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  ▼
                </div>
              </div>

              {/* Dropdown List - Shows when focused */}
              {(isFocused ||
                (memberSearch &&
                  memberSearch !==
                    (selectedMember === "all"
                      ? "สมาชิกทั้งหมด"
                      : members.find(
                          (m) => m.member_id.toString() === selectedMember,
                        )?.member_name))) && (
                <div className="absolute z-10 mt-1 w-[300px] max-h-60 overflow-y-auto border-2 border-indigo-300 rounded-lg bg-white shadow-xl">
                  <div
                    onMouseDown={() => {
                      // onMouseDown fires before onBlur
                      setSelectedMember("all");
                      setMemberSearch("สมาชิกทั้งหมด");
                      setIsFocused(false);
                    }}
                    className={`px-4 py-3 cursor-pointer hover:bg-indigo-50 border-b ${
                      selectedMember === "all"
                        ? "bg-indigo-100 font-semibold"
                        : ""
                    }`}
                  >
                    <p className="font-semibold">สมาชิกทั้งหมด</p>
                    <p className="text-xs text-gray-500">แสดงการขายทั้งหมด</p>
                  </div>
                  {members
                    .filter((member) => {
                      if (!memberSearch) return true;
                      const searchLower = memberSearch.toLowerCase();
                      return (
                        member.member_name
                          .toLowerCase()
                          .includes(searchLower) ||
                        member.member_id.toString().includes(searchLower)
                      );
                    })
                    .map((member) => (
                      <div
                        key={member._id}
                        onMouseDown={() => {
                          setSelectedMember(member.member_id.toString());
                          setMemberSearch(member.member_name);
                          setIsFocused(false);
                        }}
                        className={`px-4 py-3 cursor-pointer hover:bg-indigo-50 border-b ${
                          selectedMember === member.member_id.toString()
                            ? "bg-indigo-100 font-semibold"
                            : ""
                        }`}
                      >
                        <p className="font-semibold">{member.member_name}</p>
                        <p className="text-sm text-gray-500">
                          รหัสสมาชิก: {member.member_id}
                        </p>
                      </div>
                    ))}
                  {members.filter((member) => {
                    if (!memberSearch) return true;
                    const searchLower = memberSearch.toLowerCase();
                    return (
                      member.member_name.toLowerCase().includes(searchLower) ||
                      member.member_id.toString().includes(searchLower)
                    );
                  }).length === 0 &&
                    memberSearch && (
                      <div className="px-4 py-3 text-gray-500 text-center">
                        ไม่พบสมาชิกที่ค้นหา "{memberSearch}"
                      </div>
                    )}
                </div>
              )}
            </div>

            <div className="flex items-end">
              <button
                onClick={fetchTransactions}
                className="btn-primary-gradient w-full"
              >
                🔄 รีเฟรช
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-400 to-blue-600 text-white p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold mb-2">จำนวนการขายทั้งหมด</h3>
            <p className="text-4xl font-bold">{filteredTransactions.length}</p>
          </div>
          <div className="bg-gradient-to-br from-green-400 to-green-600 text-white p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold mb-2">รายได้ทั้งหมด</h3>
            <p className="text-4xl font-bold">
              {calculateTotalRevenue().toFixed(2)} บาท
            </p>
          </div>
          <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-white p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold mb-2">ราคาเฉลี่ยต่อบิล</h3>
            <p className="text-4xl font-bold">
              {filteredTransactions.length > 0
                ? (
                    calculateTotalRevenue() / filteredTransactions.length
                  ).toFixed(2)
                : "0.00"}{" "}
              บาท
            </p>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="card-modern">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            <span className="text-indigo-600">📋</span> {getFilterTitle()}
            {filteredTransactions.length > 0 && (
              <span className="ml-3 text-lg font-normal text-gray-600">
                ({filteredTransactions.length}{" "}
                {filteredTransactions.length === 1 ? "รายการ" : "รายการ"})
              </span>
            )}
          </h2>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">⏳</div>
              <p className="text-gray-500 text-lg">กำลังโหลด...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-500 text-lg">
                ไม่พบรายการการขายในช่วงเวลานี้
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table-modern">
                <thead>
                  <tr>
                    <th className="w-36">รหัสการขาย</th>
                    <th className="w-40">วันที่และเวลา</th>
                    <th>สมาชิก</th>
                    <th className="w-26 text-center">จำนวนสินค้า</th>
                    <th className="w-26 text-center">ราคารวม</th>
                    <th className="w-26 text-center">จ่าย</th>
                    <th className="w-26 text-center">เงินทอน</th>
                    <th className="w-24 text-center"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((txn) => (
                    <tr key={txn._id}>
                      <td className="font-mono text-sm text-center">
                        {txn.transaction_id}
                      </td>
                      <td className="text-center">
                        {formatDate(txn.transaction_date)}
                      </td>
                      <td className="text-center">
                        <div>
                          <p className="font-semibold">{txn.member_name}</p>
                          <p className="text-sm text-gray-500">
                            รหัสสมาชิก: {txn.member_id}
                          </p>
                        </div>
                      </td>
                      <td className="text-center">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                          {txn.products.length}
                        </span>
                      </td>
                      <td className="text-center font-semibold text-green-600">
                        {txn.total_amount.toFixed(2)} ฿
                      </td>
                      <td className="text-center">
                        {txn.paid_amount.toFixed(2)} ฿
                      </td>
                      <td className="text-center">
                        {txn.change_amount.toFixed(2)} ฿
                      </td>
                      <td className="text-center">
                        <button
                          onClick={() => handleViewDetails(txn)}
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-all duration-200"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Transaction Detail Modal */}
      {showDetailModal && selectedTransaction && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div
            className="modal-overlay"
            onClick={() => setShowDetailModal(false)}
          ></div>
          <div className="modal-content max-w-3xl w-full my-8">
            <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">
              📄 รายละเอียดการขาย
            </h2>

            {/* Transaction Info */}
            <div className="mb-6 p-4 bg-indigo-50 rounded-lg border-2 border-indigo-200">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 font-semibold">
                    รหัสการขาย
                  </p>
                  <p className="font-mono font-bold text-lg">
                    {selectedTransaction.transaction_id}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-semibold">
                    วันที่และเวลา
                  </p>
                  <p className="font-semibold">
                    {formatDate(selectedTransaction.transaction_date)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-semibold">
                    ชื่อสมาชิก
                  </p>
                  <p className="font-semibold text-lg">
                    {selectedTransaction.member_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-semibold">
                    รหัสสมาชิก
                  </p>
                  <p className="font-semibold">
                    {selectedTransaction.member_id}
                  </p>
                </div>
              </div>
            </div>

            {/* Products List */}
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-3 text-gray-800">
                <span className="text-indigo-600">🛒</span> รายการสินค้า
              </h3>
              <div className="overflow-x-auto">
                <table className="table-modern">
                  <thead>
                    <tr>
                      <th>สินค้า</th>
                      <th className="w-32 text-center">ราคา</th>
                      <th className="w-24 text-center">จำนวน</th>
                      <th className="w-32 text-center">ราคารวม</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedTransaction.products.map((product, index) => (
                      <tr key={index}>
                        <td>
                          <p className="font-semibold">
                            {product.product_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            รหัสสินค้า: {product.product_id}
                          </p>
                        </td>
                        <td className="text-center">
                          {product.price.toFixed(2)} ฿
                        </td>
                        <td className="text-center font-semibold">
                          {product.quantity}
                        </td>
                        <td className="text-center font-semibold text-green-600">
                          {product.subtotal.toFixed(2)} ฿
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="mb-6 p-6 bg-green-50 rounded-lg border-2 border-green-200">
              <div className="space-y-3">
                <div className="flex justify-between text-lg">
                  <span className="font-semibold">ราคารวม:</span>
                  <span className="text-2xl font-bold text-green-600">
                    {selectedTransaction.total_amount.toFixed(2)} ฿
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>ยอดที่จ่าย:</span>
                  <span className="font-semibold">
                    {selectedTransaction.paid_amount.toFixed(2)} ฿
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>เงินทอน:</span>
                  <span className="font-semibold">
                    {selectedTransaction.change_amount.toFixed(2)} ฿
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
