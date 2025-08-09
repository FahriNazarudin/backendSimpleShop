"use strict";

const { hashPassword } = require("../helpers/bcrypt");
const fs = require("fs").promises;
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const users = JSON.parse(await fs.readFile("data/users.json", "utf8")).map(
      (el) => {
        delete el.id;
        el.createdAt = new Date();
        el.updatedAt = new Date();
        el.password = hashPassword(el.password);
        return el;
      }
    );

    const categories = JSON.parse(
      await fs.readFile("data/categories.json", "utf8")
    ).map((el) => {
      delete el.id;
      el.createdAt = new Date();
      el.updatedAt = new Date();
      return el;
    });

    const products = JSON.parse(
      await fs.readFile("data/products.json", "utf8")
    ).map((el) => {
      delete el.id;
      el.createdAt = new Date();
      el.updatedAt = new Date();
      return el;
    });

    await queryInterface.bulkInsert("Categories", categories, {});
    await queryInterface.bulkInsert("Users", users, {});
    await queryInterface.bulkInsert("Products", products, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("OrderDetails", null, {
      truncate: true,
      cascade: true,
      restartIdentity: true,
    });
    await queryInterface.bulkDelete("Orders", null, {
      truncate: true,
      cascade: true,
      restartIdentity: true,
    });
    await queryInterface.bulkDelete("Products", null, {
      truncate: true,
      cascade: true,
      restartIdentity: true,
    });
    await queryInterface.bulkDelete("Users", null, {
      truncate: true,
      cascade: true,
      restartIdentity: true,
    });
    await queryInterface.bulkDelete("Categories", null, {
      truncate: true,
      cascade: true,
      restartIdentity: true,
    });
  },
};
