import express from 'express';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';
import { PostController } from './post.controller';
import { uploadFile } from '../../middlewares/fileUploader';
import { validateRequest } from '../../middlewares/validateRequest';
import { PostValidation } from './post.validation';

const router = express.Router();

router.post(
  '/add-post',
  auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  uploadFile(),
  validateRequest(PostValidation.post),
  PostController.createPost,
);
router.post(
  '/add-comment',
  auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  PostController.addComment,
);
router.get(
  '/my-posts',
  auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  PostController.getMyPosts,
);
router.get(
  '/community-posts',
  auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  PostController.Posts,
);
router.get(
  '/single-post/:id',
  auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  PostController.singlePost,
);
router.delete(
  '/delete-post/:id',
  auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  PostController.deletePost,
);
router.delete(
  '/delete-comment/:postId/:commentId',
  auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  PostController.deleteComment,
);
router.patch(
  '/edit-post/:id',
  auth(ENUM_USER_ROLE.USER),
  uploadFile(),
  // validateRequest(PostValidation.update),
  PostController.updatePost,
);

export const PostRoutes = router;
