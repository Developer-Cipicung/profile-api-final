import jwt from 'jsonwebtoken';
import { HTTP_STATUS } from '../constants/httpStatus.constants.js';
import { errorResponse } from '../utils/response.js';

export const protectRoute = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return errorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Unauthorized: Missing token');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // As per RBAC rules, JWT is the single source of truth for authorization.
    // We attach the decoded payload directly without querying the database.
    req.admin = {
      id: decoded.id,
      username: decoded.username,
      full_name: decoded.full_name,
      role: decoded.role,
    };
    
    next();
  } catch (error) {
    return errorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Unauthorized: Invalid or expired token');
  }
};
