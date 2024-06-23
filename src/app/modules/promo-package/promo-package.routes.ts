import express from 'express';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';
import { PromosPlanController } from './promo-package.controller';

const router = express.Router();

router.post(
  '/add',
  auth(ENUM_USER_ROLE.ADMIN),
  // validateRequest(PromoPackageValidation.post),
  PromosPlanController.adPromos,
);

router.get(
  '/all',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
  PromosPlanController.getPromos,
);

router.delete(
  '/delete/:id',
  auth(ENUM_USER_ROLE.ADMIN),
  PromosPlanController.deletePromos,
);
router.patch(
  '/update/:id',
  auth(ENUM_USER_ROLE.ADMIN),
  // validateRequest(PromoPackageValidation.update),
  PromosPlanController.updatePromoPackage,
);

export const PromoPackageRoutes = router;
