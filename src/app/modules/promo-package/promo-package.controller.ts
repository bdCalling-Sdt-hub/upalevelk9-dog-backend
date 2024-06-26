import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchasync';
import sendResponse from '../../../shared/sendResponse';
import { PromosPlanService } from './promo-package.service';

const adPromos = catchAsync(async (req: Request, res: Response) => {
  const result = await PromosPlanService.addPromo(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Promo Add successfully',
    data: result,
  });
});
const addPromoCode = catchAsync(async (req: Request, res: Response) => {
  const result = await PromosPlanService.addPromoCode(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Promo Code Add successfully',
    data: result,
  });
});

const getPromoCodes = catchAsync(async (req: Request, res: Response) => {
  const result = await PromosPlanService.getPromoCodes();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Promo Code Retrieved successfully',
    data: result,
  });
});
const getPromos = catchAsync(async (req: Request, res: Response) => {
  const result = await PromosPlanService.getPromos();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Promos Retrieved successfully',
    data: result,
  });
});

const updatePromoPackage = catchAsync(async (req: Request, res: Response) => {
  const result = await PromosPlanService.updatePromoPackage(
    req.params.id,
    req.body,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Promos item Update successfully',
    data: result,
  });
});
const deletePromos = catchAsync(async (req: Request, res: Response) => {
  const result = await PromosPlanService.deletePromos(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Promos delete successfully',
    data: result,
  });
});
const deletePromoCode = catchAsync(async (req: Request, res: Response) => {
  const result = await PromosPlanService.deletePromoCode(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Promo Code delete successfully',
    data: result,
  });
});

export const PromosPlanController = {
  adPromos,
  updatePromoPackage,
  getPromos,
  deletePromos,
  addPromoCode,
  getPromoCodes,
  deletePromoCode,
};
