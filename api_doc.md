# Backend Toko Online Sederhana API Documentation

## Models

### User

```txt
- name : string, required
- email : string, required, unique
- password : string, required
- role : enum, required (admin, customer)
- phone : string, required
```

### Category

```txt
- name : string, required
- description : text
- imgUrl : text
```

### Product

```txt
- name : string, required
- price : decimal, required
- stock : integer, required
- description : text
- imgUrl : text
- categoryId : integer, required (foreign key)
- userId : integer, required (foreign key)
```

### Order

```txt
- userId : integer, required (foreign key)
- productId : integer, required (foreign key)
- quantity : integer, required
- price : decimal, required
- orderDate : date, required
- status : enum, required (unpaid, pending, completed, cancelled)
```

### OrderDetail

```txt
- orderId : integer, required (foreign key)
- totalAmount : decimal, required
```

## Relations

- User hasMany Product (1:N)
- User hasMany Order (1:N)
- User hasMany OrderDetail (1:N)
- Category hasMany Product (1:N)
- Product belongsTo Category (N:1)
- Product belongsTo User (N:1)
- Order belongsTo User (N:1)
- Order belongsTo Product (N:1)
- OrderDetail belongsTo User (N:1)
- OrderDetail belongsTo Order (N:1)

## Endpoints

List of available endpoints:

- `POST /register`
- `POST /login`

Routes below need authentication:

- `GET /products`
- `GET /products/:id`
- `GET /categories`
- `GET /categories/:id`
- `GET /orders`
- `POST /orders`
- `PUT /orders/:id`
- `DELETE /orders/:id`
- `GET /order-details`
- `GET /order-details/:id`
- `GET /my-order-details`
- `POST /order-details`
- `POST /order-details/from-cart`
- `PUT /order-details/:id`
- `DELETE /order-details/:id`
- `GET /revenue-stats`
- `GET /payment/midtrans/initiate`
- `POST /payment/midtrans/notification`
- `PUT /payment/status`

Routes below need authentication & authorization (admin only):

- `POST /products`
- `PUT /products/:id`
- `DELETE /products/:id`
- `GET /admin/orders`

## 1. POST /register

Request:

- body:

```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "role": "string",
  "phone": "string"
}
```

_Response (201 - Created)_

```json
{
  "id": "integer",
  "name": "string",
  "email": "string"
}
```

_Response (400 - Bad Request)_

```json
{
  "message": "Name is required"
}
OR
{
  "message": "Email is required"
}
OR
{
  "message": "Password is required"
}
OR
{
  "message": "Phone is required"
}
```

&nbsp;

## 2. POST /login

Request:

- body:

```json
{
  "email": "string",
  "password": "string"
}
```

_Response (200 - OK)_

```json
{
  "access_token": "string"
}
```

_Response (400 - Bad Request)_

```json
{
  "message": "Email is required"
}
OR
{
  "message": "Password is required"
}
```

_Response (401 - Unauthorized)_

```json
{
  "message": "Invalid email or password"
}
```

_Response (404 - Not Found)_

```json
{
  "message": "User not found"
}
```

&nbsp;

## 3. GET /products

Description:

- Get all products from database with search functionality

Request:

- headers:

```json
{
  "Authorization": "Bearer <string token>"
}
```

- query (optional):

```json
{
  "q": "string"
}
```

_Response (200 - OK)_

```json
[
  {
    "id": 1,
    "name": "Milkshake Cokelat",
    "price": "13.33",
    "stock": 123,
    "description": "Milkshake Cokelat enak dan lezat",
    "imgUrl": "https://example.com/images/products/product-1.jpg",
    "categoryId": 3,
    "userId": 2,
    "Category": {
      "id": 3,
      "name": "Minuman Dingin"
    }
  }
]
```

&nbsp;

## 4. GET /products/:id

Description:

- Get product by id

Request:

- headers:

```json
{
  "Authorization": "Bearer <string token>"
}
```

- params:

```json
{
  "id": "integer"
}
```

_Response (200 - OK)_

