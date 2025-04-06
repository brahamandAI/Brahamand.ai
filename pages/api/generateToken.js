import jwt from "jsonwebtoken";
import { saveTokenToDatabase } from "../../utils/database"; // Import the saveTokenToDatabase function

export default function handler(req, res) {
  if (req.method === "POST") {
    const { paymentId, orderId } = req.body;
    const { userId } = req.query;

    // Generate a token
    const token = jwt.sign(
      { paymentId, orderId },
      process.env.JWT_SECRET, // Store JWT_SECRET in .env.local
      { expiresIn: "1h" }
    );

    // Save the token to the database
    saveTokenToDatabase(token, userId);

    res.status(200).json({ token });
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}
