"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Order.belongsTo(models.User, { foreignKey: "userId", as: "User" });
      Order.belongsTo(models.Product, {
        foreignKey: "productId",
        as: "Product",
      });
      Order.hasMany(models.OrderDetail, {
        foreignKey: "orderId",
        as: "OrderDetails",
      });
    }
  }
  Order.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: { msg: "User ID is required" },
          notNull: { msg: "User ID is required" },
        },
      },
      productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: { msg: "Product ID is required" },
          notNull: { msg: "Product ID is required" },
        },
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
          notEmpty: { msg: "Quantity is required" },
          notNull: { msg: "Quantity is required" },
          min: { args: [1], msg: "Quantity must be at least 1" },
        },
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          notEmpty: { msg: "Price is required" },
          notNull: { msg: "Price is required" },
          min: { args: [0], msg: "Price must be greater than 0" },
        },
      },
      orderDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      status: {
        type: DataTypes.ENUM,
        values: ["unpaid", "pending", "completed", "cancelled"],
        defaultValue: "unpaid",
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Order",
      tableName: "Orders",
    }
  );
  return Order;
};
