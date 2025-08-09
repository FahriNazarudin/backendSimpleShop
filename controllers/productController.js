const { where, Op } = require("sequelize");
const { Product, User, Category } = require("../models");

module.exports = class productController {
  static async getAllProducts(req, res, next) {
    const { q, search, categoryId } = req.query;
    const paramQuerySQL = {
      where: {},
    };

    // Support both 'q' and 'search' parameters
    const searchTerm = search || q;
    if (searchTerm) {
      paramQuerySQL.where.name = {
        [Op.iLike]: `%${searchTerm}%`,
      };
    }

    // Filter by category if provided
    if (categoryId) {
      paramQuerySQL.where.categoryId = categoryId;
    }

    try {
      const products = await Product.findAll({
        where: paramQuerySQL.where,
        include: [{ model: Category, attributes: ["id", "name"] }],
      });
      return res.status(200).json(products);
    } catch (error) {
      next(error);
    }
  }

  static async getProductById(req, res, next) {
    try {
      const { id } = req.params;
      const product = await Product.findByPk(id, {
        include: [{ model: Category, attributes: ["id", "name"] }],
      });

      if (!product) {
        throw { name: "NotFound", msg: "Product not found" };
      }
      return res.status(200).json(product);
    } catch (error) {
      next(error);
    }
  }

  static async addProduct(req, res, next) {
    try {
      const { name, price, stock, description, imgUrl, categoryId, UserId } =
        req.body;

      const product = await Product.create({
        name,
        price,
        stock,
        description,
        imgUrl,
        categoryId,
        UserId: user.id,
      });
      res.status(201).json({ msg: "Product created successfully", product });
    } catch (error) {
      next(error);
    }
  }

  static async updateProduct(req, res, next) {
    try {
      const { id } = req.params;
      const product = await Product.findByPk(id);
      if (!product) {
        throw { name: "NotFound", msg: "Product not found" };
      }

      await product.update(req.body);
      res.status.json({ msg: `Product ${id} updated successfully`, product });
    } catch (error) {
      next(error);
    }
  }

  static async deleteProduct(req, res, next) {
    try {
      const { id } = req.params;
      const product = await Product.findByPk(id);
      if (!product) {
        throw { name: "NotFound", msg: "Product not found" };
      }

      await product.destroy();
      res.status(200).json({ msg: `Product ${id} deleted successfully` });
    } catch (error) {
      next(error);
    }
  }
};
