const { OrderDetail, Order, User, Product } = require("../models");

module.exports = class orderDetailController {
  static async getOrderDetails(req, res, next) {
    try {
      const orderDetails = await OrderDetail.findAll({
        include: [
          {
            model: User,
            attributes: ["id", "username", "email"],
          },
          {
            model: Order,
            attributes: ["id", "userId", "productId", "quantity", "status"],
            include: [
              {
                model: Product,
                as: "Product",
                attributes: ["id", "name", "price"],
              },
            ],
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      // Hitung totalAmount untuk setiap order detail
      const orderDetailsWithCalculatedTotal = orderDetails.map((detail) => {
        const calculatedTotalAmount =
          detail.Order.quantity * detail.Order.Product.price;

        return {
          ...detail.toJSON(),
          calculatedTotalAmount,
          totalAmount: calculatedTotalAmount, // Override totalAmount dengan calculated value
        };
      });

      res.status(200).json(orderDetailsWithCalculatedTotal);
    } catch (error) {
      next(error);
    }
  }

  static async getOrderDetailById(req, res, next) {
    try {
      const { id } = req.params;
      const orderDetail = await OrderDetail.findByPk(id, {
        include: [
          {
            model: User,
            attributes: ["id", "username", "email", "phone"],
          },
          {
            model: Order,
            attributes: ["id", "userId", "productId", "quantity", "status"],
            include: [
              {
                model: Product,
                as: "Product",
                attributes: ["id", "name", "price"],
              },
            ],
          },
        ],
      });

      if (!orderDetail) {
        throw { name: "NotFound", message: "Order detail not found" };
      }

      // Hitung totalAmount
      const calculatedTotalAmount =
        orderDetail.Order.quantity * orderDetail.Order.Product.price;

      const orderDetailWithCalculatedTotal = {
        ...orderDetail.toJSON(),
        calculatedTotalAmount,
        totalAmount: calculatedTotalAmount,
      };

      res.status(200).json(orderDetailWithCalculatedTotal);
    } catch (error) {
      next(error);
    }
  }

  static async getMyOrderDetails(req, res, next) {
    try {
      const userId = req.user.id;
      const orderDetails = await OrderDetail.findAll({
        where: { userId: userId },
        include: [
          {
            model: Order,
            attributes: ["id", "userId", "productId", "quantity", "status"],
            include: [
              {
                model: Product,
                as: "Product",
                attributes: ["id", "name", "price"],
              },
            ],
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      // Hitung totalAmount untuk setiap order detail
      const orderDetailsWithCalculatedTotal = orderDetails.map((detail) => {
        const calculatedTotalAmount =
          detail.Order.quantity * detail.Order.Product.price;

        return {
          ...detail.toJSON(),
          calculatedTotalAmount,
          totalAmount: calculatedTotalAmount,
        };
      });

      res.status(200).json(orderDetailsWithCalculatedTotal);
    } catch (error) {
      next(error);
    }
  }

  static async addOrderDetail(req, res, next) {
    try {
      const { orderId, orderNumber, status } = req.body;
      const userId = req.user.id;

      // Validasi input
      if (!orderId) {
        throw { name: "BadRequest", message: "Order ID is required" };
      }
      if (!orderNumber) {
        throw { name: "BadRequest", message: "Order Number is required" };
      }

      // Validate order exists dan ambil data dengan Product
      const order = await Order.findByPk(orderId, {
        include: [
          {
            model: Product,
            as: "Product",
            attributes: ["id", "name", "price"],
          },
        ],
      });

      if (!order) {
        throw {
          name: "NotFound",
          message: `Order with ID ${orderId} not found`,
        };
      }

      // Check if user owns the order
      if (order.userId !== userId) {
        throw {
          name: "Forbidden",
          message: "You can only create order details for your own orders",
        };
      }

      // Hitung totalAmount otomatis dari quantity * price
      const calculatedTotalAmount = order.quantity * order.Product.price;

      // Create order detail dengan totalAmount yang dihitung
      const orderDetail = await OrderDetail.create({
        userId: userId,
        orderId: orderId,
        orderNumber: orderNumber,
        status: status || "pending",
        totalAmount: calculatedTotalAmount, // Set calculated value
      });

      // Get complete order detail data
      const completeOrderDetail = await OrderDetail.findByPk(orderDetail.id, {
        include: [
          {
            model: Order,
            attributes: ["id", "userId", "productId", "quantity", "status"],
            include: [
              {
                model: Product,
                as: "Product",
                attributes: ["id", "name", "price"],
              },
            ],
          },
        ],
      });

      // Return dengan calculated total amount
      const orderDetailWithCalculatedTotal = {
        ...completeOrderDetail.toJSON(),
        calculatedTotalAmount,
        totalAmount: calculatedTotalAmount,
      };

      res.status(201).json({
        message: "Order detail created successfully",
        orderDetail: orderDetailWithCalculatedTotal,
      });
    } catch (error) {
      next(error);
    }
  }

  // Method baru untuk bulk create order details
  static async createOrderDetailsFromCart(req, res, next) {
    try {
      const userId = req.user.id;
      const { orderNumber } = req.body;

      if (!orderNumber) {
        throw { name: "BadRequest", message: "Order Number is required" };
      }

      // Ambil semua orders yang unpaid untuk user ini
      const orders = await Order.findAll({
        where: { userId: userId, status: "unpaid" },
        include: [
          {
            model: Product,
            as: "Product",
            attributes: ["id", "name", "price"],
          },
        ],
      });

      if (orders.length === 0) {
        throw { name: "NotFound", message: "No unpaid orders found" };
      }

      // Buat order details untuk setiap order
      const orderDetails = [];
      let grandTotal = 0;

      for (const order of orders) {
        const calculatedTotalAmount = order.quantity * order.Product.price;
        grandTotal += calculatedTotalAmount;

        const orderDetail = await OrderDetail.create({
          userId: userId,
          orderId: order.id,
          orderNumber: orderNumber,
          status: "pending",
          totalAmount: calculatedTotalAmount,
        });

        orderDetails.push({
          ...orderDetail.toJSON(),
          Order: order,
          calculatedTotalAmount,
          totalAmount: calculatedTotalAmount,
        });
      }

      res.status(201).json({
        message: "Order details created successfully",
        orderDetails: orderDetails,
        grandTotal: grandTotal,
        orderCount: orderDetails.length,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateOrderDetail(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body; // Hapus totalAmount dari input karena akan dihitung otomatis

      const orderDetail = await OrderDetail.findByPk(id, {
        include: [
          {
            model: Order,
            attributes: ["id", "userId", "productId", "quantity", "status"],
            include: [
              {
                model: Product,
                as: "Product",
                attributes: ["id", "name", "price"],
              },
            ],
          },
        ],
      });

      if (!orderDetail) {
        throw { name: "NotFound", message: "Order detail not found" };
      }

      // Check if user owns the order detail
      if (orderDetail.userId !== req.user.id) {
        throw {
          name: "Forbidden",
          message: "You can only update your own order details",
        };
      }

      const updateData = {};
      if (status) {
        const validStatuses = ["pending", "completed", "cancelled"];
        if (!validStatuses.includes(status)) {
          throw { name: "BadRequest", message: "Invalid status" };
        }
        updateData.status = status;
      }

      // Recalculate totalAmount
      const calculatedTotalAmount =
        orderDetail.Order.quantity * orderDetail.Order.Product.price;
      updateData.totalAmount = calculatedTotalAmount;

      await orderDetail.update(updateData);

      const updatedOrderDetail = await OrderDetail.findByPk(id, {
        include: [
          {
            model: Order,
            attributes: ["id", "userId", "productId", "quantity", "status"],
            include: [
              {
                model: Product,
                as: "Product",
                attributes: ["id", "name", "price"],
              },
            ],
          },
        ],
      });

      const orderDetailWithCalculatedTotal = {
        ...updatedOrderDetail.toJSON(),
        calculatedTotalAmount,
        totalAmount: calculatedTotalAmount,
      };

      res.status(200).json({
        message: "Order detail updated successfully",
        orderDetail: orderDetailWithCalculatedTotal,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteOrderDetail(req, res, next) {
    try {
      const { id } = req.params;

      const orderDetail = await OrderDetail.findByPk(id);
      if (!orderDetail) {
        throw { name: "NotFound", message: "Order detail not found" };
      }

      // Check if user owns the order detail
      if (orderDetail.userId !== req.user.id) {
        throw {
          name: "Forbidden",
          message: "You can only delete your own order details",
        };
      }

      await orderDetail.destroy();

      res.status(200).json({
        message: "Order detail deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  // Method untuk mendapatkan revenue statistics
  static async getRevenueStats(req, res, next) {
    try {
      const orderDetails = await OrderDetail.findAll({
        include: [
          {
            model: Order,
            attributes: ["id", "userId", "productId", "quantity", "status"],
            include: [
              {
                model: Product,
                as: "Product",
                attributes: ["id", "name", "price"],
              },
            ],
          },
        ],
      });

      // Hitung statistik revenue
      let totalRevenue = 0;
      let completedOrders = 0;
      let pendingOrders = 0;

      const revenueData = orderDetails.map((detail) => {
        const calculatedTotalAmount =
          detail.Order.quantity * detail.Order.Product.price;

        if (detail.status === "completed") {
          totalRevenue += calculatedTotalAmount;
          completedOrders++;
        } else if (detail.status === "pending") {
          pendingOrders++;
        }

        return {
          ...detail.toJSON(),
          calculatedTotalAmount,
          totalAmount: calculatedTotalAmount,
        };
      });

      res.status(200).json({
        totalRevenue,
        completedOrders,
        pendingOrders,
        totalOrders: orderDetails.length,
        orderDetails: revenueData,
      });
    } catch (error) {
      next(error);
    }
  }
};