```json
{
  "id": 1,
  "name": "Milkshake Cokelat",
  "price": "13.33",
  "stock": 123,
  "description": "Milkshake Cokelat enak dan lezat",
  "imgUrl": "https://example.com/images/products/product-1.jpg",
  "categoryId": 3,
  "userId": 2
}
```

_Response (404 - Not Found)_

```json
{
  "message": "Product not found"
}
```

&nbsp;

## 5. GET /categories

Description:

- Get all categories from database

Request:

- headers:

```json
{
  "Authorization": "Bearer <string token>"
}
```

_Response (200 - OK)_

```json
[
  {
    "id": 1,
    "name": "Makanan Berat",
    "description": null,
    "imgUrl": "https://example.com/images/makanan-berat.jpg"
  }
]
```

&nbsp;

## 6. GET /categories/:id

Description:

- Get category by id

Request:

- headers:

```json
{
  "Authorization": "Bearer <string token>"
}
```

- params:

```json
{
  "id": "integer"
}
```

_Response (200 - OK)_

```json
{
  "id": 1,
  "name": "Makanan Berat",
  "description": null,
  "imgUrl": "https://example.com/images/makanan-berat.jpg"
}
```

_Response (404 - Not Found)_

```json
{
  "message": "Category not found"
}
```

&nbsp;

## 7. GET /orders

Description:

- Get my orders (customer) or all orders (admin)

Request:

- headers:

```json
{
  "Authorization": "Bearer <string token>"
}
```

_Response (200 - OK)_

```json
[
  {
    "id": 1,
    "userId": 1,
    "productId": 1,
    "quantity": 2,
    "price": "13.33",
    "orderDate": "2025-01-06T10:00:00.000Z",
    "status": "unpaid",
    "Product": {
      "id": 1,
      "name": "Milkshake Cokelat",
      "Category": {
        "id": 3,
        "name": "Minuman Dingin"
      }
    }
  }
]
```

&nbsp;

## 8. POST /orders

Description:

- Create new order (add to cart)

Request:

- headers:

```json
{
  "Authorization": "Bearer <string token>"
}
```

- body:

```json
{
  "productId": "integer",
  "quantity": "integer"
}
```

_Response (201 - Created)_

```json
{
  "message": "Order created successfully",
  "order": {
    "id": 1,
    "userId": 1,
    "productId": 1,
    "quantity": 2,
    "price": "13.33",
    "orderDate": "2025-01-06T10:00:00.000Z",
    "status": "unpaid",
    "Product": {
      "id": 1,
      "name": "Milkshake Cokelat",
      "price": "13.33",
      "imgUrl": "https://example.com/images/products/product-1.jpg"
    }
  }
}
```

_Response (400 - Bad Request)_

```json
{
  "message": "Product ID is required"
}
OR
{
  "message": "Valid quantity is required"
}
OR
{
  "message": "Insufficient stock for Product Name. Available: 10"
}
```

_Response (404 - Not Found)_

```json
{
  "message": "Product with ID 1 not found"
}
```

&nbsp;

## 9. PUT /orders/:id

Description:

- Update order quantity

Request:

- headers:

```json
{
  "Authorization": "Bearer <string token>"
}
```

- params:

```json
{
  "id": "integer"
}
```

- body:

```json
{
  "quantity": "integer"
}
```

_Response (200 - OK)_

```json
{
  "message": "Order updated successfully",
  "order": {
    "id": 1,
    "userId": 1,
    "productId": 1,
    "quantity": 3,
    "price": "13.33",
    "orderDate": "2025-01-06T10:00:00.000Z",
    "status": "unpaid",
    "Product": {
      "id": 1,
      "name": "Milkshake Cokelat",
      "price": "13.33",
      "imgUrl": "https://example.com/images/products/product-1.jpg"
    }
  }
}
```

_Response (400 - Bad Request)_

```json
{
  "message": "Insufficient stock. Available: 10"
}
```

_Response (404 - Not Found)_

```json
{
  "message": "Order not found"
}
```

&nbsp;

## 10. DELETE /orders/:id

Description:

- Delete order from cart

Request:

- headers:

```json
{
  "Authorization": "Bearer <string token>"
}
```

