/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Request } from 'express';
import Conversation from './conversation.model';
import Message from './message.model';
import User from '../user/user.model';
import ApiError from '../../../errors/ApiError';
import { io } from '../../../socket/socket';
import httpStatus from 'http-status';
import { IReqUser } from '../user/user.interface';
import Admin from '../admin/admin.model';
import { userSubscription } from '../../../utils/Subscription';
import { Promo } from '../promo/promo.model';

//!
const sendMessage = async (req: Request) => {
  const senderId = req.user?.userId;
  const { files } = req;
  const data = req.body;

  const isSubscribed = await userSubscription(req?.user?.userId);

  const havePromo = await Promo.findOne({ user: req?.user?.userId });
  const isPromoActive = havePromo && havePromo.status === 'active';

  if ((!isSubscribed || isSubscribed.status !== 'active') && !isPromoActive) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'User subscription is not active and no active promotion available',
    );
  }

  if (
    isSubscribed &&
    isSubscribed.status === 'active' &&
    !['gold', 'premium'].includes(isSubscribed?.plan_type) &&
    !isPromoActive
  ) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'Insufficient plan type and no active promotion available',
    );
  }

  const { message, conversationId } = data;
  if (!req.user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Token must be provide');
  }
  const checkSenderUser = await User.findById(senderId);
  const isAdmin = await Admin.findById(senderId);

  if (req?.user.role === 'user' && !checkSenderUser) {
    throw new ApiError(404, 'Sender not found');
  }
  if (req?.user.role === 'admin' && !isAdmin) {
    throw new ApiError(404, 'Sender not found');
  }

  const conversation = await Conversation.findOne({
    _id: conversationId,
    isGroup: false,
  });

  if (!conversation) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Conversation not found');
  }
  let image = undefined;
  let messageType = '';
  //@ts-ignore
  if (files && files?.image) {
    //@ts-ignore
    image = `/images/image/${files.image[0].filename}`;
  }
  //@ts-ignore
  if (!message && files && files?.image) {
    messageType = 'image';
  }
  //@ts-ignore
  if (message && !files?.image) {
    messageType = 'text';
  }
  //@ts-ignore
  if (message && files?.image) {
    messageType = 'both';
  }
  const newMessage = new Message({
    senderId,
    message,
    conversationId: conversationId,
    image,
    messageType,
  });

  await Promise.all([conversation.save(), newMessage.save()]);

  if (conversation && newMessage) {
    // io.to(senderId).emit('getMessage', newMessage);
    io.to(conversationId).emit('getMessage', newMessage);
  }

  return newMessage;
};
//!
// const sendMessage = async (req: Request) => {
//   const isSubscribed = await userSubscription(req?.user?.userId);

//   const havePromo = await Promo.findOne({ user: req?.user?.userId });
//   const isPromoActive = havePromo && havePromo.status === 'active';

//   if ((!isSubscribed || isSubscribed.status !== 'active') && !isPromoActive) {
//     throw new ApiError(
//       httpStatus.FORBIDDEN,
//       'User subscription is not active and no active promotion available',
//     );
//   }

//   if (
//     isSubscribed &&
//     isSubscribed.status === 'active' &&
//     !['gold', 'premium'].includes(isSubscribed?.plan_type) &&
//     !isPromoActive
//   ) {
//     throw new ApiError(
//       httpStatus.FORBIDDEN,
//       'Insufficient plan type and no active promotion available',
//     );
//   }
//   const senderId = req.user?.userId;
//   if (!senderId) {
//     throw new ApiError(httpStatus.UNAUTHORIZED, 'Token must be provided');
//   }

//   const { files } = req;
//   const data = req.body;

//   const { message, conversationId } = data;

//   const checkSenderUser = await User.findById(senderId);
//   const isAdmin = await Admin.findById(senderId);
//   //@ts-ignore
//   if (req?.user.role === 'USER' && !checkSenderUser) {
//     throw new ApiError(404, 'Sender not found');
//   }
//   //@ts-ignore
//   if (req?.user.role === 'ADMIN' && !isAdmin) {
//     throw new ApiError(404, 'Sender not found');
//   }

//   const conversation = await Conversation.findOne({
//     _id: conversationId,
//     isGroup: false,
//   });

//   if (!conversation) {
//     throw new ApiError(httpStatus.NOT_FOUND, 'Conversation not found');
//   }

//   let image;
//   let messageType = 'text';
//   //@ts-ignore
//   if (files && files?.image) {
//     //@ts-ignore
//     image = `/images/image/${files.image[0].filename}`;
//     messageType = message ? 'both' : 'image';
//   }

//   const newMessage = new Message({
//     senderId,
//     message,
//     conversationId,
//     image,
//     messageType,
//   });

//   await newMessage.save();
//   await conversation.save();

//   if (newMessage && conversation) {
//     io.to(conversationId).emit('getMessage', newMessage);
//   }

//   return newMessage;
// };
//!

//!
const getMessages = async (id: string, pages: string, limits: string) => {
  const page = Number(pages || 1);
  const limit = Number(limits || 10);
  const skip = (page - 1) * limit;

  const conversation = await Message.find({
    conversationId: id,
  })
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Message.countDocuments({ conversationId: id });

  const totalPage = Math.ceil(total / limit);
  const messages = conversation;

  return {
    messages,
    meta: {
      page,
      limit,
      totalPage,
    },
  };
};
//!
const conversationUser = async (req: Request) => {
  const { userId } = req.user as IReqUser;

  // Check if the user exists
  const isUserExist = await User.findById(userId);
  if (!isUserExist) {
    throw new ApiError(404, 'User does not exist');
  }

  // Find conversations that include the user
  const result = await Conversation.find({
    participants: { $all: [userId] },
  });

  // Filter out the current user from participants in each conversation
  const participantIds = result
    .map(conversation =>
      conversation.participants.filter(user => user.toString() !== userId),
    )
    .flat();

  // Remove duplicate participant IDs
  const uniqueParticipantIds = [
    ...new Set(participantIds.map(id => id.toString())),
  ];

  // Fetch user details for the remaining participant IDs
  const users = await User.find({ _id: { $in: uniqueParticipantIds } });
  return users;
};

export const messageService = {
  sendMessage,
  getMessages,
  conversationUser,
};
