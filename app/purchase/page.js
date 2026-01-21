"use client";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

export default function Purchase() {
  const router = useRouter();
  const barcodeInputRef = useRef(null);

  const [member, setMember] = useState(null);
  const [barcode, setBarcode] = useState("");
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paidAmount, setPaidAmount] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [viewingImage, setViewingImage] = useState(null);

  useEffect(() => {
    // Load member data from localStorage
    const memberData = localStorage.getItem("currentMember");
    if (!memberData) {
      router.push("/");
      return;
    }
    const parsedMember = JSON.parse(memberData);
    setMember(parsedMember);

    // Load cart from server for this specific member
    const loadCartFromServer = async () => {
      try {
        const response = await axios.get(
          `/api/cart?member_id=${parsedMember.member_id}`,
        );
        if (response.data.success && response.data.cart) {
          console.log("Cart loaded from server:", response.data.cart);
          // Add subtotal to each item
          const itemsWithSubtotal = (response.data.cart.items || []).map(
            (item) => ({
              ...item,
              subtotal: item.price * item.quantity,
            }),
          );
          console.log("Items with subtotal:", itemsWithSubtotal);
          setCart(itemsWithSubtotal);
          cartLoaded.current = true; // Mark cart as loaded
        } else {
          console.log(
            "No cart found on server for member:",
            parsedMember.member_id,
          );
          cartLoaded.current = true; // Mark as loaded even if empty
        }
      } catch (error) {
        console.error("Failed to load cart from server:", error);
        // Fallback to localStorage if server fails
        const savedCart = localStorage.getItem(
          `cart_${parsedMember.member_id}`,
        );
        if (savedCart) {
          try {
            setCart(JSON.parse(savedCart));
          } catch (e) {
            console.error("Failed to load cart from localStorage:", e);
          }
        }
        cartLoaded.current = true; // Mark as loaded even on error
      }
    };

    loadCartFromServer();

    // Fetch all products
    fetchProducts();
  }, []);

  // Save cart to server whenever it changes
  const isInitialMount = useRef(true);
  const cartLoaded = useRef(false);

  useEffect(() => {
    // Don't save until cart has been loaded from server at least once
    if (!cartLoaded.current) {
      return;
    }

    // Skip saving on initial mount ONLY if cart is empty
    // This prevents overwriting server cart with empty array on page load
    if (isInitialMount.current && cart.length === 0) {
      isInitialMount.current = false;
      return;
    }

    // After first render, always mark as not initial
    if (isInitialMount.current) {
      isInitialMount.current = false;
    }

    const saveCartToServer = async () => {
      if (member && cart.length >= 0) {
        try {
          const total = cart.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0,
          );

          console.log("Saving cart to server:", cart);
          await axios.post("/api/cart", {
            member_id: member.member_id,
            member_name: member.member_name,
            items: cart,
            total_amount: total,
          });

          // Also save to localStorage as backup
          localStorage.setItem(
            `cart_${member.member_id}`,
            JSON.stringify(cart),
          );
        } catch (error) {
          console.error("Failed to save cart to server:", error);
          // Still save to localStorage even if server fails
          localStorage.setItem(
            `cart_${member.member_id}`,
            JSON.stringify(cart),
          );
        }
      }
    };

    saveCartToServer();

    // Auto-focus on barcode input
    barcodeInputRef.current?.focus();
  }, [cart, member]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get("/api/products");
      setProducts(response.data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setError("Failed to load products");
    }
  };

  const handleBarcodeSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!barcode) return;

    // Find product by product_id (barcode)
    const product = products.find(
      (p) => p.product_id.toString() === barcode.toString(),
    );

    if (!product) {
      setError(`Product with barcode ${barcode} not found`);
      setBarcode("");
      return;
    }

    // Check stock availability
    if (product.amount <= 0) {
      setError(`${product.product_name} สินค้าหมด`);
      setBarcode("");
      return;
    }

    // Check if product already in cart
    const existingItemIndex = cart.findIndex(
      (item) => item.product_id === product.product_id,
    );

    if (existingItemIndex >= 0) {
      // Check if we can increase quantity
      const currentCartQty = cart[existingItemIndex].quantity;
      if (currentCartQty >= product.amount) {
        setError(`เหลือ ${product.amount} ชิ้น`);
        setBarcode("");
        return;
      }

      // Increase quantity and update stock
      try {
        // Update database stock
        await axios.put(`/api/products/${product._id}`, {
          amount: product.amount - 1,
        });

        // Update local products list
        const updatedProducts = products.map((p) =>
          p._id === product._id ? { ...p, amount: p.amount - 1 } : p,
        );
        setProducts(updatedProducts);

        // Update cart
        const updatedCart = [...cart];
        updatedCart[existingItemIndex].quantity += 1;
        updatedCart[existingItemIndex].subtotal =
          updatedCart[existingItemIndex].quantity *
          updatedCart[existingItemIndex].price;
        setCart(updatedCart);

        setSuccess(`เพิ่ม ${product.product_name} สำเร็จ`);
        setTimeout(() => setSuccess(""), 2000);
      } catch (error) {
        console.error("Failed to update stock:", error);
        setError("Failed to update inventory");
      }
    } else {
      // Add new item to cart and update stock
      try {
        // Update database stock
        await axios.put(`/api/products/${product._id}`, {
          amount: product.amount - 1,
        });

        // Update local products list
        const updatedProducts = products.map((p) =>
          p._id === product._id ? { ...p, amount: p.amount - 1 } : p,
        );
        setProducts(updatedProducts);

        // Add to cart
        const cartItem = {
          _id: product._id, // Store product _id for stock restoration
          product_id: product.product_id,
          product_name: product.product_name,
          price: product.price,
          quantity: 1,
          subtotal: product.price,
        };
        setCart([...cart, cartItem]);

        setSuccess(`เพิ่ม ${product.product_name} สำเร็จ`);
        setTimeout(() => setSuccess(""), 2000);
      } catch (error) {
        console.error("Failed to update stock:", error);
        setError("Failed to update inventory");
      }
    }

    setBarcode("");
  };

  const handleQuantityChange = async (index, newQuantity) => {
    if (newQuantity < 1) return;

    const item = cart[index];
    const quantityDiff = newQuantity - item.quantity;

    if (quantityDiff > 0) {
      // Increasing quantity - need to check stock and decrease inventory
      const product = products.find((p) => p._id === item._id);
      if (!product || product.amount < quantityDiff) {
        setError(`เหลือ ${product?.amount || 0} ชิ้น`);
        return;
      }

      try {
        // Update database stock
        await axios.put(`/api/products/${item._id}`, {
          amount: product.amount - quantityDiff,
        });

        // Update local products list
        const updatedProducts = products.map((p) =>
          p._id === item._id ? { ...p, amount: p.amount - quantityDiff } : p,
        );
        setProducts(updatedProducts);

        // Update cart
        const updatedCart = [...cart];
        updatedCart[index].quantity = newQuantity;
        updatedCart[index].subtotal = updatedCart[index].price * newQuantity;
        setCart(updatedCart);
      } catch (error) {
        console.error("Failed to update stock:", error);
        setError("Failed to update inventory");
      }
    } else if (quantityDiff < 0) {
      // Decreasing quantity - restore stock
      const restoreAmount = Math.abs(quantityDiff);

      try {
        const product = products.find((p) => p._id === item._id);

        // Update database stock
        await axios.put(`/api/products/${item._id}`, {
          amount: product.amount + restoreAmount,
        });

        // Update local products list
        const updatedProducts = products.map((p) =>
          p._id === item._id ? { ...p, amount: p.amount + restoreAmount } : p,
        );
        setProducts(updatedProducts);

        // Update cart
        const updatedCart = [...cart];
        updatedCart[index].quantity = newQuantity;
        updatedCart[index].subtotal = updatedCart[index].price * newQuantity;
        setCart(updatedCart);
      } catch (error) {
        console.error("Failed to restore stock:", error);
        setError("Failed to update inventory");
      }
    }
  };

  const handleRemoveItem = async (index) => {
    const item = cart[index];

    try {
      // Restore stock to database
      const product = products.find((p) => p._id === item._id);
      await axios.put(`/api/products/${item._id}`, {
        amount: product.amount + item.quantity,
      });

      // Update local products list
      const updatedProducts = products.map((p) =>
        p._id === item._id ? { ...p, amount: p.amount + item.quantity } : p,
      );
      setProducts(updatedProducts);

      // Remove from cart
      const updatedCart = cart.filter((_, i) => i !== index);
      setCart(updatedCart);
    } catch (error) {
      console.error("Failed to restore stock:", error);
      setError("Failed to restore inventory");
    }
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.subtotal, 0);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      setError("Cart is empty");
      return;
    }
    setShowPaymentModal(true);
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setError("");

    const total = calculateTotal();
    const paid = parseFloat(paidAmount);

    if (isNaN(paid) || paid < total) {
      setError(`Insufficient payment. Total: ${total.toFixed(2)}`);
      return;
    }

    const change = paid - total;

    try {
      // Generate transaction ID
      const transactionId = `TXN${Date.now()}`;

      // Create transaction
      const transactionData = {
        transaction_id: transactionId,
        member_id: member.member_id,
        member_name: member.member_name,
        products: cart,
        total_amount: total,
        paid_amount: paid,
        change_amount: change,
      };

      await axios.post("/api/transactions", transactionData);

      // Show success message with change
      await Swal.fire({
        icon: "success",
        title: "ชำระเงินสำเร็จ!",
        html: `
          <div style="text-align: left; font-size: 16px; line-height: 1.8;">
            <p><strong>ยอดรวม:</strong> ${total.toFixed(2)} บาท</p>
            <p><strong>รับเงิน:</strong> ${paid.toFixed(2)} บาท</p>
            <p style="color: #10b981; font-size: 18px;"><strong>เงินทอน:</strong> ${change.toFixed(2)} บาท</p>
          </div>
        `,
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#10b981",
      });

      // Clear cart and reset
      setCart([]);
      localStorage.removeItem(`cart_${member.member_id}`); // Clear saved cart

      // Clear cart from server
      try {
        await axios.delete(
          `/api/cart?member_id=${member.member_id}&action=complete`,
        );
      } catch (error) {
        console.error("Failed to clear cart from server:", error);
      }

      setPaidAmount("");
      setShowPaymentModal(false);

      // Ask if user wants to continue or go back
      const result = await Swal.fire({
        icon: "success",
        title: "เสร็จสิ้นการชำระเงิน",
        text: "ต้องการซื้อสินค้าต่อหรือไม่?",
        showCancelButton: true,
        confirmButtonText: "ซื้อต่อ",
        cancelButtonText: "กลับหน้าแรก",
      });
      if (!result.isConfirmed) {
        localStorage.removeItem("currentMember");
        router.push("/");
      }
    } catch (error) {
      console.error("Payment failed:", error);
      setError("Failed to process payment. Please try again.");
    }
  };

  const handleCancelPurchase = async () => {
    const result = await Swal.fire({
      icon: "warning",
      title: "ยกเลิกการซื้อ?",
      text: "ต้องการยกเลิกการซื้อหรือไม่?",
      showCancelButton: true,
      confirmButtonText: "กลับหน้าแรก",
      cancelButtonText: "ไม่ยกเลิก",
    });
    if (result.isConfirmed) {
      try {
        // Restore stock for all items in cart
        for (const item of cart) {
          const product = products.find((p) => p._id === item._id);
          if (product) {
            await axios.put(`/api/products/${item._id}`, {
              amount: product.amount + item.quantity,
            });
          }
        }

        // Clear cart and member data
        if (member) {
          localStorage.removeItem(`cart_${member.member_id}`);
          // Clear cart from server
          try {
            await axios.delete(
              `/api/cart?member_id=${member.member_id}&action=delete`,
            );
          } catch (error) {
            console.error("Failed to clear cart from server:", error);
          }
        }
        localStorage.removeItem("currentMember");
        router.push("/");
      } catch (error) {
        console.error("Failed to restore stock:", error);
        // Still allow cancel even if stock restoration fails
        if (member) {
          localStorage.removeItem(`cart_${member.member_id}`);
        }
        localStorage.removeItem("currentMember");
        router.push("/");
      }
    }
  };

  if (!member) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  const total = calculateTotal();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="page-header max-w-7xl mx-auto">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-4">
            {/* Profile Picture */}
            <div>
              {member.avatar ? (
                <img
                  src={member.avatar}
                  alt={member.member_name}
                  onClick={() =>
                    setViewingImage({
                      src: member.avatar,
                      name: member.member_name,
                      member_id: member.member_id,
                    })
                  }
                  className="w-40 h-40 rounded-full object-cover border-2 border-indigo-200 cursor-pointer hover:border-indigo-400 transition-all duration-200"
                  title="Click to view full size"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-white bg-opacity-20 flex items-center justify-center border-4 border-white shadow-lg">
                  <span className="text-white font-bold text-3xl">
                    {member.member_name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Member Info */}
            <div>
              <h1 className="text-4xl font-bold mb-2">หน้าซื้อสินค้า</h1>
              <div className="flex items-center gap-4 flex-wrap">
                <p className="text-indigo-100">
                  <span className="font-semibold text-white">
                    ชื่อสมาชิก: {member.member_name}
                  </span>
                  <span className="mx-2">•</span>
                  รหัสสมาชิก: {member.member_id}
                </p>
                <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-semibold">
                  {member.level === "7"
                    ? "ครู/อาจารย์"
                    : `มัธยมศึกษาปีที่ ${member.level}`}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={handleCancelPurchase}
            className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
          >
            ยกเลิกการซื้อ
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Barcode Scanner Section */}
        <div className="card-modern">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            <span className="text-indigo-600">📷</span> สแกนบาร์โค้ดสินค้า
          </h2>
          <form onSubmit={handleBarcodeSubmit} className="flex gap-4">
            <input
              ref={barcodeInputRef}
              type="text"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="กรอกหรือสแกนรหัสสินค้า"
              className="input-modern flex-1 text-lg"
            />
            <button type="submit" className="btn-primary-gradient px-8">
              ยืนยันการเพิ่มสินค้า
            </button>
          </form>
          {error && (
            <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          )}
          {success && (
            <div className="mt-4 bg-green-50 border-l-4 border-green-500 p-4 rounded">
              <p className="text-green-700 font-medium">{success}</p>
            </div>
          )}
        </div>

        {/* Shopping Cart */}
        <div className="card-modern">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            <span className="text-indigo-600">🛒</span> รายการสินค้า
            {cart.length > 0 && (
              <span className="ml-3 text-lg font-normal text-gray-600">
                ({cart.length} {cart.length === 1 ? "รายการ" : "รายการ"})
              </span>
            )}
          </h2>
          {cart.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🛒</div>
              <p className="text-gray-500 text-lg">ยังไม่มีรายการสินค้า</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table-modern">
                <thead>
                  <tr>
                    <th className="w-40 text-center">รหัสสินค้า</th>
                    <th className="text-center">ชื่อสินค้า</th>
                    <th className="w-40 text-center">ราคา</th>
                    <th className="w-40 text-center">จำนวน</th>
                    <th className="w-40 text-center">ราคารวม</th>
                    <th className="w-40 text-center"></th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item, index) => (
                    <tr key={index}>
                      <td className="font-mono text-sm text-center">
                        {item.product_id}
                      </td>
                      <td className="font-semibold text-center">
                        {item.product_name}
                      </td>
                      <td className="text-center">
                        {item.price.toFixed(2)} บาท
                      </td>
                      <td className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() =>
                              handleQuantityChange(index, item.quantity - 1)
                            }
                            className="w-8 h-8 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-bold rounded transition-colors duration-200"
                          >
                            −
                          </button>
                          <span className="w-12 text-center font-semibold text-lg">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleQuantityChange(index, item.quantity + 1)
                            }
                            className="w-8 h-8 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-bold rounded transition-colors duration-200"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="text-center font-bold text-green-600 text-lg">
                        {item.subtotal.toFixed(2)} บาท
                      </td>
                      <td className="text-center">
                        <button
                          onClick={() => handleRemoveItem(index)}
                          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-all duration-200"
                        >
                          ลบ
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Total and Checkout */}
        <div className="card-gradient gradient-success">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">ยอดรวม</h2>
              <p className="text-5xl font-bold">{total.toFixed(2)} บาท</p>
            </div>
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className={`px-10 py-4 text-xl font-bold rounded-xl transition-all duration-300 shadow-lg ${
                cart.length === 0
                  ? "bg-gray-400 cursor-not-allowed opacity-50"
                  : "bg-yellow-400 hover:bg-yellow-500 text-gray-900 hover:shadow-2xl hover:scale-105"
              }`}
            >
              ชำระเงิน
            </button>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50 p-4">
          <div className="modal-overlay"></div>
          <form
            onSubmit={handlePayment}
            className="modal-content max-w-lg w-full"
          >
            <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">
              💳 ชำระเงิน
            </h2>

            <div className="bg-indigo-50 p-6 rounded-xl mb-6">
              <p className="text-gray-600 mb-2">ยอดรวม</p>
              <p className="text-4xl font-bold text-indigo-600">
                {total.toFixed(2)} บาท
              </p>
            </div>

            <div className="mb-6">
              <label
                htmlFor="paidAmount"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                จำนวนเงินที่ชำระ <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="paidAmount"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                step="0.01"
                min={total}
                className="input-modern w-full text-2xl font-semibold"
                placeholder="0.00"
                required
                autoFocus
              />
            </div>

            {paidAmount && parseFloat(paidAmount) >= total && (
              <div className="mb-6 p-6 bg-green-50 border-2 border-green-200 rounded-xl">
                <p className="text-gray-600 mb-1">เงินทอน</p>
                <p className="text-3xl font-bold text-green-600">
                  ${(parseFloat(paidAmount) - total).toFixed(2)}
                </p>
              </div>
            )}

            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowPaymentModal(false);
                  setPaidAmount("");
                  setError("");
                }}
                className="flex-1 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
              >
                ยกเลิก
              </button>
              <button type="submit" className="flex-1 btn-success-gradient">
                ยืนยันการชำระเงิน
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Image Viewer Modal */}
      {viewingImage && (
        <div
          className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50 p-4"
          onClick={() => setViewingImage(null)}
        >
          <div className="modal-overlay"></div>
          <div className="relative z-50 max-w-4xl max-h-screen">
            <div className="bg-white rounded-2xl shadow-2xl p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800 text-center">
                  {viewingImage.name} : {viewingImage.member_id}
                </h3>
                <button
                  onClick={() => setViewingImage(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                  ✕
                </button>
              </div>
              <img
                src={viewingImage.src}
                alt={viewingImage.name}
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
