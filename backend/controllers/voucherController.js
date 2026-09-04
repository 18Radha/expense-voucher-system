const db = require("../config/db");


// CREATE VOUCHER
const createVoucher = (req, res) => {

    const {
        voucher_number,
        voucher_date,
        expense_date,
        department,
        expense_title,
        expense_category,
        expense_description,
        amount
    } = req.body;

    const employee_id = req.user.id;

    if (
        !voucher_number ||
        !voucher_date ||
        !expense_date ||
        !department ||
        !expense_title ||
        !amount
    ) {
        return res.status(400).json({
            message: "Please provide all required fields"
        });
    }

    const sql = `
        INSERT INTO vouchers
        (
            voucher_number,
            voucher_date,
            expense_date,
            department,
            expense_title,
            expense_category,
            expense_description,
            amount,
            employee_id,
            status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'DRAFT')
    `;

    const values = [
        voucher_number,
        voucher_date,
        expense_date,
        department,
        expense_title,
        expense_category || null,
        expense_description || null,
        amount,
        employee_id
    ];

    db.query(sql, values, (err, result) => {

        if (err) {
            console.error(err);

            return res.status(500).json({
                message: "Failed to create voucher",
                error: err.message
            });
        }

        res.status(201).json({
            message: "Expense voucher created successfully",
            voucherId: result.insertId
        });
    });
};


// GET VOUCHERS
const getVouchers = (req, res) => {

    const sql = `
        SELECT
            v.id,
            v.voucher_number,
            v.voucher_date,
            v.expense_date,
            v.department,
            v.expense_title,
            v.expense_category,
            v.expense_description,
            v.amount,
            v.employee_id,
            v.status,
            v.approval_date,
            v.rejection_reason,
            v.created_at,
            u.name AS employee_name,
            u.email AS employee_email
        FROM vouchers v
        JOIN users u
            ON v.employee_id = u.id
        ORDER BY v.created_at DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.error(err);

            return res.status(500).json({
                message: "Failed to fetch vouchers",
                error: err.message
            });
        }

        res.json(results);
    });
};


// SUBMIT VOUCHER
const submitVoucher = (req, res) => {

    const voucherId = req.params.id;
    const employeeId = req.user.id;

    const checkSql = `
        SELECT id, status
        FROM vouchers
        WHERE id = ? AND employee_id = ?
    `;

    db.query(
        checkSql,
        [voucherId, employeeId],
        (err, results) => {

            if (err) {
                console.error(err);

                return res.status(500).json({
                    message: "Failed to check voucher",
                    error: err.message
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    message: "Voucher not found"
                });
            }

            if (results[0].status !== "DRAFT") {
                return res.status(400).json({
                    message: "Only DRAFT vouchers can be submitted"
                });
            }

            const updateSql = `
                UPDATE vouchers
                SET status = 'SUBMITTED'
                WHERE id = ? AND employee_id = ?
            `;

            db.query(
                updateSql,
                [voucherId, employeeId],
                (updateErr) => {

                    if (updateErr) {
                        console.error(updateErr);

                        return res.status(500).json({
                            message: "Failed to submit voucher",
                            error: updateErr.message
                        });
                    }

                    res.json({
                        message: "Voucher submitted successfully"
                    });
                }
            );
        }
    );
};


// APPROVE VOUCHER
const approveVoucher = (req, res) => {

    const voucherId = req.params.id;

    // Only director can approve
    if (req.user.role !== "director") {
        return res.status(403).json({
            message: "Only directors can approve vouchers"
        });
    }

    const checkSql = `
        SELECT id, status
        FROM vouchers
        WHERE id = ?
    `;

    db.query(checkSql, [voucherId], (err, results) => {

        if (err) {
            console.error(err);

            return res.status(500).json({
                message: "Failed to check voucher",
                error: err.message
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "Voucher not found"
            });
        }

        if (results[0].status !== "SUBMITTED") {
            return res.status(400).json({
                message: "Only SUBMITTED vouchers can be approved"
            });
        }

        const updateSql = `
            UPDATE vouchers
            SET
                status = 'APPROVED',
                approval_date = NOW()
            WHERE id = ?
        `;

        db.query(updateSql, [voucherId], (updateErr) => {

            if (updateErr) {
                console.error(updateErr);

                return res.status(500).json({
                    message: "Failed to approve voucher",
                    error: updateErr.message
                });
            }

            res.json({
                message: "Voucher approved successfully"
            });
        });
    });
};


// REJECT VOUCHER
const rejectVoucher = (req, res) => {

    const voucherId = req.params.id;
    const { rejection_reason } = req.body;

    // Only director can reject
    if (req.user.role !== "director") {
        return res.status(403).json({
            message: "Only directors can reject vouchers"
        });
    }

    if (!rejection_reason) {
        return res.status(400).json({
            message: "Rejection reason is required"
        });
    }

    const checkSql = `
        SELECT id, status
        FROM vouchers
        WHERE id = ?
    `;

    db.query(checkSql, [voucherId], (err, results) => {

        if (err) {
            console.error(err);

            return res.status(500).json({
                message: "Failed to check voucher",
                error: err.message
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "Voucher not found"
            });
        }

        if (results[0].status !== "SUBMITTED") {
            return res.status(400).json({
                message: "Only SUBMITTED vouchers can be rejected"
            });
        }

        const updateSql = `
            UPDATE vouchers
            SET
                status = 'REJECTED',
                rejection_reason = ?
            WHERE id = ?
        `;

        db.query(
            updateSql,
            [rejection_reason, voucherId],
            (updateErr) => {

                if (updateErr) {
                    console.error(updateErr);

                    return res.status(500).json({
                        message: "Failed to reject voucher",
                        error: updateErr.message
                    });
                }

                res.json({
                    message: "Voucher rejected successfully"
                });
            }
        );
    });
};
// MARK VOUCHER AS PAID
const markVoucherPaid = (req, res) => {

    if (req.user.role !== "accounts") {
        return res.status(403).json({
            message: "Only accounts users can mark vouchers as paid"
        });
    }

    const voucherId = req.params.id;

    const checkSql = `
        SELECT id, status
        FROM vouchers
        WHERE id = ?
    `;

    db.query(checkSql, [voucherId], (err, results) => {

        if (err) {
            console.error(err);
            return res.status(500).json({
                message: "Failed to check voucher",
                error: err.message
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "Voucher not found"
            });
        }

        if (results[0].status !== "APPROVED") {
            return res.status(400).json({
                message: "Only APPROVED vouchers can be marked as paid"
            });
        }

        const updateSql = `
            UPDATE vouchers
            SET status = 'PAID'
            WHERE id = ?
        `;

        db.query(updateSql, [voucherId], (updateErr) => {

            if (updateErr) {
                console.error(updateErr);

                return res.status(500).json({
                    message: "Failed to mark voucher as paid",
                    error: updateErr.message
                });
            }

            res.json({
                message: "Voucher marked as paid successfully"
            });
        });
    });
};

module.exports = {
    createVoucher,
    getVouchers,
    submitVoucher,
    approveVoucher,
    rejectVoucher,
    markVoucherPaid
};