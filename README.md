# Expense Voucher Management System

A full-stack web application for managing employee expense vouchers through a simple approval workflow.

## Features

- Employee login and authentication
- Create expense vouchers
- Submit vouchers for approval
- Director approval/rejection
- Accounts payment processing
- Voucher status tracking
- Role-based access
- Expense dashboard
- Responsive user interface

## Roles

### Employee
- Create expense vouchers
- View own vouchers
- Submit draft vouchers

### Director
- View submitted vouchers
- Approve vouchers
- Reject vouchers with a reason

### Accounts
- View approved vouchers
- Mark vouchers as paid

## Technology Stack

### Frontend
- React
- JavaScript
- CSS
- Vite

### Backend
- Node.js
- Express.js
- MySQL
- JWT Authentication

## Voucher Workflow

DRAFT → SUBMITTED → APPROVED → PAID

A voucher can also be rejected by the Director.

## Project Structure

```text
expense-voucher-system/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   └── server.js
│
├── frontend/
│   ├── public/
│   └── src/
│
└── .gitignore
