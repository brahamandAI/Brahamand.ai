import jwt from "jsonwebtoken";
import db from "../../lib/db";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { email, password } = req.body;
  let connection;
  try {
    connection = await db.getConnection();
    const [users] = await connection.query("SELECT * FROM user WHERE email = ?", [email]);

    if (users.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = users[0];

    // Direct string comparison (For production, use bcrypt to hash passwords)
    if (password !== user.password) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate JWT token (Set longer expiration)
    const token = jwt.sign({ id: user.id, email: user.email }, "aeoiefjeio@3540IFOFHREIO", {
      expiresIn: "30d", // Token valid for 30 days
    });

    res.status(200).json({ message: "Login successful", token, userId: user.id });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Internal server error", details: err.message });
  } finally {
    if (connection) connection.release();
  }
}
