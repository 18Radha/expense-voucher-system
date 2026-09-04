const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const voucherRoutes = require("./routes/voucherRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.put("/test-submit", (req, res) => {
    res.json({
        message: "PUT route is working"
    });
});

app.use("/api/vouchers", voucherRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "Expense Voucher API is running"
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});