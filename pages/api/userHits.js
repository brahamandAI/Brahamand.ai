import db from "../../lib/db";

// ✅ API to Get & Update User Hits
export default async function handler(req, res) {
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Method Not Allowed" });
    }
    const { userId } = req.body;
    if (!userId) {
        return res.status(400).json({ success: false, message: "User ID is required" });
      }    
  
   
    let connection;
    try {
        const [user] = await db.query("SELECT hits FROM user_hits WHERE user_id = ?", [userId]);
    
        let hits = user.length ? user[0].hits : 0;
    
        if (hits >= 5) {
          return res.json({ success: false, message: "Limit reached, please upgrade", hits });
        }
    
        // ✅ Increment the hit count
        if (user.length) {
          await db.query("UPDATE user_hits SET hits = hits + 1 WHERE user_id = ?", [userId]);
          hits++;
        } else {
          await db.query("INSERT INTO user_hits (user_id, hits) VALUES (?, 1)", [userId]);
          hits = 1;
        }
    
        res.json({ success: true, message: "Message sent successfully", hits });
      } catch (error) {
        console.error("Database Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
      }
     finally {
      if (connection) connection.release();
    }
  }