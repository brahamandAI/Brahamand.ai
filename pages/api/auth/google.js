import axios from "axios";
import { serialize } from "cookie";
import { hash } from "bcryptjs"; // Hash password before saving
import mysql from "../../../lib/db"; // Import your MySQL connection file

export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: "Authorization code is missing" });
  }

  try {
    // Step 1: Exchange auth code for access token
    const { data } = await axios.post(
      "https://oauth2.googleapis.com/token",
      new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        client_secret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google`,
        grant_type: "authorization_code",
        code,
      })
    );

    // Step 2: Fetch user details from Google
    const userInfo = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${data.access_token}`
    );

    const { email, name, picture } = userInfo.data;

    // Step 3: Check if user already exists in MySQL database
    const connection = await mysql.getConnection();
    const [existingUser] = await connection.query(
      "SELECT * FROM user WHERE email = ?",
      [email]
    );

    let userId;
    if (existingUser.length === 0) {
      // Step 4: If user does not exist, create a new user with a random password
      const hashedPassword = await hash(
        Math.random().toString(36).slice(-8),
        10
      );

      const [insertResult] = await connection.query(
        "INSERT INTO user (name, email,  password) VALUES (?, ?, ?)",
        [name, email, hashedPassword]
      );

      userId = insertResult.insertId;
    } else {
      userId = existingUser[0].id;
    }

    connection.release();
    // Step 5: Set auth cookie and Redirect
    res.setHeader(
      "Set-Cookie",
      serialize("token", data.access_token, { path: "/", httpOnly: true })
    );

    // Redirect user after successful login
    res.writeHead(302, { Location: "/" }); // Redirect to dashboard
    res.end();
  } catch (error) {
    console.error("Google OAuth Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Authentication failed" });
  }
}
