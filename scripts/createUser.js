const mongoose = require("mongoose");

// User Schema
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "staff"],
      default: "staff",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

// MongoDB Connection
const connectDB = async () => {
  try {
    // Change this to your MongoDB connection string
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

// Create User Function
async function createUser(username, password, role = "staff") {
  try {
    await connectDB();

    const user = await User.create({
      username,
      password,
      role,
      isActive: true,
    });

    console.log("✅ User created successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`Username: ${user.username}`);
    console.log(`Password: ${password}`);
    console.log(`Role: ${user.role}`);
    console.log(`Active: ${user.isActive}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    process.exit(0);
  } catch (error) {
    if (error.code === 11000) {
      console.error("❌ Error: Username already exists!");
    } else {
      console.error("❌ Error creating user:", error.message);
    }
    process.exit(1);
  }
}

// Get command line arguments
const args = process.argv.slice(2);

if (args.length < 2) {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(
    "📝 Usage: node scripts/createUser.js <username> <password> [role]",
  );
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("\nExamples:");
  console.log("  node scripts/createUser.js admin admin123 admin");
  console.log("  node scripts/createUser.js staff staff123 staff");
  console.log("  node scripts/createUser.js user1 password123");
  console.log("\nRoles: admin, staff (default: staff)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  process.exit(1);
}

const [username, password, role] = args;

// Validate role
if (role && !["admin", "staff"].includes(role)) {
  console.error("❌ Error: Role must be 'admin' or 'staff'");
  process.exit(1);
}

// Create the user
createUser(username, password, role);
