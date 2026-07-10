# GearUp - Sports & Outdoor Equipment Rental API

GearUp is a backend API for a sports and outdoor equipment rental service. Customers can browse available gear, place rental orders, make payments (via Stripe or SSLCommerz), and leave reviews. Providers can manage their gear inventory, track stock availability, and manage incoming rental orders. Admins oversee the platform, manage users, and moderate listings.

---

## Tech Stack & Getting Started

### Prerequisites
- **Node.js** (v18+)
- **PostgreSQL** Database

### Installation
1. Clone the repository and navigate to the directory:
   ```bash
   cd B7A4
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up the Environment Variables:
   Create a `.env` file in the root directory (based on `.env.example` if available, or use the template below):
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/gearup_db"
   PORT=5000
   JWT_SECRET="your_jwt_access_secret_key"
   JWT_EXPIRATION="7d"
   JWT_REFRESH_SECRET="your_jwt_refresh_secret_key"
   JWT_REFRESH_EXPIRATION="30d"
   BCRYPT_SALT_ROUNDS=10
   ```
4. Run migrations and generate Prisma Client:
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```
5. Start development server:
   ```bash
   npm run dev
   ```

---

## API Endpoints & Specification

### Authentication

#### Register User
* **Endpoint:** `POST /api/auth/register`
* **Access:** Public
* **Request Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john.doe@example.com",
    "password": "securepassword123",
    "role": "CUSTOMER", // CUSTOMER or PROVIDER
    "phone": "+1234567890", // Optional
    "address": "123 Main St, City", // Optional
    "profileImage": "https://example.com/image.png" // Optional
  }
  ```
* **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "statusCode": 201,
    "message": "User registered successfully",
    "data": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "role": "CUSTOMER",
      "phone": "+1234567890",
      "address": "123 Main St, City",
      "profileImage": "https://example.com/image.png",
      "status": "ACTIVE",
      "createdAt": "2026-07-10T12:00:00.000Z",
      "updatedAt": "2026-07-10T12:00:00.000Z"
    }
  }
  ```

#### Login User
* **Endpoint:** `POST /api/auth/login`
* **Access:** Public
* **Request Body:**
  ```json
  {
    "email": "john.doe@example.com",
    "password": "securepassword123"
  }
  ```
* **Success Response (200 OK):**
  *Also sets an HttpOnly cookie named `accessToken`.*
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "User logged in successfully",
    "data": {
      "user": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "role": "CUSTOMER",
        "phone": "+1234567890",
        "address": "123 Main St, City",
        "profileImage": "https://example.com/image.png",
        "status": "ACTIVE",
        "createdAt": "2026-07-10T12:00:00.000Z",
        "updatedAt": "2026-07-10T12:00:00.000Z"
      },
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```

#### Refresh Access Token
* **Endpoint:** `POST /api/auth/refresh-token`
* **Access:** Public
* **Request:** Uses the `refreshToken` HttpOnly cookie set at login.
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Access token refreshed successfully",
    "data": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```

#### Get Authenticated Profile
* **Endpoint:** `GET /api/auth/me`
* **Access:** Authenticated (requires cookie `accessToken`)
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "User profile fetched successfully",
    "data": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "role": "CUSTOMER",
      "phone": "+1234567890",
      "address": "123 Main St, City",
      "profileImage": "https://example.com/image.png",
      "status": "ACTIVE",
      "createdAt": "2026-07-10T12:00:00.000Z",
      "updatedAt": "2026-07-10T12:00:00.000Z"
    }
  }
  ```

#### Logout User
* **Endpoint:** `POST /api/auth/logout`
* **Access:** Public (Clears cookies `accessToken` and `refreshToken`)
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "User logged out successfully",
    "data": null
  }
  ```

---

### Gear (Public)

#### Get All Gear
* **Endpoint:** `GET /api/gear`
* **Access:** Public
* **Query Parameters (Optional):**
  - `category`: Filter by category name or ID
  - `priceMin`: Minimum rental price per day
  - `priceMax`: Maximum rental price per day
  - `brand`: Filter by brand
  - `availability`: `AVAILABLE`, `OUT_OF_STOCK`, `MAINTENANCE`
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Gear retrieved successfully",
    "data": [
      {
        "id": "111e8400-e29b-41d4-a716-446655440111",
        "name": "Mountain Bike Pro",
        "description": "High-performance full suspension mountain bike.",
        "price": 25.00,
        "brand": "Trek",
        "availability": "AVAILABLE",
        "stock": 5,
        "providerId": "990e8400-e29b-41d4-a716-446655440999",
        "categoryId": "220e8400-e29b-41d4-a716-446655440222",
        "specifications": {
          "frame": "Aluminum",
          "gears": 12,
          "wheelSize": "29 inches"
        }
      }
    ]
  }
  ```

