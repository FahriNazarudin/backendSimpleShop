const { Order } = require("../models");

// Authorization untuk admin-only routes
async function adminOnly(req, res, next) {
  try {
    const { role } = req.user;

    if (role !== "admin") {
      throw {
        name: "Forbidden",
        message: "Access denied. Admin role required.",
      };
    }
    next();
  } catch (error) {
    next(error);
  }
}

// Authorization untuk resource ownership (order milik sendiri)
const orderOwnership = async (req, res, next) => {
  try {
    const { id } = req.params; // Order ID dari URL parameter
    const userId = req.user.id; // User ID dari token

    if (!id) {
      return res.status(400).json({
        message: "Order ID is required",
      });
    }

    // Cari order berdasarkan ID dan pastikan milik user yang login
    const order = await Order.findOne({
      where: {
        id: id,
        userId: userId,
      },
    });

    if (!order) {
      return res.status(404).json({
        message:
          "Order not found or you don't have permission to access this order",
      });
    }

    req.order = order; // Simpan order untuk digunakan di controller
    next();
  } catch (error) {
    return res.status(500).json({
      message: "Authorization error",
      error: error.message,
    });
  }
};


module.exports = {
  adminOnly,
  orderOwnership,
};
