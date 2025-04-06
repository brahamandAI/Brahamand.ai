import db from "../lib/db";

export async function saveTokenToDatabase(token, userId) {
    let connection;

        connection = await db.getConnection();
  try {
    const query = "UPDATE user SET isPayment = ? WHERE id = ?";
    const values = [token, userId]; // Assuming paymentId is the userId
    console.log(token)
    await connection.query(query, values);
    console.log("Token saved to database");
  } finally {
   if (connection) connection.release();
  }
}