#### Get Gear Details
* **Endpoint:** `GET /api/gear/:id`
* **Access:** Public
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Gear details retrieved successfully",
    "data": {
      "id": "111e8400-e29b-41d4-a716-446655440111",
      "name": "Mountain Bike Pro",
      "description": "High-performance full suspension mountain bike.",
      "price": 25.00,
      "brand": "Trek",
      "availability": "AVAILABLE",
      "stock": 5,
      "specifications": {
        "frame": "Aluminum",
        "gears": 12
      },
      "category": {
        "id": "220e8400-e29b-41d4-a716-446655440222",
        "name": "Cycling"
      },
      "provider": {
        "id": "990e8400-e29b-41d4-a716-446655440999",
        "name": "Adventure Hub"
      },
      "reviews": []
    }
  }
  ```

#### Get All Categories
* **Endpoint:** `GET /api/categories`
* **Access:** Public
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Categories retrieved successfully",
    "data": [
      {
        "id": "220e8400-e29b-41d4-a716-446655440222",
        "name": "Cycling"
      },
      {
        "id": "330e8400-e29b-41d4-a716-446655440333",
        "name": "Camping"
      }
    ]
  }
  ```

---

### Rental Orders (Customer Only)

#### Create Rental Order
* **Endpoint:** `POST /api/rentals`
* **Access:** Authenticated (Customer role)
* **Request Body:**
  ```json
  {
    "startDate": "2026-07-15T10:00:00.000Z",
    "endDate": "2026-07-18T10:00:00.000Z",
    "items": [
      {
        "gearItemId": "111e8400-e29b-41d4-a716-446655440111",
        "quantity": 2
      }
    ]
  }
  ```
* **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "statusCode": 201,
    "message": "Rental order placed successfully",
    "data": {
      "id": "444e8400-e29b-41d4-a716-446655440444",
      "customerId": "550e8400-e29b-41d4-a716-446655440000",
      "startDate": "2026-07-15T10:00:00.000Z",
      "endDate": "2026-07-18T10:00:00.000Z",
      "totalAmount": 150.00,
      "status": "PLACED",
      "createdAt": "2026-07-10T12:00:00.000Z"
    }
  }
  ```

#### Get User's Rental Orders
* **Endpoint:** `GET /api/rentals`
* **Access:** Authenticated (Customer role)
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Rental orders retrieved successfully",
    "data": [
      {
        "id": "444e8400-e29b-41d4-a716-446655440444",
        "startDate": "2026-07-15T10:00:00.000Z",
        "endDate": "2026-07-18T10:00:00.000Z",
        "totalAmount": 150.00,
        "status": "PLACED"
      }
    ]
  }
  ```

#### Get Rental Order Details
* **Endpoint:** `GET /api/rentals/:id`
* **Access:** Authenticated (Owner Customer or Admin/Provider)
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Rental order details retrieved successfully",
    "data": {
      "id": "444e8400-e29b-41d4-a716-446655440444",
      "startDate": "2026-07-15T10:00:00.000Z",
      "endDate": "2026-07-18T10:00:00.000Z",
      "totalAmount": 150.00,
      "status": "PLACED",
      "items": [
        {
          "id": "774e8400-e29b-41d4-a716-446655440777",
          "quantity": 2,
          "gearItem": {
            "id": "111e8400-e29b-41d4-a716-446655440111",
            "name": "Mountain Bike Pro",
            "price": 25.00
          }
        }
      ]
    }
  }
  ```

---

### Payments (Customer Only)

#### Create Payment Session
* **Endpoint:** `POST /api/payments/create`
* **Access:** Authenticated (Customer role)
* **Request Body:**
  ```json
  {
    "rentalOrderId": "444e8400-e29b-41d4-a716-446655440444",
    "method": "STRIPE" // STRIPE or SSLCOMMERZ
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Payment session created successfully",
    "data": {
      "paymentId": "888e8400-e29b-41d4-a716-446655440888",
      "rentalOrderId": "444e8400-e29b-41d4-a716-446655440444",
      "amount": 150.00,
      "method": "STRIPE",
      "paymentGatewayUrl": "https://checkout.stripe.com/pay/cs_test_..."
    }
  }
  ```

#### Confirm Payment Webhook
* **Endpoint:** `POST /api/payments/confirm`
* **Access:** Public (Called by Stripe/SSLCommerz API gateway)
* **Request Body:** Gateway webhook payload containing `transactionId`, `status`, `rentalOrderId`.
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Payment confirmed and verified successfully",
    "data": null
  }
  ```

