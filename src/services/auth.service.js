import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as authRepo from "../repositories/auth.repository.js";

export const login = async (username, password) => {
  const admin = await authRepo.getAdminByUsername(username);

  if (!admin) {
    const error = new Error("Invalid username or password");
    error.statusCode = 401;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, admin.password_hash);
  if (!isPasswordValid) {
    const error = new Error("Invalid username or password");
    error.statusCode = 401;
    throw error;
  }

  const payload = {
    id: admin.id,
    username: admin.username,
    full_name: admin.full_name,
    role: admin.role,
  };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });

  return {
    accessToken,
    admin: {
      id: admin.id,
      username: admin.username,
      full_name: admin.full_name,
      role: admin.role,
    },
  };
};
