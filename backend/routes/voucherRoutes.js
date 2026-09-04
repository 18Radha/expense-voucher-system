const express = require("express");

const {
    createVoucher,
    getVouchers,
    submitVoucher,
    approveVoucher,
    rejectVoucher,
    markVoucherPaid
} = require("../controllers/voucherController");

const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();


// Create voucher
router.post(
    "/",
    authenticateToken,
    createVoucher
);


// Get vouchers
router.get(
    "/",
    authenticateToken,
    getVouchers
);


// Submit voucher
router.put(
    "/:id/submit",
    authenticateToken,
    submitVoucher
);


// Approve voucher
router.put(
    "/:id/approve",
    authenticateToken,
    approveVoucher
);


// Reject voucher
router.put(
    "/:id/reject",
    authenticateToken,
    rejectVoucher
);

router.put(
    "/:id/pay",
    authenticateToken,
    markVoucherPaid
);
module.exports = router;