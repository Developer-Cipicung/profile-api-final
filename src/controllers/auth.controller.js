import * as authService from '../services/auth.service.js';
import { HTTP_STATUS } from '../constants/httpStatus.constants.js';
import { successResponse } from '../utils/response.js';

export const login = async (req, res) => {
  const { username, password } = req.body;
  const result = await authService.login(username, password);
  
  return successResponse(
    res,
    HTTP_STATUS.OK,
    'Login successful',
    result
  );
};
