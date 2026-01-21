"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

export default function Members() {
  const [memberList, setMemberList] = useState([]);
  const [formData, setFormData] = useState({
    member_id: "",
    member_name: "",
    level: "1",
    avatar: "",
  });
  const [profileImage, setProfileImage] = useState(null);
  const [profilePreview, setProfilePreview] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewingImage, setViewingImage] = useState(null);
  const [gradeFilter, setGradeFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });

  // Fetch members from the server
  const fetchMembers = async () => {
    try {
      const response = await axios.get("/api/members");
      setMemberList(response.data);
    } catch (error) {
      console.error("Failed to fetch members: ", error);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleAdd = () => {
    setFormData({
      member_id: "",
      member_name: "",
      level: "1",
      avatar: "",
    });
    setProfileImage(null);
    setProfilePreview("");
    setShowAddForm(true);
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setFormData({
      member_id: member.member_id,
      member_name: member.member_name,
      level: member.level,
      avatar: member.avatar || "",
    });
    setProfilePreview(member.avatar || "");
    setProfileImage(null);
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

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Convert image to base64 for storage
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Add new member
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      let avatarData = formData.avatar;

      // If user uploaded a file, convert to base64
      if (profileImage) {
        avatarData = await convertToBase64(profileImage);
      }

      const memberData = {
        ...formData,
        avatar: avatarData,
      };

      await axios.post("/api/members", memberData);
      Swal.fire({
        icon: "success",
        title: "สำเร็จ!",
        text: "เพิ่มสมาชิกเรียบร้อยแล้ว!",
      });
      setFormData({
        member_id: "",
        member_name: "",
        level: "1",
        avatar: "",
      });
      setProfileImage(null);
      setProfilePreview("");
      setShowAddForm(false);
      fetchMembers();
    } catch (error) {
      console.error("Failed to add member: ", error);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด!",
        text: "ไม่สามารถเพิ่มสมาชิกได้ กรุณาลองใหม่อีกครั้ง",
      });
    }
  };

  // Update member
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      let avatarData = formData.avatar;

      // If user uploaded a new file, convert to base64
      if (profileImage) {
        avatarData = await convertToBase64(profileImage);
      }

      const memberData = {
        newMemberId: formData.member_id,
        newMemberName: formData.member_name,
        newLevel: formData.level,
        newAvatar: avatarData,
      };

      await axios.put(`/api/members/${editingMember._id}`, memberData);
      Swal.fire({
        icon: "success",
        title: "สำเร็จ!",
        text: "แก้ไขข้อมูลสมาชิกเรียบร้อยแล้ว!",
      });
      setShowEditForm(false);
      setEditingMember(null);
      setProfileImage(null);
      setProfilePreview("");
      fetchMembers();
    } catch (error) {
      console.error("Failed to update member: ", error);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด!",
        text: "ไม่สามารถแก้ไขข้อมูลสมาชิกได้ กรุณาลองใหม่อีกครั้ง",
      });
    }
  };

  // Delete member
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Delete Member?",
      text: "Are you sure you want to delete this member?",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
    });
    if (result.isConfirmed) {
      try {
        await axios.delete(`/api/members?id=${id}`);
        Swal.fire({
          icon: "success",
          title: "ลบเรียบร้อยแล้ว!",
          text: "ลบข้อมูลสมาชิกเรียบร้อยแล้ว",
        });
        fetchMembers();
      } catch (error) {
        console.error("Error deleting member:", error);
        Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด!",
          text: "ไม่สามารถลบข้อมูลสมาชิกได้ กรุณาลองใหม่อีกครั้ง",
        });
      }
    }
  };

  const getLevelBadgeColor = (level) => {
    const gradeNum = parseInt(level);
    if (gradeNum >= 7) return "bg-orange-100 text-orange-700"; // Teacher
    if (gradeNum >= 3) return "bg-purple-100 text-purple-700";
    if (gradeNum >= 1) return "bg-blue-100 text-blue-700";
    return "bg-green-100 text-green-700";
  };

  // Handle sorting
  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Filter and sort members
  const filteredMembers = React.useMemo(() => {
    let filtered = memberList.filter((member) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        member.member_id.toString().includes(searchLower) ||
        member.member_name.toLowerCase().includes(searchLower);

      const matchesGrade =
        gradeFilter === "all" || member.level === gradeFilter;

      return matchesSearch && matchesGrade;
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Handle numeric sorting for ID and Level
        if (sortConfig.key === "member_id" || sortConfig.key === "level") {
          aValue = parseInt(aValue);
          bValue = parseInt(bValue);
        } else if (typeof aValue === "string") {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
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
  }, [memberList, searchTerm, gradeFilter, sortConfig]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Page Header */}
      <div className="page-header max-w-7xl mx-auto">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">หน้าจัดการข้อมูลสมาชิก</h1>
            <p className="text-indigo-100">จัดการข้อมูลสมาชิก</p>
          </div>
          <button onClick={handleAdd} className="btn-primary-gradient">
            + เพิ่มสมาชิกใหม่
          </button>
        </div>
      </div>

      {/* Members Table */}
      <div className="max-w-7xl mx-auto">
        <div className="card-modern">
          <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
            <h2 className="text-2xl font-bold text-gray-800">
              <span className="text-indigo-600">👥</span> รายชื่อสมาชิก
              {memberList.length > 0 && (
                <span className="ml-3 text-lg font-normal text-gray-600">
                  ({filteredMembers.length} จาก {memberList.length})
                </span>
              )}
            </h2>

            <div className="flex gap-4 flex max-w-2xl justify-end">
              {/* Grade Filter */}
              <div className="w-36">
                <select
                  value={gradeFilter}
                  onChange={(e) => setGradeFilter(e.target.value)}
                  className="input-modern w-full"
                >
                  <option value="all">ทั้งหมด</option>
                  <option value="1">มัธยมศึกษาปีที่ 1</option>
                  <option value="2">มัธยมศึกษาปีที่ 2</option>
                  <option value="3">มัธยมศึกษาปีที่ 3</option>
                  <option value="4">มัธยมศึกษาปีที่ 4</option>
                  <option value="5">มัธยมศึกษาปีที่ 5</option>
                  <option value="6">มัธยมศึกษาปีที่ 6</option>
                  <option value="7">ครู/อาจารย์</option>
                </select>
              </div>

              {/* Search Filter */}
              <div className="flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="🔍 ค้นหาด้วยรหัสนักเรียนหรือชื่อ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-modern w-64"
                />
              </div>
            </div>
          </div>

          {filteredMembers.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">
                {searchTerm || gradeFilter !== "all" ? "🔍" : "👥"}
              </div>
              <p className="text-gray-500 text-lg">
                {searchTerm || gradeFilter !== "all"
                  ? `No members found matching your filters`
                  : "No members found. Add your first member!"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table-modern">
                <thead>
                  <tr>
                    <th
                      className="w-40 cursor-pointer hover:bg-opacity-90 transition-colors select-none"
                      onClick={() => requestSort("member_id")}
                    >
                      <div className="flex items-center justify-center gap-2">
                        รหัสนักเรียน
                        {sortConfig.key === "member_id" && (
                          <span>
                            {sortConfig.direction === "ascending" ? "▲" : "▼"}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="w-40">รูปประจำตัว</th>
                    <th
                      className="cursor-pointer hover:bg-opacity-90 transition-colors select-none"
                      onClick={() => requestSort("member_name")}
                    >
                      <div className="flex justify-center">
                        ชื่อ-นามสกุล
                        {sortConfig.key === "member_name" && (
                          <span>
                            {sortConfig.direction === "ascending" ? "▲" : "▼"}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      className="w-48 text-center cursor-pointer hover:bg-opacity-90 transition-colors select-none"
                      onClick={() => requestSort("level")}
                    >
                      <div className="flex items-center justify-center gap-2">
                        ระดับชั้น
                        {sortConfig.key === "level" && (
                          <span>
                            {sortConfig.direction === "ascending" ? "▲" : "▼"}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="w-48 text-center"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((member) => (
                    <tr key={member._id}>
                      <td className="font-mono text-sm text-center">
                        {member.member_id}
                      </td>
                      <td className="flex justify-center">
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
                            className="w-12 h-12 rounded-full object-cover border-2 border-indigo-200 cursor-pointer hover:border-indigo-400 transition-all duration-200"
                            title="Click to view full size"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center border-2 border-indigo-200">
                            <span className="text-indigo-600 font-semibold text-lg">
                              {member.member_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="font-semibold text-center">
                        {member.member_name}
                      </td>
                      <td className="text-center text-sm w-48">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${getLevelBadgeColor(member.level)}`}
                        >
                          {member.level === "7"
                            ? "ครู/อาจารย์"
                            : `มัธยมศึกษาปีที่ ${member.level}`}
                        </span>
                      </td>
                      <td className="text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleEdit(member)}
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-all duration-200"
                          >
                            แก้ไข
                          </button>
                          <button
                            onClick={() => handleDelete(member._id)}
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

      {/* Add Member Modal */}
      {showAddForm && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div
            className="modal-overlay"
            onClick={() => setShowAddForm(false)}
          ></div>
          <form
            onSubmit={handleAddSubmit}
            className="modal-content max-w-lg w-full my-8"
          >
            <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">
              👥 เพิ่มสมาชิกใหม่
            </h2>

            <div className="space-y-5">
              <div>
                <label
                  htmlFor="member_id"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  รหัสสมาชิก <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="member_id"
                  name="member_id"
                  value={formData.member_id}
                  onChange={handleChange}
                  className="input-modern w-full"
                  placeholder="กรุณากรอกรหัสสมาชิก"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="member_name"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  ชื่อ-นามสกุล <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="member_name"
                  name="member_name"
                  value={formData.member_name}
                  onChange={handleChange}
                  className="input-modern w-full"
                  placeholder="กรุณากรอกชื่อ-นามสกุล"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="level"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  ระดับชั้น
                </label>
                <select
                  id="level"
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  className="input-modern w-full"
                >
                  <option value="1">มัธยมศึกษาปีที่ 1</option>
                  <option value="2">มัธยมศึกษาปีที่ 2</option>
                  <option value="3">มัธยมศึกษาปีที่ 3</option>
                  <option value="4">มัธยมศึกษาปีที่ 4</option>
                  <option value="5">มัธยมศึกษาปีที่ 5</option>
                  <option value="6">มัธยมศึกษาปีที่ 6</option>
                  <option value="7">ครู/อาจารย์</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="profile"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  รูปภาพประจำตัว{" "}
                  <span className="text-gray-400">(ไม่บังคับ)</span>
                </label>
                <input
                  type="file"
                  id="profile"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="input-modern w-full"
                />
                {profilePreview && (
                  <div className="mt-3">
                    <img
                      src={profilePreview}
                      alt="Preview"
                      className="w-24 h-24 rounded-full object-cover border-2 border-indigo-300"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setProfileImage(null);
                  setProfilePreview("");
                }}
                className="flex-1 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
              >
                ยกเลิก
              </button>
              <button type="submit" className="flex-1 btn-success-gradient">
                เพิ่มสมาชิก
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Member Modal */}
      {showEditForm && editingMember && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div
            className="modal-overlay"
            onClick={() => setShowEditForm(false)}
          ></div>
          <form
            onSubmit={handleEditSubmit}
            className="modal-content max-w-lg w-full my-8"
          >
            <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">
              ✏️ แก้ไขข้อมูลสมาชิก
            </h2>

            <div className="space-y-5">
              <div>
                <label
                  htmlFor="edit_member_id"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  รหัสนสมาชชิก <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="edit_member_id"
                  name="member_id"
                  value={formData.member_id}
                  onChange={handleChange}
                  className="input-modern w-full"
                  placeholder="กรุณากรอกรหัสสมาชิก"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="edit_member_name"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  ชื่อ-นามสกุล <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="edit_member_name"
                  name="member_name"
                  value={formData.member_name}
                  onChange={handleChange}
                  className="input-modern w-full"
                  placeholder="กรุณากรอกชื่อ-นามสกุล"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="edit_level"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  ระดับชั้น
                </label>
                <select
                  id="edit_level"
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  className="input-modern w-full"
                >
                  <option value="1">มัธยมศึกษาปีที่ 1</option>
                  <option value="2">มัธยมศึกษาปีที่ 2</option>
                  <option value="3">มัธยมศึกษาปีที่ 3</option>
                  <option value="4">มัธยมศึกษาปีที่ 4</option>
                  <option value="5">มัธยมศึกษาปีที่ 5</option>
                  <option value="6">มัธยมศึกษาปีที่ 6</option>
                  <option value="7">ครู/อาจารย์</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="edit_profile"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  รูปภาพประจำตัว{" "}
                  <span className="text-gray-400">(ไม่บังคับ)</span>
                </label>
                <input
                  type="file"
                  id="edit_profile"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="input-modern w-full"
                />
                {profilePreview && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-2">
                      รูปภาพปัจจุบัน/รูปภาพใหม่:
                    </p>
                    <img
                      src={profilePreview}
                      alt="Preview"
                      className="w-24 h-24 rounded-full object-cover border-2 border-indigo-300"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                type="button"
                onClick={() => {
                  setShowEditForm(false);
                  setEditingMember(null);
                  setProfileImage(null);
                  setProfilePreview("");
                }}
                className="flex-1 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
              >
                ยกเลิก
              </button>
              <button type="submit" className="flex-1 btn-success-gradient">
                อัปเดตข้อมูลสมาชิก
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
                <h3 className="text-xl font-bold text-gray-800">
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
