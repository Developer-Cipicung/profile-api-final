import * as adminService from '../services/admin.service.js';
import { successResponse } from '../utils/response.js';
import { HTTP_STATUS } from '../constants/httpStatus.constants.js';
import { SUCCESS_MESSAGES } from '../constants/messages.constants.js';

export const getAdmins = async (req, res) => {
  const { page, limit, search, sort } = req.query;
  
  const result = await adminService.getAdmins({
    page: page ? parseInt(page, 10) : 1,
    limit: limit ? parseInt(limit, 10) : 10,
    search,
    sort
  });

  return successResponse(
    res, 
    HTTP_STATUS.OK, 
    SUCCESS_MESSAGES.FETCHED, 
    result.data, 
    result.pagination
  );
};

export const getAdminById = async (req, res) => {
  const { id } = req.params;
  const admin = await adminService.getAdminById(id);
  
  return successResponse(
    res,
    HTTP_STATUS.OK,
    SUCCESS_MESSAGES.FETCHED,
    admin
  );
};

export const createAdmin = async (req, res) => {
  const data = req.body;
  const newAdmin = await adminService.createAdmin(data);

  return successResponse(
    res,
    HTTP_STATUS.CREATED,
    SUCCESS_MESSAGES.CREATED,
    newAdmin
  );
};

export const deleteAdmin = async (req, res) => {
  const { id } = req.params;

  if (String(req.admin.id) === String(id)) {
    return errorResponse(res, HTTP_STATUS.FORBIDDEN, 'You cannot delete your own account.');
  }

  await adminService.deleteAdmin(id);

  return successResponse(
    res,
    HTTP_STATUS.OK,
    SUCCESS_MESSAGES.DELETED
  );
};
