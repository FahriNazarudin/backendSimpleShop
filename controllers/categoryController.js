const { Category } = require("../models");

module.exports = class categoryController {
  static async getAllCategories(req, res, next) {
    try {
      const categories = await Category.findAll();
      return res.status(200).json(categories);
    } catch (error) {
      next(error);
    }
  }

  static async getCategoryById(req, res, next) {
    try {
      const { id } = req.params;
      const category = await Category.findByPk(id);
      if (!category) {
        throw { name: "NotFound", msg: "Category not found" };
      }
      return res.status(200).json(category);
    } catch (error) {
      next(error);
    }
  }
};
