"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

export default function Products() {
  const [list, setList] = useState([]);
  const [formData, setFormData] = useState({
    product_id: "",
    product_name: "",
    category: "ทั่วไป",
    price: "",
    amount: "",
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({
    key: "product_id",
    direction: "ascending",
  });

  // Fetch products from the server
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/products");
      setList(response.data);
    } catch (error) {
      console.error("Failed to fetch products: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAdd = () => {
    setFormData({
      product_id: "",
      product_name: "",
      category: "ทั่วไป",
      price: "",
      amount: "",
    });
    setShowAddForm(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      product_id: product.product_id,
      product_name: product.product_name,
      category: product.category || "ทั่วไป",
      price: product.price,
      amount: product.amount,
    });
    setShowEditForm(true);
  };

  // Function to handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Add new product
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/products", formData);
      Swal.fire({
        icon: "success",
        title: "สำเร็จ!",
        text: "เพิ่มสินค้าเรียบร้อยแล้ว!",
      });
      setFormData({
        product_id: "",
        product_name: "",
        category: "ทั่วไป",
        price: "",
        amount: "",
      });
      setShowAddForm(false);
      fetchProducts();
    } catch (error) {
      console.error("Failed to add product: ", error);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด!",
        text: "เกิดข้อผิดพลาดในการเพิ่มสินค้า กรุณาลองใหม่อีกครั้ง",
      });
    }
  };

  // Update product
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const updateData = {
        newProductId: formData.product_id,
        newProductName: formData.product_name,
        newCategory: formData.category,
        newPrice: formData.price,
        newAmount: formData.amount,
      };

      await axios.put(`/api/products/${editingProduct._id}`, updateData);
      Swal.fire({
        icon: "success",
        title: "สำเร็จ!",
        text: "แก้ไขสินค้าเรียบร้อยแล้ว!",
      });
      setShowEditForm(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      console.error("Failed to update product: ", error);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด!",
        text: "เกิดข้อผิดพลาดในการแก้ไขสินค้า กรุณาลองใหม่อีกครั้ง",
      });
    }
  };

  // Delete product
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "ลบสินค้า?",
      text: "คุณแน่ใจหรือไม่ว่าต้องการลบสินค้านี้?",
      showCancelButton: true,
      confirmButtonText: "ใช่, ลบเลย",
      cancelButtonText: "ยกเลิก",
    });
    if (result.isConfirmed) {
      try {
        await axios.delete(`/api/products?id=${id}`);
        Swal.fire({
          icon: "success",
          title: "ลบเรียบร้อยแล้ว!",
          text: "ลบสินค้าเรียบร้อยแล้ว",
        });
        fetchProducts();
      } catch (error) {
        console.error("Error deleting product:", error);
        Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด!",
          text: "ไม่สามารถลบสินค้าได้ กรุณาลองใหม่อีกครั้ง",
        });
      }
    }
  };

  // Handle sorting
  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Get unique categories from products
  const categories = React.useMemo(() => {
    const uniqueCategories = [
      ...new Set(list.map((p) => p.category || "ทั่วไป")),
    ];
    return uniqueCategories.sort();
  }, [list]);

  // Filter and sort products
  const filteredProducts = React.useMemo(() => {
    let filtered = list.filter((product) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        product.product_id.toString().includes(searchLower) ||
        product.product_name.toLowerCase().includes(searchLower) ||
        (product.category || "ทั่วไป").toLowerCase().includes(searchLower);

      const matchesCategory =
        categoryFilter === "all" ||
        (product.category || "ทั่วไป") === categoryFilter;

      return matchesSearch && matchesCategory;
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Handle numeric sorting for ID, Price, and Amount
        if (
          sortConfig.key === "product_id" ||
          sortConfig.key === "price" ||
          sortConfig.key === "amount"
        ) {
          aValue = parseFloat(aValue);
          bValue = parseFloat(bValue);
        } else if (typeof aValue === "string") {
          aValue = aValue.toLowerCase();
          bValue = (bValue || "").toLowerCase();
        }

        if (aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return filtered;
  }, [list, searchTerm, categoryFilter, sortConfig]);

  const getCategoryBadgeColor = (category) => {
    const colors = {
      อาหาร: "bg-green-100 text-green-700",
      เครื่องดื่ม: "bg-blue-100 text-blue-700",
      ขนม: "bg-yellow-100 text-yellow-700",
      สกินแคร์: "bg-purple-100 text-purple-700",
      อุปกรณ์การเรียน: "bg-indigo-100 text-indigo-700",
      ทั่วไป: "bg-gray-100 text-gray-700",
    };
    return colors[category] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Page Header */}
      <div className="page-header max-w-7xl mx-auto">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">หน้าจัดการสินค้า</h1>
            <p className="text-indigo-100">จัดการสินค้าของคุณ</p>
          </div>
          <button onClick={handleAdd} className="btn-primary-gradient">
            + เพิ่มสินค้าใหม่
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="max-w-7xl mx-auto">
        <div className="card-modern">
          <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
            <h2 className="text-2xl font-bold text-gray-800">
              <span className="text-indigo-600">📦</span> รายการสินค้า
              {list.length > 0 && (
                <span className="ml-3 text-lg font-normal text-gray-600">
                  ({filteredProducts.length} จาก {list.length})
                </span>
              )}
            </h2>

            <div className="flex gap-4 flex-wrap max-w-2xl justify-end">
              {/* Category Filter */}
              <div className="w-40">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="input-modern w-full"
                >
                  <option value="all">ทุกหมวดหมู่</option>
                  <option value="ทั่วไป">ทั่วไป</option>
                  <option value="อาหาร">อาหาร</option>
                  <option value="เครื่องดื่ม">เครื่องดื่ม</option>
                  <option value="ขนม">ขนม</option>
                  <option value="สกินแคร์">สกินแคร์</option>
                  <option value="อุปกรณ์การเรียน">อุปกรณ์การเรียน</option>
                  {/* {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))} */}
                </select>
              </div>

              {/* Search Filter */}
              <div className="flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="🔍 ค้นหาด้วยรหัส, ชื่อ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-modern w-full"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4 animate-pulse">⏳</div>
              <p className="text-gray-500 text-lg">กำลังโหลดข้อมูลสินค้า...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">
                {searchTerm || categoryFilter !== "all" ? "🔍" : "📦"}
              </div>
              <p className="text-gray-500 text-lg">
                {searchTerm || categoryFilter !== "all"
                  ? "ไม่พบสินค้าที่ตรงกับการค้นหา"
                  : "ไม่พบสินค้า กรุณาเพิ่มสินค้าใหม่"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table-modern">
                <thead>
                  <tr>
                    <th
                      className="w-36 cursor-pointer hover:bg-opacity-90 transition-colors select-none"
                      onClick={() => requestSort("product_id")}
                    >
                      <div className="flex items-center justify-center gap-2">
                        รหัสสินค้า
                        {sortConfig.key === "product_id" && (
                          <span>
                            {sortConfig.direction === "ascending" ? "▲" : "▼"}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      className="w-50 cursor-pointer hover:bg-opacity-90 transition-colors select-none"
                      onClick={() => requestSort("product_name")}
                    >
                      <div className="flex items-center justify-center gap-2">
                        ชื่อสินค้า
                        {sortConfig.key === "product_name" && (
                          <span>
                            {sortConfig.direction === "ascending" ? "▲" : "▼"}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      className="w-50 cursor-pointer hover:bg-opacity-90 transition-colors select-none"
                      onClick={() => requestSort("category")}
                    >
                      <div className="flex items-center justify-center gap-2">
                        หมวดหมู่
                        {sortConfig.key === "category" && (
                          <span>
                            {sortConfig.direction === "ascending" ? "▲" : "▼"}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      className="w-36 text-center cursor-pointer hover:bg-opacity-90 transition-colors select-none"
                      onClick={() => requestSort("price")}
                    >
                      <div className="flex items-center justify-center gap-2">
                        ราคา
                        {sortConfig.key === "price" && (
                          <span>
                            {sortConfig.direction === "ascending" ? "▲" : "▼"}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      className="w-32 text-center cursor-pointer hover:bg-opacity-90 transition-colors select-none"
                      onClick={() => requestSort("amount")}
                    >
                      <div className="flex items-center justify-center gap-2">
                        จำนวน
                        {sortConfig.key === "amount" && (
                          <span>
                            {sortConfig.direction === "ascending" ? "▲" : "▼"}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="w-50 text-center"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product._id}>
                      <td className="font-mono text-sm text-center">
                        {product.product_id}
                      </td>
                      <td className="font-semibold text-center">
                        {product.product_name}
                      </td>
                      <td className="text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${getCategoryBadgeColor(product.category || "ทั่วไป")}`}
                        >
                          {product.category || "ทั่วไป"}
                        </span>
                      </td>
                      <td className="text-center font-semibold text-green-600">
                        {product.price.toFixed(2)} บาท
                      </td>
                      <td className="text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            product.amount > 10
                              ? "bg-green-100 text-green-700"
                              : product.amount > 0
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {product.amount}
                        </span>
                      </td>
                      <td className="text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleEdit(product)}
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-all duration-200"
                          >
                            แก้ไข
                          </button>
                          <button
                            onClick={() => handleDelete(product._id)}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-all duration-200"
                          >
                            ลบ
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddForm && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50 p-4">
          <div className="modal-overlay"></div>
          <form
            onSubmit={handleAddSubmit}
            className="modal-content max-w-lg w-full"
          >
            <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">
              📦 เพิ่มสินค้าใหม่
            </h2>

            <div className="space-y-5">
              <div>
                <label
                  htmlFor="product_id"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  รหัสสินค้า <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="product_id"
                  name="product_id"
                  value={formData.product_id}
                  onChange={handleChange}
                  className="input-modern w-full"
                  placeholder="กรุณาระบุรหัสสินค้า"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="product_name"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  ชื่อสินค้า <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="product_name"
                  name="product_name"
                  value={formData.product_name}
                  onChange={handleChange}
                  className="input-modern w-full"
                  placeholder="กรุณาระบุชื่อสินค้า"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  หมวดหมู่
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="input-modern w-full"
                >
                  <option value="ทั่วไป">ทั่วไป</option>
                  <option value="อาหาร">อาหาร</option>
                  <option value="เครื่องดื่ม">เครื่องดื่ม</option>
                  <option value="ขนม">ขนม</option>
                  <option value="สกินแคร์">สกินแคร์</option>
                  <option value="อุปกรณ์การเรียน">อุปกรณ์การเรียน</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="price"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  ราคา (บาท) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="input-modern w-full"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="amount"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  จำนวน (ชิ้น)<span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  min="0"
                  className="input-modern w-full"
                  placeholder="0"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="flex-1 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
              >
                ยกเลิก
              </button>
              <button type="submit" className="flex-1 btn-success-gradient">
                เพิ่มสินค้า
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditForm && editingProduct && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50 p-4">
          <div className="modal-overlay"></div>
          <form
            onSubmit={handleEditSubmit}
            className="modal-content max-w-lg w-full"
          >
            <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">
              ✏️ แก้ไขสินค้า
            </h2>

            <div className="space-y-5">
              <div>
                <label
                  htmlFor="edit_product_id"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  รหัสสินค้า <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="edit_product_id"
                  name="product_id"
                  value={formData.product_id}
                  onChange={handleChange}
                  className="input-modern w-full"
                  placeholder="กรุณาระบุรหัสสินค้า"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="edit_product_name"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  ชื่อสินค้า <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="edit_product_name"
                  name="product_name"
                  value={formData.product_name}
                  onChange={handleChange}
                  className="input-modern w-full"
                  placeholder="กรุณาระบุชื่อสินค้า"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="edit_category"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  หมวดหมู่
                </label>
                <select
                  id="edit_category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="input-modern w-full"
                >
                  <option value="ทั่วไป">ทั่วไป</option>
                  <option value="อาหาร">อาหาร</option>
                  <option value="เครื่องดื่ม">เครื่องดื่ม</option>
                  <option value="ขนม">ขนม</option>
                  <option value="สกินแคร์">สกินแคร์</option>
                  <option value="อุปกรณ์การเรียน">อุปกรณ์การเรียน</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="edit_price"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  ราคา (บาท) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="edit_price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="input-modern w-full"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="edit_amount"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  จำนวน (ชิ้น)<span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="edit_amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  min="0"
                  className="input-modern w-full"
                  placeholder="0"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                type="button"
                onClick={() => {
                  setShowEditForm(false);
                  setEditingProduct(null);
                }}
                className="flex-1 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
              >
                ยกเลิก
              </button>
              <button type="submit" className="flex-1 btn-success-gradient">
                อัพเดทสินค้า
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