- params:

```json
{
  "id": "integer"
}
```

_Response (200 - OK)_

```json
{
  "message": "Order deleted successfully"
}
```

_Response (404 - Not Found)_

```json
{
  "message": "Order not found"
}
```

&nbsp;

## 11. GET /order-details

Description:

- Get all order details (admin only)

Request:

- headers:

```json
{
  "Authorization": "Bearer <string token>"
}
```

_Response (200 - OK)_

```json
[
  {
    "id": 1,
    "userId": 1,
    "orderId": 1,
    "orderNumber": "ORD-1704536400000-1",
    "totalAmount": "26.66",
    "status": "pending",
    "calculatedTotalAmount": "26.66",
    "User": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com"
    },
    "Order": {
      "id": 1,
      "userId": 1,
      "productId": 1,
      "quantity": 2,
      "status": "unpaid",
      "Product": {
        "id": 1,
        "name": "Milkshake Cokelat",
        "price": "13.33"
      }
    }
  }
]
```

&nbsp;

## 12. GET /order-details/:id

Description:

- Get order detail by id

Request:

- headers:

```json
{
  "Authorization": "Bearer <string token>"
}
```

- params:

```json
{
  "id": "integer"
}
```

_Response (200 - OK)_

```json
{
  "id": 1,
  "userId": 1,
  "orderId": 1,
  "orderNumber": "ORD-1704536400000-1",
  "totalAmount": "26.66",
  "status": "pending",
  "calculatedTotalAmount": "26.66",
  "User": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "phone": "081234567890"
  },
  "Order": {
    "id": 1,
    "userId": 1,
    "productId": 1,
    "quantity": 2,
    "status": "unpaid",
    "Product": {
      "id": 1,
      "name": "Milkshake Cokelat",
      "price": "13.33"
    }
  }
}
```

_Response (404 - Not Found)_

```json
{
  "message": "Order detail not found"
}
```

&nbsp;

## 13. GET /my-order-details

Description:

- Get my order details

Request:

- headers:

```json
{
  "Authorization": "Bearer <string token>"
}
```

_Response (200 - OK)_

```json
[
  {
    "id": 1,
    "userId": 1,
    "orderId": 1,
    "orderNumber": "ORD-1704536400000-1",
    "totalAmount": "26.66",
    "status": "pending",
    "calculatedTotalAmount": "26.66",
    "Order": {
      "id": 1,
      "userId": 1,
      "productId": 1,
      "quantity": 2,
      "status": "unpaid",
      "Product": {
        "id": 1,
        "name": "Milkshake Cokelat",
        "price": "13.33"
      }
    }
  }
]
```

&nbsp;

## 14. POST /order-details

Description:

- Create order detail

Request:

- headers:

```json
{
  "Authorization": "Bearer <string token>"
}
```

- body:

```json
{
  "orderId": "integer",
  "orderNumber": "string",
  "status": "string"
}
```

_Response (201 - Created)_

```json
{
  "message": "Order detail created successfully",
  "orderDetail": {
    "id": 1,
    "userId": 1,
    "orderId": 1,
    "orderNumber": "ORD-1704536400000-1",
    "totalAmount": "26.66",
    "status": "pending",
    "calculatedTotalAmount": "26.66",
    "Order": {
      "id": 1,
      "userId": 1,
      "productId": 1,
      "quantity": 2,
      "status": "unpaid",
      "Product": {
        "id": 1,
        "name": "Milkshake Cokelat",
        "price": "13.33"
      }
    }
  }
}
```

_Response (400 - Bad Request)_

```json
{
  "message": "Order ID is required"
}
OR
{
  "message": "Order Number is required"
}
```

_Response (404 - Not Found)_

```json
{
  "message": "Order with ID 1 not found"
}
```

_Response (403 - Forbidden)_

```json
{
  "message": "You can only create order details for your own orders"
}
```

&nbsp;

## 15. POST /order-details/from-cart

Description:

- Create order details from all unpaid orders (checkout from cart)

Request:

- headers:

```json
{
  "Authorization": "Bearer <string token>"
}
```

- body:

