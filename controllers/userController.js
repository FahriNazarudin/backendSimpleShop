const { User } = require("../models");
const { comparePassword, hashPassword } = require("../helpers/bcrypt");
const { signToken } = require("../helpers/jwt");

module.exports = class userController {
  static async addUser(req, res, next) {
    try {
      const { name, email, password, role, phone } = req.body;
      const user = await User.create({
        name,
        email,
        password: hashPassword(password),
        role,
        phone,
      });

      return res.status(201).json({
        id: user.id,
        name: user.name,
        email: user.email,
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      // validasi jika email atau password tidak ada
      if (!email) {
        throw { name: "BadRequest", msg: "Email is required" };
      }
      if (!password) {
        throw { name: "BadRequest", msg: "Password is required" };
      }
      // Cek apakah user dengan email tersebut ada
      const user = await User.findOne({
        where: { email },
      });
      // validasi user
      if (!user) {
        throw { name: "NotFound", msg: "User not found" };
      }

      const isValid = comparePassword(password, user.password);
      if (!isValid) {
        throw { name: "Unauthorized", msg: "Invalid email or password" };
      }
      const access_token = signToken({
        id: user.id,
        role: user.role,
        name: user.name,
      });

      const response = {
        access_token,
        id: user.id,
        role: user.role,
        name: user.name,
      };
      return res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
};