#### Get User's Payment History
* **Endpoint:** `GET /api/payments`
* **Access:** Authenticated (Customer role)
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Payment history retrieved successfully",
    "data": [
      {
        "transactionId": "txn_stripe_123456",
        "rentalOrderId": "444e8400-e29b-41d4-a716-446655440444",
        "amount": 150.00,
        "method": "STRIPE",
        "status": "COMPLETED",
        "paidAt": "2026-07-10T12:05:00.000Z"
      }
    ]
  }
  ```

#### Get Payment Details
* **Endpoint:** `GET /api/payments/:id`
* **Access:** Authenticated (Owner Customer or Admin)
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Payment details retrieved successfully",
    "data": {
      "id": "888e8400-e29b-41d4-a716-446655440888",
      "transactionId": "txn_stripe_123456",
      "amount": 150.00,
      "method": "STRIPE",
      "status": "COMPLETED",
      "paidAt": "2026-07-10T12:05:00.000Z",
      "rentalOrder": {
        "id": "444e8400-e29b-41d4-a716-446655440444",
        "startDate": "2026-07-15T10:00:00.000Z",
        "endDate": "2026-07-18T10:00:00.000Z"
      }
    }
  }
  ```

---

### Provider Management (Provider Only)

#### Add Gear to Inventory
* **Endpoint:** `POST /api/provider/gear`
* **Access:** Authenticated (Provider role)
* **Request Body:**
  ```json
  {
    "name": "Camping Tent 4-Person",
    "description": "Spacious water-resistant dome tent for outdoor camping.",
    "price": 15.00,
    "brand": "Coleman",
    "categoryId": "330e8400-e29b-41d4-a716-446655440333",
    "stock": 3,
    "specifications": {
      "capacity": "4 persons",
      "weight": "4.5kg",
      "waterproof": "3000mm"
    }
  }
  ```
* **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "statusCode": 201,
    "message": "Gear item added to inventory successfully",
    "data": {
      "id": "abcde400-e29b-41d4-a716-446655440abc",
      "name": "Camping Tent 4-Person",
      "price": 15.00,
      "stock": 3,
      "availability": "AVAILABLE"
    }
  }
  ```

#### Update Gear Listing
* **Endpoint:** `PUT /api/provider/gear/:id`
* **Access:** Authenticated (Owner Provider)
* **Request Body:**
  ```json
  {
    "price": 18.00,
    "stock": 4,
    "availability": "AVAILABLE"
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Gear listing updated successfully",
    "data": {
      "id": "abcde400-e29b-41d4-a716-446655440abc",
      "price": 18.00,
      "stock": 4,
      "availability": "AVAILABLE"
    }
  }
  ```

#### Remove Gear from Inventory
* **Endpoint:** `DELETE /api/provider/gear/:id`
* **Access:** Authenticated (Owner Provider)
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Gear listing removed successfully",
    "data": null
  }
  ```

