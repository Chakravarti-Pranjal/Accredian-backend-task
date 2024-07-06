require('dotenv').config()
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');
const cors = require('cors');

const prisma = new PrismaClient();
const app = express();
app.use(express.json());
app.use(cors());

// Save referral data
app.post('/referral', async (req, res) => {
    const { name, email, referredBy } = req.body;

    // Validation
    if (!name || !email || !referredBy) {
        return res.status(400).json({ error: "All fields are required." });
    }

    try {
        const referral = await prisma.referral.create({
            data: {
                name,
                email,
                referredBy
            }
        });

        // Send email notification
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: 'your-email@gmail.com',
            to: email,
            subject: 'Referral Confirmation',
            text: `Hi ${name},\n\nYou have been referred by ${referredBy}.\n\nThank you!`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return res.status(500).json({ error: "Error sending email." });
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        res.status(201).json(referral);
    } catch (error) {
        res.status(500).json({ error: "Internal server error." });
    }
});

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
