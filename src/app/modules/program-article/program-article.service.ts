/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Request } from 'express';
import QueryBuilder from '../../../builder/QueryBuilder';
import ApiError from '../../../errors/ApiError';
import { ProgramArticle } from './program-article.model';
import { IReqUser } from '../user/user.interface';

import httpStatus from 'http-status';
import { CustomRequest } from '../../../interfaces/common';

const insertIntoDB = async (req: CustomRequest) => {
  const { files, body } = req;
  // console.log('body', body);
  let thumbnail = undefined;

  if (files && files.thumbnail) {
    thumbnail = `/images/thumbnail/${files.thumbnail[0].filename}`;
  }

  // let video = undefined;

  // if (files && files.video) {
  //   video = `/video/${files.video[0].filename}`;
  // }
  const totalProgram = await ProgramArticle.countDocuments();
  // console.log(totalProgram);
  const result = await ProgramArticle.create({
    thumbnail,
    // video,
    ...body,
    serial: totalProgram + 1,
  });

  return result;
};
const getTraining = async (user: IReqUser, query: Record<string, unknown>) => {
  const trainingQuery = new QueryBuilder(
    ProgramArticle.find({}).populate('training_program').sort({ serial: 1 }),
    query,
  )
    .search(['article_title', 'article_name'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await trainingQuery.modelQuery;
  const meta = await trainingQuery.countTotal();

  return {
    meta,
    data: result,
  };
};

//!
const getSingleTraining = async (req: Request) => {
  const { id } = req.params;

  const result = await ProgramArticle.findById(id);
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Training Program not found');
  }
  return result;
};

const getSingleTrainingByProgram = async (req: Request) => {
  const { id } = req.params;

  const result = await ProgramArticle.findOne({ training_program: id });
  if (!result) {
    throw new ApiError(404, 'Training Programs not found');
  }
  return result;
};
const getTrainingByProgram = async (req: Request) => {
  const { id } = req.params;
  const result = await ProgramArticle.find({ training_program: id }).sort({
    serial: 1,
  });
  if (!result) {
    throw new ApiError(404, 'Program article not found');
  }
  return result;
};
const updateTraining = async (req: CustomRequest) => {
  const { files, body } = req;
  // console.log(files, body);
  const { id } = req.params;

  let thumbnail = undefined;

  if (files && files.thumbnail) {
    thumbnail = `/images/thumbnail/${files.thumbnail[0].filename}`;
  }

  // let video = undefined;

  // if (files && files.video) {
  //   video = `/video/${files.video[0].filename}`;
  // }
  const isExist = await ProgramArticle.findById(id);
  if (!isExist) {
    throw new ApiError(404, 'Training program not found');
  }
  const { ...updateData } = body;
  const result = await ProgramArticle.findOneAndUpdate(
    { _id: id },
    {
      thumbnail,
      // video,
      ...updateData,
    },
    {
      new: true,
      runValidators: true,
    },
  );
  return result;
};
const deleteTraining = async (req: Request) => {
  const { id } = req.params;
  const isExist = await ProgramArticle.findById(id);
  if (!isExist) {
    throw new ApiError(404, 'Training program not found');
  }
  return await ProgramArticle.findByIdAndDelete(id);
};

const swapArticleOrder = async (payload: any) => {
  const { draggedArticleId, targetArticleId } = payload;

  try {
    // Find both articles
    const draggedArticle = await ProgramArticle.findById(draggedArticleId);
    const targetArticle = await ProgramArticle.findById(targetArticleId);

    if (!draggedArticle || !targetArticle) {
      throw new ApiError(httpStatus.BAD_GATEWAY, 'Nice problem');
    }

    // Swap serial numbers
    const tempSerial = draggedArticle.serial;
    draggedArticle.serial = targetArticle.serial;
    targetArticle.serial = tempSerial;

    // Save both articles
    await draggedArticle.save();
    await targetArticle.save();
  } catch (error) {
    console.error('Error swapping article order:', error);
  }
};

export const ProgramArticleService = {
  insertIntoDB,
  getTraining,
  updateTraining,
  deleteTraining,
  getSingleTraining,
  getSingleTrainingByProgram,
  getTrainingByProgram,
  swapArticleOrder,
};
