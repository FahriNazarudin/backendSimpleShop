const { Order, OrderDetail, Product, User, Category } = require("../models");

module.exports = class orderController {
  static async getMyOrders(req, res, next) {
    try {
      const userId = req.user.id;

      console.log("User accessing their orders, userId:", userId);

      const orders = await Order.findAll({
        where: { userId: userId },
        include: [
          {
            model: Product,
            as: "Product",
            include: [
              {
                model: Category,
                as: "Category",
              },
            ],
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      res.status(200).json(orders);
    } catch (error) {
      next(error);
    }
  }

  static async getAllOrders(req, res, next) {
    try {
      console.log("Admin accessing all orders, user:", req.user);

      const orders = await Order.findAll({
        include: [
          {
            model: User,
            as: "User",
            attributes: ["id", "email", "role"],
          },
          {
            model: Product,
            as: "Product",
            include: [
              {
                model: Category,
                as: "Category",
              },
            ],
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      res.status(200).json(orders);
    } catch (error) {
      next(error);
    }
  }

  static async addOrder(req, res, next) {
    try {
      const { productId, quantity } = req.body;
      const userId = req.user.id;
      
      // Validasi input
      if (!productId) {
        throw { name: "BadRequest", message: "Product ID is required" };
      }
      if (!quantity || quantity <= 0) {
        throw { name: "BadRequest", message: "Valid quantity is required" };
      }

      // Find and validate product
      const product = await Product.findByPk(productId);
      if (!product) {
        throw {
          name: "NotFound",
          message: `Product with ID ${productId} not found`,
        };
      }

      // Check stock availability
      if (product.stock < quantity) {
        throw {
          name: "BadRequest",
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}`,
        };
      }

      // Calculate price based on product price
      const price = product.price;

      // Create order with new structure
      const order = await Order.create({
        userId: userId,
        productId: productId,
        quantity: quantity,
        price: price,
        orderDate: new Date(),
      });

      // Update stock
      await Product.decrement("stock", {
        by: quantity,
        where: { id: productId },
      });

      // Get complete order data
      const completeOrder = await Order.findByPk(order.id, {
        include: [
          {
            model: Product,
            as: "Product",
            attributes: ["id", "name", "price", "imgUrl"],
          },
        ],
      });

      res.status(201).json({
        message: "Order created successfully",
        order: completeOrder,
      });
    } catch (error) {
      console.log("addOrder error:", error);
      next(error);
    }
  }

  static async updateOrder(req, res, next) {
    try {
      const { id } = req.params;
      const { quantity } = req.body;

      const order = await Order.findByPk(id, {
        include: [
          {
            model: Product,
            as: "Product",
            attributes: ["id", "name", "price", "stock"],
          },
        ],
      });

      if (!order) {
        throw { name: "NotFound", message: "Order not found" };
      }

      if (quantity && quantity > 0) {
        // Check if new quantity is available
        const currentStock = order.Product.stock + order.quantity; // Add back current order quantity
        if (currentStock < quantity) {
          throw {
            name: "BadRequest",
            message: `Insufficient stock. Available: ${currentStock}`,
          };
        }

        // Update stock - restore old quantity and subtract new quantity
        const stockDifference = order.quantity - quantity;
        await Product.increment("stock", {
          by: stockDifference,
          where: { id: order.productId },
        });

        // Update order
        await order.update({
          quantity: quantity,
          price: order.Product.price, // Keep current product price
        });
      }

      const updatedOrder = await Order.findByPk(id, {
        include: [
          {
            model: Product,
            attributes: ["id", "name", "price", "imgUrl"],
          },
        ],
      });

      res.status(200).json({
        message: "Order updated successfully",
        order: updatedOrder,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteOrder(req, res, next) {
    try {
      const { id } = req.params;

      const order = await Order.findByPk(id, {
        include: [
          {
            model: Product,
            as: "Product",
            attributes: ["id", "name"],
          },
        ],
      });

      if (!order) {
        throw { name: "NotFound", message: "Order not found" };
      }

      // Restore stock before deleting
      await Product.increment("stock", {
        by: order.quantity,
        where: { id: order.productId },
      });

      await order.destroy();

      res.status(200).json({
        message: "Order deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
};
