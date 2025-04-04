const Razorpay = require("razorpay");

export default async function handler(req, res) {
    if (req.method === "POST") {
        const { amount, currency } = req.body;

        try {
            const razorpay = new Razorpay({
                key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                key_secret: process.env.NEXT_PUBLIC_RAZORPAY_KEY_SECRET,
            });

            const options = {
                amount: amount * 100, // Amount in paise (multiply by 100 for INR)
                currency: currency || "INR",
                receipt: `receipt_${Date.now()}`,
            };

            const order = await razorpay.orders.create(options);
            res.status(200).json(order);
            console.log(order);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Failed to create order" });
        }
    } else {
        res.status(405).json({ error: "Method not allowed" });
    }
}
