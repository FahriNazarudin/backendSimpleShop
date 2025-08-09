const { Order, Product } = require("../models");
const midtransClient = require("midtrans-client");
const crypto = require("crypto");

class PaymentController {
  static async initiatePayment(req, res, next) {
    try {
      const snap = new midtransClient.Snap({
        isProduction: false,
        serverKey: process.env.MT_SERVER_KEY,
      });

      const orders = await Order.findAll({
        where: { userId: req.user.id, status: "unpaid" },
        include: [{ model: Product, as: "Product" }],
      });

      if (orders.length === 0) {
        return res.status(400).json({
          message: "No pending orders found",
        });
      }

      const amount = orders.reduce((total, order) => {
        return total + order.quantity * order.Product.price;
      }, 0);

      const roundedAmount = Math.round(amount);
      const orderId = `ORDER-${req.user.id}-${Date.now()}`;

      let parameter = {
        transaction_details: {
          order_id: orderId,
          gross_amount: roundedAmount,
        },
        credit_card: {
          secure: true,
        },
        customer_details: {
          first_name: req.user.username,
          email: req.user.email,
        },
        // Tambahkan custom field untuk menyimpan userId
        custom_field1: req.user.id.toString(),
        custom_field2: orders.length.toString(),
      };

      const transaction = await snap.createTransaction(parameter);
      let transactionToken = transaction.token;

      console.log("transactionToken:", transactionToken);

      // Optional: Simpan order_id di database untuk tracking
      // Anda bisa menambah field midtransOrderId di model Order
      // await Promise.all(
      //   orders.map(order =>
      //     order.update({ midtransOrderId: orderId })
      //   )
      // );

      res.json({
        transactionToken,
        orderId,
        amount: roundedAmount,
        message: "Payment initiated successfully",
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  // Webhook handler untuk notifikasi Midtrans
  static async handleNotification(req, res, next) {
    try {
      const notification = req.body;

      console.log("=== MIDTRANS NOTIFICATION RECEIVED ===");
      console.log("Full notification:", JSON.stringify(notification, null, 2));

      // Verifikasi signature untuk keamanan
      const serverKey = process.env.MT_SERVER_KEY;
      const orderId = notification.order_id;
      const statusCode = notification.status_code;
      const grossAmount = notification.gross_amount;

      const signatureKey = crypto
        .createHash("sha512")
        .update(orderId + statusCode + grossAmount + serverKey)
        .digest("hex");

      console.log("Generated signature:", signatureKey);
      console.log("Received signature:", notification.signature_key);

      if (signatureKey !== notification.signature_key) {
        console.log("❌ Invalid signature");
        return res.status(400).json({
          status: "error",
          message: "Invalid signature",
        });
      }

      console.log("✅ Signature verified");

      // Tentukan status berdasarkan transaction_status dari Midtrans
      let orderStatus;
      const transactionStatus = notification.transaction_status;
      const fraudStatus = notification.fraud_status;

      console.log("Transaction Status:", transactionStatus);
      console.log("Fraud Status:", fraudStatus);

      if (transactionStatus === "capture") {
        if (fraudStatus === "challenge") {
          orderStatus = "pending";
        } else if (fraudStatus === "accept") {
          orderStatus = "completed";
        }
      } else if (transactionStatus === "settlement") {
        orderStatus = "completed";
      } else if (
        transactionStatus === "deny" ||
        transactionStatus === "cancel" ||
        transactionStatus === "expire"
      ) {
        orderStatus = "cancelled";
      } else if (transactionStatus === "pending") {
        orderStatus = "pending";
      }

      console.log("Determined order status:", orderStatus);

      // Update status orders berdasarkan custom_field1 (userId)
      if (notification.custom_field1) {
        const userId = parseInt(notification.custom_field1);
        console.log("Updating orders for userId:", userId);

        const [affectedCount, updatedOrders] = await Order.update(
          { status: orderStatus },
          {
            where: {
              userId: userId,
              status: "unpaid",
            },
            returning: true,
          }
        );

        console.log(`Updated ${affectedCount} orders`);
        console.log("Updated orders:", updatedOrders);
      } else {
        console.log("❌ No custom_field1 found in notification");
      }

      console.log("=== NOTIFICATION PROCESSING COMPLETE ===");

      // Kirim response sukses ke Midtrans
      res.status(200).json({
        status: "success",
        message: "Notification processed successfully",
      });
    } catch (error) {
      console.error("❌ Error handling Midtrans notification:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  }

  static async updatePaymentStatus(req, res, next) {
    try {
      const { status } = req.body;
      const userId = req.user.id;

      // Validasi status yang diizinkan
      const allowedStatuses = ["completed", "cancelled", "pending"];
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          message: "Invalid status. Allowed: completed, cancelled, pending",
        });
      }

      console.log(`Updating payment status for user ${userId} to: ${status}`);

      // Update semua order unpaid menjadi status baru
      const [affectedCount] = await Order.update(
        { status: status },
        {
          where: {
            userId: userId,
            status: "unpaid",
          },
        }
      );

      if (affectedCount === 0) {
        return res.status(404).json({
          message: "No unpaid orders found to update",
        });
      }

      res.status(200).json({
        message: `Payment status updated successfully`,
        affectedCount: affectedCount,
        newStatus: status,
      });
    } catch (error) {
      console.log("Error updating payment status:", error);
      next(error);
    }
  }
}

module.exports = PaymentController;
