import db from "../../lib/db";

// Increase file upload size limit to 50MB (or adjust as needed)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "50mb", // Set the size limit (adjust as needed)
    },
  },
};

export default async function handler(req, res) {
  let connection;

  try {
    if (req.method === "POST") {
      connection = await db.getConnection();
      const { name, email, mobile, password } = req.body;

      try {
        // Insert user into the database
        const [result] = await connection.query(
          "INSERT INTO user (name, email, mobileno, password) VALUES (?, ?, ?, ?)",
          [name, email, mobile, password]
        );

        res.status(201).json({
          message: "User created successfully",
          userId: result.insertId,
        });
      } catch (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(400).json({ error: "Email already exists" });
        }
        res.status(500).json({ error: "Internal server error", details: err.message });
      } finally {
        if (connection) connection.release();
      }
    }

    // Handle GET request for fetching users
    else if (req.method === "GET") {
      try {
        connection = await db.getConnection();
        // Query to fetch users
        const [users] = await connection.query("SELECT id, name, email, mobileno FROM user");

        // Check if any users were found
        if (users.length === 0) {
          return res.status(404).json({ error: "No users found" });
        }
        // Set Cache-Control to prevent 304 status interference
        res.setHeader(
          "Cache-Control",
          "no-store, no-cache, must-revalidate, proxy-revalidate"
        );

        // Return the users
        res.status(200).json(users);
      } catch (err) {
        res.status(500).json({ error: "Internal server error", details: err.message });
      } finally {
        if (connection) connection.release();
      }
    }

    // Handle DELETE request for deleting a user
    else if (req.method === "DELETE") {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: "User ID is required" });
      }

      try {
        // Delete user from the database
        const [result] = await db.query("DELETE FROM user WHERE id = ?", [id]);

        if (result.affectedRows === 0) {
          return res.status(404).json({ error: "User not found" });
        }
        // Set Cache-Control to prevent 304 status interference
        res.setHeader(
          "Cache-Control",
          "no-store, no-cache, must-revalidate, proxy-revalidate"
        );
        res.status(200).json({ message: "User deleted successfully" });
      } catch (err) {
        res.status(500).json({ error: "Internal server error", details: err.message });
      }
    }

    // If the method is not POST, GET, or DELETE, return method not allowed
    else {
      return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (err) {
    res.status(500).json({ error: "Internal server error", details: err.message });
  } finally {
    if (connection) connection.release();
  }
}
