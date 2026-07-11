# GearUp - Sports & Outdoor Equipment Rental API

Welcome to the backend API for **GearUp**, a comprehensive platform designed for renting sports and outdoor equipment. 

GearUp connects **Customers** who want to rent gear for their next adventure with **Providers** who list their available inventory. It features a complete rental flow, from browsing items to placing orders, processing payments, and managing stock, all overseen by platform **Admins**.

---

## 🚀 Key Features

* **Role-Based Access Control (RBAC):** Distinct roles and permissions for `CUSTOMER`, `PROVIDER`, and `ADMIN`.
* **Complete Rental Lifecycle:** Customers can browse, book, and track their rental orders.
* **Provider Inventory Management:** Gear providers can seamlessly add, edit, and manage their equipment inventory and stock.
* **Payment Integration:** Secure checkout session creation and webhook confirmation using **Stripe**.
* **Authentication & Authorization:** Secure user authentication using JSON Web Tokens (JWT) and HttpOnly cookies.
* **Search & Filtering:** Powerful API endpoints to search gear by category, brand, price range, and availability.
* **Review System:** Customers can leave ratings and reviews for gear they have successfully rented and returned.

---

## 🛠️ Technology Stack

* **Runtime Environment:** Node.js
* **Framework:** Express.js
* **Language:** TypeScript
* **Database:** PostgreSQL
* **ORM:** Prisma
* **Validation:** Zod
* **Authentication:** JWT (JSON Web Tokens) & bcryptjs
* **Payments:** Stripe API

---

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed on your machine:
* [Node.js](https://nodejs.org/en/) (v18 or higher recommended)
* [PostgreSQL](https://www.postgresql.org/) (Running locally or a cloud instance)

---

## 📦 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Diganta999/B7A4.git
   cd B7A4
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root of your project and configure the following variables:

   ```env
   # Application Port
   PORT=5000
   
   # Frontend URL (for CORS)
   APP_URL=http://localhost:3000

   # Database Connection String
   DATABASE_URL="postgresql://<USER>:<PASSWORD>@localhost:5432/<DB_NAME>?schema=public"

   # JWT Configuration
   JWT_SECRET="your_secure_jwt_secret"
   JWT_EXPIRES_IN="7d"

   # Stripe Configuration
   STRIPE_SECRET_KEY="sk_test_..."
   ```

4. **Run Database Migrations:**
   Push the Prisma schema to your PostgreSQL database and generate the Prisma client.
   ```bash
   npx prisma db push
   npx prisma generate
   ```

5. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   The server should now be running at `https://gearupshop.vercel.app`.

---

## 📖 API Documentation Summary

The API routes are modularized for better maintainability. Below is a high-level overview of the available endpoints.

### Authentication (`/api/auth`)
* `POST /register` - Register a new user (`CUSTOMER` or `PROVIDER`)
* `POST /login` - Authenticate user and issue JWT cookies
* `GET /me` - Retrieve the currently authenticated user's profile
* `POST /logout` - Clear authentication cookies

### Public Gear & Categories (`/api/gear`, `/api/categories`)
* `GET /gear` - Browse gear (supports search and filtering)
* `GET /gear/:id` - Get specific gear details including reviews
* `GET /categories` - Get all gear categories

### Rental Orders (`/api/rentals`)
* `POST /rentals` - Place a new rental order (Customer)
* `GET /rentals` - Retrieve logged-in user's orders (Customer)
* `GET /rentals/:id` - Get rental order details

### Payments (`/api/payments`)
* `POST /payments/create` - Create a Stripe checkout session for a rental order
* `POST /payments/confirm` - Webhook listener for Stripe to confirm payment status
* `GET /payments` - Retrieve payment history for the user

### Provider Management (`/api/provider`)
* `POST /provider/gear` - Add new gear to inventory
* `PUT /provider/gear/:id` - Update an existing gear listing
* `DELETE /provider/gear/:id` - Remove gear from inventory
* `GET /provider/orders` - View incoming rental orders for the provider's gear
* `PATCH /provider/orders/:id` - Update the status of a rental order (`CONFIRMED`, `PICKED_UP`, `RETURNED`)

### Admin Management (`/api/admin`)
* `GET /admin/users` - View all registered users
* `PATCH /admin/users/:id` - Update user status (`SUSPENDED` / `ACTIVE`)
* `GET /admin/gear` - View all platform gear listings
* `GET /admin/rentals` - View all platform rental orders

---

## 🗄️ Database Schema

The relational schema is built with Prisma. Key models include:
* **User:** Stores profile details, roles, and status.
* **Category:** Grouping for different types of equipment.
* **GearItem:** Stores equipment details, pricing, specifications, and links to the Provider.
* **RentalOrder:** Records the rental period, total amount, and overall status.
* **RentalOrderItem:** Line items connecting a RentalOrder to specific GearItems.
* **Payment:** Tracks transaction details, status, and the associated RentalOrder.
* **Review:** Customer feedback and ratings for specific GearItems.

---

*This project was created as an assignment for Programming Hero Level 2.*
