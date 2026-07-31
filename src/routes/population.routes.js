import express from 'express';
import { populationController } from '../controllers/population.controller.js';
import { protectRoute } from '../middlewares/auth.middleware.js';
import { authorizePermissions } from '../middlewares/rbac.middleware.js';
import { PERMISSIONS } from '../constants/rbac.constants.js';
import { body, param } from 'express-validator';
import { validateRequest as validate } from '../middlewares/validation.middleware.js';

const router = express.Router();

// Apply authentication to all admin population routes
router.use(protectRoute);
router.use(authorizePermissions(PERMISSIONS.MANAGE_POPULATION));

// Dashboard Summary
router.get('/summary', populationController.getSummary);

// Crawl Trigger
router.post(
  '/crawl',
  [
    body('sourceId').isUUID().withMessage('Valid source ID is required'),
    body('month').optional().isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12'),
    body('year').optional().isInt({ min: 1900 }).withMessage('Year must be a valid year')
  ],
  validate,
  populationController.crawl
);

// Sources Management
router.get('/sources', populationController.getSources);

router.post(
  '/sources',
  [
    body('name').notEmpty().withMessage('Spreadsheet name is required'),
    body('spreadsheet_url').isURL().withMessage('Valid spreadsheet URL is required'),
    body('is_active').isBoolean().optional()
  ],
  validate,
  populationController.createSource
);

router.put(
  '/sources/:id',
  [
    param('id').isUUID().withMessage('Valid source ID is required'),
    body('name').optional().notEmpty().withMessage('Source name cannot be empty'),
    body('spreadsheet_url').optional().isURL().withMessage('Spreadsheet URL must be a valid URL'),
    body('is_active').optional().isBoolean().withMessage('Active status must be boolean')
  ],
  validate,
  populationController.updateSource
);

router.delete(
  '/sources/:id',
  [param('id').isUUID().withMessage('Valid source ID is required')],
  validate,
  populationController.deleteSource
);

router.post(
  '/sources/:id/activate',
  [param('id').isUUID().withMessage('Valid source ID is required')],
  validate,
  populationController.activateSource
);

// History and Trends
router.get('/history/filters', populationController.getFilters);
router.get('/history', populationController.getHistory);
router.get('/trends', populationController.getTrends);

router.get(
  '/history/:id',
  [param('id').isUUID().withMessage('Valid snapshot ID is required')],
  validate,
  populationController.getSnapshotDetails
);

router.delete(
  '/history/:id',
  [param('id').isUUID().withMessage('Valid snapshot ID is required')],
  validate,
  populationController.deleteSnapshot
);

export const adminPopulationRouter = router;

const publicRouter = express.Router();
publicRouter.get('/summary', populationController.getSummary);
export const publicPopulationRouter = publicRouter;
