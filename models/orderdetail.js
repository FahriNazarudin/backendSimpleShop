"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class OrderDetail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      OrderDetail.belongsTo(models.User, { foreignKey: "userId" , as: "User" });
      OrderDetail.belongsTo(models.Order, { foreignKey: "orderId" , as: "Order" });
    }
  }
  OrderDetail.init(
    {
      orderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: "Order ID is required" },
          notEmpty: { msg: "Order ID cannot be empty" },
        },
      },
      totalAmount: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        validate: {
          notNull: { msg: "Total Amount is required" },
          notEmpty: { msg: "Total Amount cannot be empty" },
          min: { args: [0], msg: "Total Amount must be greater than 0" },
        },
      },
    },
    {
      sequelize,
      modelName: "OrderDetail",
    }
  );
  return OrderDetail;
};
