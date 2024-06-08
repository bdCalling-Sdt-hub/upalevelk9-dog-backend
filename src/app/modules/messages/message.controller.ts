import { Request, RequestHandler, Response } from 'express';
import sendResponse from '../../../shared/sendResponse';
import catchAsync from '../../../shared/catchasync';
import { messageService } from './message.service';
const sendMessage: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await messageService.sendMessage(req);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `Message Send`,
      data: result,
    });
  },
);

const getMessages: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const conversationId = req.params.id;
    const limit = req.query.limit;
    const page = req.query.page;
    const result = await messageService.getMessages(
      conversationId,
      page,
      limit,
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Message retrieved successful',
      data: result,
    });
  },
);
const conversationUser: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await messageService.conversationUser(req);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Conversation Retrieved Successful',
      data: result,
    });
  },
);

export const messageController = {
  sendMessage,
  getMessages,
  conversationUser,
};
