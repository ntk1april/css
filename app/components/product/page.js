"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

export default function Products() {
  const [list, setList] = useState([]);
  const [formData, setFormData] = useState({
    product_id: "",
    product_name: "",
    price: "",
    amount: "",
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Fetch products from the server
  const fetchProducts = async () => {
    try {
      const response = await axios.get("/api/products");
      setList(response.data);
    } catch (error) {
      console.error("Failed to fetch products: ", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAdd = () => {
    setFormData({
      product_id: "",
      product_name: "",
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
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            <span className="text-indigo-600">📦</span> รายการสินค้า
            {list.length > 0 && (
              <span className="ml-3 text-lg font-normal text-gray-600">
                ({list.length} {list.length === 1 ? "ชิ้น/อัน" : "ชิ้น/อัน"})
              </span>
            )}
          </h2>

          {list.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📦</div>
              <p className="text-gray-500 text-lg">
                ไม่พบสินค้า กรุณาเพิ่มสินค้าใหม่
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table-modern">
                <thead>
                  <tr>
                    <th className="w-40">รหัสสินค้า</th>
                    <th>ชื่อสินค้า</th>
                    <th className="w-32 text-center">ราคา</th>
                    <th className="w-32 text-center">จำนวน</th>
                    <th className="w-48 text-center"></th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((product) => (
                    <tr key={product._id}>
                      <td className="font-mono text-sm text-center">
                        {product.product_id}
                      </td>
                      <td className="font-semibold text-center">
                        {product.product_name}
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
