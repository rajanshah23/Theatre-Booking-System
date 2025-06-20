# 🎭 Theatre Booking System - Backend

This is the backend of the Theatre Booking System built with **Node.js**, **Express**, **Sequelize (with PostgreSQL via Supabase)**. It handles core functionalities like user authentication, show scheduling, seat booking, payments, reviews, and admin operations.

---

## 🖼️ Frontend Screens (for context)

| Home Page | Browse Shows |
|-----------|--------------|
| ![Home](https://raw.githubusercontent.com/rajanshah23/frontend-Theatre-booking-system/main/src/screenshots/Home.png) | ![Browse Show](https://raw.githubusercontent.com/rajanshah23/frontend-Theatre-booking-system/main/src/screenshots/BrowseShow.png) |

| My Booking | Admin Dashboard |
|------------|------------------|
| ![My Booking](https://raw.githubusercontent.com/rajanshah23/frontend-Theatre-booking-system/main/src/screenshots/MyBooking.png) | ![Admin Dashboard](https://raw.githubusercontent.com/rajanshah23/frontend-Theatre-booking-system/main/src/screenshots/AdminDashboaard.png) |


## 📦 Features

- ✅ JWT-based authentication (Register/Login)
- 👤 Role-based access control (Admin, User)
- 🎫 Show management with scheduling and availability
- 🪑 Seat selection with status (booked, reserved, available)
- 💳 Khalti payment gateway integration
- 📃 Booking creation, confirmation, cancellation
- 📝 Review and rating system
- 🧑‍💼 Admin dashboard endpoints for managing users, bookings, shows
- 📤 Nodemailer email integration (optional feature)
- 📂 Image upload using Supabase Storage

---

## 🛠 Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: Supabase PostgreSQL
- **ORM**: Sequelize with `sequelize-typescript`
- **Authentication**: JWT, Bcrypt
- **Payment**: Khalti API
- **Email**: Nodemailer
- **File Upload**: Supabase Storage
---

## ⚙️ Setup Instructions

```bash
# Clone the repository
git clone https://github.com/rajanshah23/Theatre-booking-system
cd backend Theatre-booking-system

# Install dependencies
npm install

# Create a .env file with the required variables
cp .env.example .env
# then update your .env with Supabase keys, JWT secret, Khalti keys, etc.

# Run database migrations/seeding if needed
# npx sequelize-cli db:migrate
# npx sequelize-cli db:seed:all

# Start the server
npm run dev
