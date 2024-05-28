/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Request } from 'express';
import QueryBuilder from '../../../builder/QueryBuilder';
import ApiError from '../../../errors/ApiError';
import { ProgramArticle } from './program-article.model';
// import { INotification } from '../notifications/notifications.interface';
// import User from '../user/user.model';
// import Notification from '../notifications/notifications.model';

const insertIntoDB = async (req: Request) => {
  const { files, body } = req;

  let thumbnail = undefined;
  //@ts-ignore
  if (files && files.thumbnail) {
    //@ts-ignore
    thumbnail = `/images/thumbnail/${files.thumbnail[0].filename}`;
  }
  let video_thumbnail = undefined;
  //@ts-ignore
  if (files && files.video_thumbnail) {
    //@ts-ignore
    video_thumbnail = `/images/video_thumbnail/${files.video_thumbnail[0].path}`;
  }
  let video = undefined;
  //@ts-ignore
  if (files && files.video) {
    //@ts-ignore
    video = `/video/${files.video[0].filename}`;
  }
  const result = await ProgramArticle.create({
    thumbnail,
    video_thumbnail,
    video,
    ...body,
  });

  return result;
};
const getTraining = async (query: Record<string, unknown>) => {
  const trainingQuery = new QueryBuilder(ProgramArticle.find({}), query)
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
const getSingleTraining = async (id: string) => {
  const result = await ProgramArticle.findById(id);
  if (!result) {
    throw new ApiError(404, 'Training Programs not found');
  }
  return result;
};
const getSingleTrainingByProgram = async (id: string) => {
  const result = await ProgramArticle.findOne({ training_program: id });
  if (!result) {
    throw new ApiError(404, 'Training Programs not found');
  }
  return result;
};
const getTrainingByProgram = async (id: string) => {
  const result = await ProgramArticle.find({ training_program: id });
  if (!result) {
    throw new ApiError(404, 'Program article not found');
  }
  return result;
};
const updateTraining = async (req: Request) => {
  const { files, body } = req;
  const { id } = req.params;

  let thumbnail = undefined;
  //@ts-ignore
  if (files && files.thumbnail) {
    //@ts-ignore
    thumbnail = `/images/thumbnail/${files.thumbnail[0].filename}`;
  }
  let video_thumbnail = undefined;
  //@ts-ignore
  if (files && files.video_thumbnail) {
    //@ts-ignore
    video_thumbnail = `/images/video_thumbnail/${files.video_thumbnail[0].path}`;
  }
  let video = undefined;
  //@ts-ignore
  if (files && files.video) {
    //@ts-ignore
    video = `/video/${files.video[0].filename}`;
  }
  const isExist = await ProgramArticle.findById(id);
  if (!isExist) {
    throw new ApiError(404, 'Training program not found');
  }
  const { ...updateData } = body;
  const result = await ProgramArticle.findOneAndUpdate(
    { _id: id },
    {
      thumbnail,
      video_thumbnail,
      video,
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

export const ProgramArticleService = {
  insertIntoDB,
  getTraining,
  updateTraining,
  deleteTraining,
  getSingleTraining,
  getSingleTrainingByProgram,
  getTrainingByProgram,
};
