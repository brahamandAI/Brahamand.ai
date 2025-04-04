const jwt = require("jsonwebtoken");

export default function handler(req, res) {
    if (req.method === "GET") {
        const { token } = req.query;

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            res.status(200).json({ valid: true, decoded });
        } catch (error) {
            res.status(401).json({ valid: false, error: "Invalid or expired token" });
        }
    } else {
        res.status(405).json({ error: "Method not allowed" });
    }
}
