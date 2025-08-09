require("dotenv").config();
const express = require("express");
const userController = require("./controllers/userController");
const productController = require("./controllers/productController");
const app = express();
const port = 3000;
const cors = require("cors");

const categoryController = require("./controllers/categoryController");
const errorHandler = require("./middlewares/errorHandler");
const authentication = require("./middlewares/authentication");
const { adminOnly } = require("./middlewares/authorization");
const orderController = require("./controllers/orderController");
const orderDetailController = require("./controllers/orderDetailController");
const PaymentController = require("./controllers/paymentController");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/register", userController.addUser);
app.post("/login", userController.login);

app.use(authentication);

app.get("/products", productController.getAllProducts);
app.get("/products/:id", productController.getProductById);

app.get("/categories", categoryController.getAllCategories);
app.get("/categories/:id", categoryController.getCategoryById);

app.get("/orders", orderController.getMyOrders);
app.post("/orders", orderController.addOrder);
app.put("/orders/:id", orderController.updateOrder);
app.delete("/orders/:id", orderController.deleteOrder);

app.get("/order-details", orderDetailController.getOrderDetails);
app.get("/order-details/:id", orderDetailController.getOrderDetailById);
app.get("/my-order-details", orderDetailController.getMyOrderDetails);
app.post("/order-details", orderDetailController.addOrderDetail);
app.post(
  "/order-details/from-cart",
  orderDetailController.createOrderDetailsFromCart
);
app.put("/order-details/:id", orderDetailController.updateOrderDetail);
app.delete("/order-details/:id", orderDetailController.deleteOrderDetail);
app.get("/revenue-stats", orderDetailController.getRevenueStats);

app.get("/payment/midtrans/initiate", PaymentController.initiatePayment);
app.post(
  "/payment/midtrans/notification",
  PaymentController.handleNotification
);
app.put("/payment/status", PaymentController.updatePaymentStatus);

app.post("/products", adminOnly, productController.addProduct);
app.put("/products/:id", adminOnly, productController.updateProduct);
app.delete("/products/:id", adminOnly, productController.deleteProduct);
app.get("/admin/orders", adminOnly, orderController.getAllOrders);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`);
});