```json
{
  "orderNumber": "string"
}
```

_Response (201 - Created)_

```json
{
  "message": "Order details created successfully",
  "orderDetails": [
    {
      "id": 1,
      "userId": 1,
      "orderId": 1,
      "orderNumber": "ORD-1704536400000-1",
      "totalAmount": "26.66",
      "status": "pending",
      "calculatedTotalAmount": "26.66",
      "Order": {
        "id": 1,
        "userId": 1,
        "productId": 1,
        "quantity": 2,
        "status": "unpaid",
        "Product": {
          "id": 1,
          "name": "Milkshake Cokelat",
          "price": "13.33"
        }
      }
    }
  ],
  "grandTotal": 26.66,
  "orderCount": 1
}
```

_Response (400 - Bad Request)_

```json
{
  "message": "Order Number is required"
}
```

_Response (404 - Not Found)_

```json
{
  "message": "No unpaid orders found"
}
```

&nbsp;

## 16. PUT /order-details/:id

Description:

- Update order detail status

Request:

- headers:

```json
{
  "Authorization": "Bearer <string token>"
}
```

- params:

```json
{
  "id": "integer"
}
```

- body:

```json
{
  "status": "string"
}
```

_Response (200 - OK)_

```json
{
  "message": "Order detail updated successfully",
  "orderDetail": {
    "id": 1,
    "userId": 1,
    "orderId": 1,
    "orderNumber": "ORD-1704536400000-1",
    "totalAmount": "26.66",
    "status": "completed",
    "calculatedTotalAmount": "26.66",
    "Order": {
      "id": 1,
      "userId": 1,
      "productId": 1,
      "quantity": 2,
      "status": "unpaid",
      "Product": {
        "id": 1,
        "name": "Milkshake Cokelat",
        "price": "13.33"
      }
    }
  }
}
```

_Response (400 - Bad Request)_

```json
{
  "message": "Invalid status"
}
```

_Response (404 - Not Found)_

```json
{
  "message": "Order detail not found"
}
```

_Response (403 - Forbidden)_

```json
{
  "message": "You can only update your own order details"
}
```

&nbsp;

## 17. DELETE /order-details/:id

Description:

- Delete order detail

Request:

- headers:

```json
{
  "Authorization": "Bearer <string token>"
}
```

- params:

```json
{
  "id": "integer"
}
```

_Response (200 - OK)_

```json
{
  "message": "Order detail deleted successfully"
}
```

_Response (404 - Not Found)_

```json
{
  "message": "Order detail not found"
}
```

_Response (403 - Forbidden)_

```json
{
  "message": "You can only delete your own order details"
}
```

&nbsp;

## 18. GET /revenue-stats

Description:

- Get revenue statistics (admin only)

Request:

- headers:

```json
{
  "Authorization": "Bearer <string token>"
}
```

_Response (200 - OK)_

```json
{
  "totalRevenue": 100.5,
  "completedOrders": 5,
  "pendingOrders": 3,
  "totalOrders": 8,
  "orderDetails": [
    {
      "id": 1,
      "userId": 1,
      "orderId": 1,
      "orderNumber": "ORD-1704536400000-1",
      "totalAmount": "26.66",
      "status": "completed",
      "calculatedTotalAmount": "26.66",
      "Order": {
        "id": 1,
        "userId": 1,
        "productId": 1,
        "quantity": 2,
        "status": "unpaid",
        "Product": {
          "id": 1,
          "name": "Milkshake Cokelat",
          "price": "13.33"
        }
      }
    }
  ]
}
```

&nbsp;

## 19. GET /payment/midtrans/initiate

Description:

- Initiate payment with Midtrans

Request:

- headers:

```json
{
  "Authorization": "Bearer <string token>"
}
```

_Response (200 - OK)_

```json
{
  "transactionToken": "string",
  "orderId": "ORDER-1-1704536400000",
  "amount": 2666,
  "message": "Payment initiated successfully"
}
```

_Response (400 - Bad Request)_

```json
{
  "message": "No pending orders found"
}
```

&nbsp;

## 20. POST /payment/midtrans/notification

Description:

- Handle Midtrans payment notification webhook

Request:

- body: (Midtrans notification payload)

_Response (200 - OK)_

```json
{
  "status": "success",
  "message": "Notification processed successfully"
}
```

_Response (400 - Bad Request)_

```json
{
  "status": "error",
  "message": "Invalid signature"
}
```

&nbsp;

## 21. PUT /payment/status

Description:

- Update payment status manually

Request:

- headers:

```json
{
  "Authorization": "Bearer <string token>"
}
```

- body:

```json
{
  "status": "string"
}
```

_Response (200 - OK)_

```json
{
  "message": "Payment status updated successfully",
  "affectedCount": 3,
  "newStatus": "completed"
}
```

_Response (400 - Bad Request)_

```json
{
  "message": "Invalid status. Allowed: completed, cancelled, pending"
}
```

_Response (404 - Not Found)_

```json
{
  "message": "No unpaid orders found to update"
}
```

&nbsp;

## 22. POST /products

Description:

- Add new product (admin only)

Request:

- headers:

```json
{
  "Authorization": "Bearer <admin_token>"
}
```

- body:

```json
{
  "name": "string",
  "price": "number",
  "stock": "integer",
  "description": "string",
  "imgUrl": "string",
  "categoryId": "integer"
}
```

_Response (201 - Created)_

```json
{
  "message": "Product created successfully",
  "product": {
    "id": 10,
    "name": "Nasi Goreng Spesial",
    "price": "25.50",
    "stock": 50,
    "description": "Nasi goreng dengan bumbu spesial",
    "imgUrl": "https://example.com/images/products/nasi-goreng.jpg",
    "categoryId": 1,
    "userId": 1
  }
}
```

_Response (400 - Bad Request)_

```json
{
  "message": "Name is required"
}
OR
{
  "message": "Price is required"
}
OR
{
  "message": "Stock is required"
}
```

&nbsp;

## 23. PUT /products/:id

Description:

- Update product (admin only)

Request:

- headers:

```json
{
  "Authorization": "Bearer <admin_token>"
}
```

- params:

```json
{
  "id": "integer"
}
```

- body:

```json
{
  "name": "string",
  "price": "number",
  "stock": "integer",
  "description": "string",
  "imgUrl": "string",
  "categoryId": "integer"
}
```

_Response (200 - OK)_

```json
{
  "message": "Product 1 updated successfully",
  "product": {
    "id": 1,
    "name": "Updated Product Name",
    "price": "27.50",
    "stock": 45
  }
}
```

_Response (404 - Not Found)_

```json
{
  "message": "Product not found"
}
```

&nbsp;

## 24. DELETE /products/:id

Description:

- Delete product (admin only)

Request:

- headers:

```json
{
  "Authorization": "Bearer <admin_token>"
}
```

- params:

```json
{
  "id": "integer"
}
```

_Response (200 - OK)_

```json
{
  "message": "Product deleted successfully"
}
```

_Response (404 - Not Found)_

```json
{
  "message": "Product not found"
}
```

&nbsp;

## 25. GET /admin/orders

Description:

- Get all orders (admin only)

Request:

- headers:

```json
{
  "Authorization": "Bearer <admin_token>"
}
```

_Response (200 - OK)_

```json
[
  {
    "id": 1,
    "userId": 1,
    "productId": 1,
    "quantity": 2,
    "price": "13.33",
    "orderDate": "2025-01-06T10:00:00.000Z",
    "status": "unpaid",
    "User": {
      "id": 1,
      "email": "john@example.com",
      "role": "customer"
    },
    "Product": {
      "id": 1,
      "name": "Milkshake Cokelat",
      "Category": {
        "id": 3,
        "name": "Minuman Dingin"
      }
    }
  }
]
```

&nbsp;

## Global Error

_Response (401 - Unauthorized)_

```json
{
  "message": "Invalid token"
}
```

_Response (403 - Forbidden)_

```json
{
  "message": "Access denied. Admin role required."
}
OR
{
  "message": "You can only access your own orders"
}
```

_Response (500 - Internal Server Error)_

```json
{
  "message": "Internal server error"
}
```