#### Get Provider's Incoming Orders
* **Endpoint:** `GET /api/provider/orders`
* **Access:** Authenticated (Provider role)
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Incoming rental orders retrieved successfully",
    "data": [
      {
        "id": "444e8400-e29b-41d4-a716-446655440444",
        "startDate": "2026-07-15T10:00:00.000Z",
        "endDate": "2026-07-18T10:00:00.000Z",
        "status": "PLACED",
        "totalAmount": 150.00,
        "customer": {
          "name": "John Doe",
          "phone": "+1234567890"
        }
      }
    ]
  }
  ```

#### Update Rental Order Status
* **Endpoint:** `PATCH /api/provider/orders/:id`
* **Access:** Authenticated (Provider role)
* **Request Body:**
  ```json
  {
    "status": "CONFIRMED" // CONFIRMED, PICKED_UP, RETURNED, CANCELLED
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Order status updated successfully",
    "data": {
      "id": "444e8400-e29b-41d4-a716-446655440444",
      "status": "CONFIRMED"
    }
  }
  ```

---

### Reviews (Customer Only)

#### Create Review
* **Endpoint:** `POST /api/reviews`
* **Access:** Authenticated (Customer role, post-return only)
* **Request Body:**
  ```json
  {
    "gearItemId": "111e8400-e29b-41d4-a716-446655440111",
    "rating": 5, // Integer 1-5
    "comment": "Super clean mountain bike. Shifts incredibly smoothly!"
  }
  ```
* **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "statusCode": 201,
    "message": "Review submitted successfully",
    "data": {
      "id": "f5de8400-e29b-41d4-a716-446655440f5d",
      "gearItemId": "111e8400-e29b-41d4-a716-446655440111",
      "customerId": "550e8400-e29b-41d4-a716-446655440000",
      "rating": 5,
      "comment": "Super clean mountain bike. Shifts incredibly smoothly!",
      "createdAt": "2026-07-10T12:30:00.000Z"
    }
  }
  ```

---

### Admin Features

#### Get All Users
* **Endpoint:** `GET /api/admin/users`
* **Access:** Authenticated (Admin role)
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "All users retrieved successfully",
    "data": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "role": "CUSTOMER",
        "status": "ACTIVE"
      }
    ]
  }
  ```

#### Update User Status
* **Endpoint:** `PATCH /api/admin/users/:id`
* **Access:** Authenticated (Admin role)
* **Request Body:**
  ```json
  {
    "status": "SUSPENDED" // ACTIVE or SUSPENDED
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "User status updated successfully",
    "data": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "status": "SUSPENDED"
    }
  }
  ```

#### Get All Gear Listings
* **Endpoint:** `GET /api/admin/gear`
* **Access:** Authenticated (Admin role)
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "All gear listings retrieved successfully",
    "data": [
      {
        "id": "111e8400-e29b-41d4-a716-446655440111",
        "name": "Mountain Bike Pro",
        "provider": {
          "name": "Adventure Hub"
        }
      }
    ]
  }
  ```

#### Get All Rental Orders
* **Endpoint:** `GET /api/admin/rentals`
* **Access:** Authenticated (Admin role)
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "All rental orders retrieved successfully",
    "data": [
      {
        "id": "444e8400-e29b-41d4-a716-446655440444",
        "status": "PLACED",
        "customer": {
          "name": "John Doe"
        }
      }
    ]
  }
  ```

---

## OpenAPI 3.0 Specification

You can copy and save the content below as `openapi.yaml` and import it directly into Swagger Editor (https://editor.swagger.io) or Postman to generate interactive request panels and clients.

```yaml
openapi: 3.0.3
info:
  title: GearUp Sports & Outdoor Rental API
  description: Backend API for a sports and outdoor equipment rental service.
  version: 1.0.0
servers:
  - url: http://localhost:5000/api
    description: Local development server
