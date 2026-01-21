# การเพิ่มผู้ใช้งานในฐานข้อมูล (Manual User Creation)

## วิธีที่ 1: ใช้ MongoDB Compass (แนะนำ)

### ขั้นตอน:

1. **เปิด MongoDB Compass**
   - เชื่อมต่อกับ MongoDB ของคุณ
   - URL: `mongodb://localhost:27017` (หรือ URL ของคุณ)

2. **เลือก Database และ Collection**
   - Database: `css` (หรือชื่อที่คุณตั้งไว้)
   - Collection: `users`
   - ถ้ายังไม่มี collection `users` ให้สร้างใหม่

3. **เพิ่มข้อมูลผู้ใช้**
   - คลิกปุ่ม "ADD DATA" → "Insert Document"
   - วางโค้ด JSON นี้:

```json
{
  "username": "admin",
  "password": "admin123",
  "role": "admin",
  "isActive": true,
  "createdAt": { "$date": "2026-01-21T00:00:00.000Z" },
  "updatedAt": { "$date": "2026-01-21T00:00:00.000Z" }
}
```

4. **คลิก "Insert"**

---

## วิธีที่ 2: ใช้ MongoDB Shell

### ขั้นตอน:

1. **เปิด Terminal/Command Prompt**

2. **เชื่อมต่อกับ MongoDB**

```bash
mongosh
```

3. **เลือก Database**

```javascript
use css
```

4. **เพิ่มผู้ใช้**

```javascript
db.users.insertOne({
  username: "admin",
  password: "admin123",
  role: "admin",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
});
```

---

## วิธีที่ 3: ใช้ Node.js Script

### สร้างไฟล์ `scripts/createUser.js`:

```javascript
const mongoose = require("mongoose");
const User = require("../models/User");

// เชื่อมต่อ MongoDB
mongoose.connect("mongodb://localhost:27017/css", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function createUser() {
  try {
    const user = await User.create({
      username: "admin",
      password: "admin123",
      role: "admin",
      isActive: true,
    });

    console.log("✅ User created successfully:", user);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating user:", error);
    process.exit(1);
  }
}

createUser();
```

### รันคำสั่ง:

```bash
node scripts/createUser.js
```

---

## ตัวอย่างผู้ใช้ที่แนะนำ

### 1. Admin User

```json
{
  "username": "admin",
  "password": "admin123",
  "role": "admin",
  "isActive": true
}
```

### 2. Staff User

```json
{
  "username": "staff",
  "password": "staff123",
  "role": "staff",
  "isActive": true
}
```

### 3. Multiple Users (ใช้กับ insertMany)

```javascript
db.users.insertMany([
  {
    username: "admin",
    password: "admin123",
    role: "admin",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    username: "staff1",
    password: "staff123",
    role: "staff",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    username: "staff2",
    password: "staff456",
    role: "staff",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]);
```

---

## โครงสร้างข้อมูล User

| Field       | Type    | Required | Description                 |
| ----------- | ------- | -------- | --------------------------- |
| `username`  | String  | ✅       | ชื่อผู้ใช้ (ต้องไม่ซ้ำ)     |
| `password`  | String  | ✅       | รหัสผ่าน (แบบ plain text)   |
| `role`      | String  | ✅       | บทบาท: "admin" หรือ "staff" |
| `isActive`  | Boolean | ✅       | สถานะการใช้งาน (true/false) |
| `createdAt` | Date    | Auto     | วันที่สร้าง                 |
| `updatedAt` | Date    | Auto     | วันที่แก้ไขล่าสุด           |

---

## การตรวจสอบผู้ใช้ในฐานข้อมูล

### ดูผู้ใช้ทั้งหมด:

```javascript
db.users.find().pretty();
```

### ค้นหาผู้ใช้เฉพาะ:

```javascript
db.users.findOne({ username: "admin" });
```

### นับจำนวนผู้ใช้:

```javascript
db.users.countDocuments();
```

---

## การแก้ไขข้อมูลผู้ใช้

### เปลี่ยนรหัสผ่าน:

```javascript
db.users.updateOne(
  { username: "admin" },
  { $set: { password: "newpassword123" } },
);
```

### เปลี่ยนบทบาท:

```javascript
db.users.updateOne({ username: "staff1" }, { $set: { role: "admin" } });
```

### ระงับการใช้งาน:

```javascript
db.users.updateOne({ username: "staff1" }, { $set: { isActive: false } });
```

---

## การลบผู้ใช้

### ลบผู้ใช้เฉพาะ:

```javascript
db.users.deleteOne({ username: "staff1" });
```

### ลบผู้ใช้ทั้งหมด (ระวัง!):

```javascript
db.users.deleteMany({});
```

---

## หมายเหตุสำคัญ

⚠️ **ความปลอดภัย:**

- รหัสผ่านถูกเก็บแบบ plain text (ไม่เข้ารหัส)
- เหมาะสำหรับระบบภายในเท่านั้น
- ควรเปลี่ยนรหัสผ่านหลังจากเข้าสู่ระบบครั้งแรก

🔐 **การปรับปรุงในอนาคต:**

- ใช้ bcrypt สำหรับเข้ารหัสรหัสผ่าน
- เพิ่ม JWT สำหรับ session management
- เพิ่มระบบ forgot password

📝 **การใช้งาน:**

- URL เข้าสู่ระบบ: `http://localhost:3000/login`
- หลังจาก login สำเร็จจะไปที่หน้า Member Login

---

## ตัวอย่างการใช้งาน

1. เพิ่มผู้ใช้ admin ในฐานข้อมูล
2. เปิดเว็บไซต์ไปที่ `/login`
3. กรอก username: `admin`
4. กรอก password: `admin123`
5. คลิก "เข้าสู่ระบบ"
6. ระบบจะพาไปหน้า Member Login

---

## Troubleshooting

### ปัญหา: "ไม่พบชื่อผู้ใช้นี้ในระบบ"

- ตรวจสอบว่าได้เพิ่มผู้ใช้ในฐานข้อมูลแล้ว
- ตรวจสอบชื่อ collection ว่าเป็น `users`
- ตรวจสอบการเชื่อมต่อ MongoDB

### ปัญหา: "รหัสผ่านไม่ถูกต้อง"

- ตรวจสอบว่ารหัสผ่านตรงกับที่บันทึกในฐานข้อมูล
- ระวังตัวพิมพ์ใหญ่-เล็ก

### ปัญหา: "บัญชีนี้ถูกระงับการใช้งาน"

- ตั้งค่า `isActive: true` ในฐานข้อมูล
