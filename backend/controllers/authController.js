const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

// Register a new user
const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Check if all fields are provided
        if (!name || !email || !password || !role) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        // Check if email already exists
        db.query(
            "SELECT id FROM users WHERE email = ?",
            [email],
            async (err, results) => {
                if (err) {
                    return res.status(500).json({
                        message: "Database error"
                    });
                }

                if (results.length > 0) {
                    return res.status(400).json({
                        message: "Email already registered"
                    });
                }

                // Hash password
                const hashedPassword = await bcrypt.hash(password, 10);

                // Insert user
                db.query(
                    `INSERT INTO users 
                    (name, email, password, role) 
                    VALUES (?, ?, ?, ?)`,
                    [name, email, hashedPassword, role],
                    (err, result) => {
                        if (err) {
                            return res.status(500).json({
                                message: "Failed to create user"
                            });
                        }

                        res.status(201).json({
                            message: "User registered successfully",
                            userId: result.insertId
                        });
                    }
                );
            }
        );

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// Login user
const login = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "Email and password are required"
        });
    }

    db.query(
        "SELECT * FROM users WHERE email = ?",
        [email],
        async (err, results) => {

            if (err) {
                return res.status(500).json({
                    message: "Database error"
                });
            }

            if (results.length === 0) {
                return res.status(401).json({
                    message: "Invalid email or password"
                });
            }

            const user = results[0];

            // Compare entered password with hashed password
            const passwordMatch = await bcrypt.compare(
                password,
                user.password
            );

            if (!passwordMatch) {
                return res.status(401).json({
                    message: "Invalid email or password"
                });
            }

            // Create JWT
            const token = jwt.sign(
                {
                    id: user.id,
                    role: user.role
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "1h"
                }
            );

            res.json({
                message: "Login successful",
                token: token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        }
    );
};


module.exports = {
    register,
    login
};