paths:
  /auth/register:
    post:
      summary: Register a new user
      tags:
        - Authentication
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - name
                - email
                - password
              properties:
                name:
                  type: string
                email:
                  type: string
                  format: email
                password:
                  type: string
                role:
                  type: string
                  enum: [CUSTOMER, PROVIDER]
                  default: CUSTOMER
                phone:
                  type: string
                address:
                  type: string
                profileImage:
                  type: string
      responses:
        '201':
          description: User registered successfully
  /auth/login:
    post:
      summary: Authenticate user & get token
      tags:
        - Authentication
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - email
                - password
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string
      responses:
        '200':
          description: Successful authentication
  /auth/me:
    get:
      summary: Get currently authenticated user details
      tags:
        - Authentication
      security:
        - CookieAuth: []
      responses:
        '200':
          description: User profile details
  /auth/logout:
    post:
      summary: Clear current session cookie
      tags:
        - Authentication
      responses:
        '200':
          description: Logged out successfully
  /gear:
    get:
      summary: Retrieve list of sports gear with filters
      tags:
        - Gear
      parameters:
        - name: category
          in: query
          schema:
            type: string
        - name: brand
          in: query
          schema:
            type: string
        - name: priceMin
          in: query
          schema:
            type: number
        - name: priceMax
          in: query
          schema:
            type: number
      responses:
        '200':
          description: List of matching gear
  /gear/{id}:
    get:
      summary: Get details of a single gear item
      tags:
        - Gear
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Gear item details
  /categories:
    get:
      summary: Retrieve all gear categories
      tags:
        - Gear
      responses:
        '200':
          description: List of categories
  /rentals:
    post:
      summary: Place a new rental order
      tags:
        - Rental Orders
      security:
        - CookieAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - startDate
                - endDate
                - items
              properties:
                startDate:
                  type: string
                  format: date-time
                endDate:
                  type: string
                  format: date-time
                items:
                  type: array
                  items:
                    type: object
                    required:
                      - gearItemId
                      - quantity
                    properties:
                      gearItemId:
                        type: string
                      quantity:
                        type: integer
      responses:
        '201':
          description: Rental order placed successfully
    get:
      summary: Get logged-in user's rental orders
      tags:
        - Rental Orders
      security:
        - CookieAuth: []
      responses:
        '200':
          description: List of user rental orders
  /rentals/{id}:
    get:
      summary: Get details of a rental order
      tags:
        - Rental Orders
      security:
        - CookieAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Rental order details
  /payments/create:
    post:
      summary: Generate a payment session intent
      tags:
        - Payments
      security:
        - CookieAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - rentalOrderId
                - method
              properties:
                rentalOrderId:
                  type: string
                method:
                  type: string
                  enum: [STRIPE, SSLCOMMERZ]
      responses:
        '200':
          description: Payment session details
  /payments/confirm:
    post:
      summary: Payment webhook callback to verify payment status
      tags:
        - Payments
      responses:
        '200':
          description: Callback processed
  /payments:
    get:
      summary: Get transaction logs
      tags:
        - Payments
      security:
        - CookieAuth: []
      responses:
        '200':
          description: Payment history logs
  /payments/{id}:
    get:
      summary: View transaction details
      tags:
        - Payments
      security:
        - CookieAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Payment details
  /provider/gear:
    post:
      summary: Add a new gear item
      tags:
        - Provider Management
      security:
        - CookieAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - name
                - price
                - categoryId
                - stock
              properties:
                name:
                  type: string
                description:
                  type: string
                price:
                  type: number
                brand:
                  type: string
                categoryId:
                  type: string
                stock:
                  type: integer
      responses:
        '201':
          description: Gear created successfully
  /provider/gear/{id}:
    put:
      summary: Update details of a gear item
      tags:
        - Provider Management
      security:
        - CookieAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                price:
                  type: number
                stock:
                  type: integer
                availability:
                  type: string
      responses:
        '200':
          description: Updated successfully
    delete:
      summary: Remove a gear item
      tags:
        - Provider Management
      security:
        - CookieAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Removed successfully
  /provider/orders:
    get:
      summary: Get incoming rental orders
      tags:
        - Provider Management
      security:
        - CookieAuth: []
      responses:
        '200':
          description: List of incoming orders
  /provider/orders/{id}:
    patch:
      summary: Update rental order state
      tags:
        - Provider Management
      security:
        - CookieAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - status
              properties:
                status:
                  type: string
                  enum: [CONFIRMED, PAID, PICKED_UP, RETURNED, CANCELLED]
      responses:
        '200':
          description: Updated successfully
  /reviews:
    post:
      summary: Submit a review for a gear item
      tags:
        - Reviews
      security:
        - CookieAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - gearItemId
                - rating
                - comment
              properties:
                gearItemId:
                  type: string
                rating:
                  type: integer
                  minimum: 1
                  maximum: 5
                comment:
                  type: string
      responses:
        '201':
          description: Review created
  /admin/users:
    get:
      summary: Get lists of platform users
      tags:
        - Admin Panel
      security:
        - CookieAuth: []
      responses:
        '200':
          description: Users list
  /admin/users/{id}:
    patch:
      summary: Suspend or activate a user account
      tags:
        - Admin Panel
      security:
        - CookieAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - status
              properties:
                status:
                  type: string
                  enum: [ACTIVE, SUSPENDED]
      responses:
        '200':
          description: User status modified successfully
  /admin/gear:
    get:
      summary: Overview of all gear listings
      tags:
        - Admin Panel
      security:
        - CookieAuth: []
      responses:
        '200':
          description: Gear listings overview
  /admin/rentals:
    get:
      summary: Overview of all rentals placed
      tags:
        - Admin Panel
      security:
        - CookieAuth: []
      responses:
        '200':
          description: Rentals overview
components:
  securitySchemes:
    CookieAuth:
      type: apiKey
      in: cookie
      name: accessToken
```
