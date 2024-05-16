import { z } from 'zod';

const post = z.object({
  body: z.object({
    user: z.string({
      required_error: 'user is required',
    }),

    title: z
      .string({
        required_error: 'Title is required',
      })
      .min(1)
      .max(100),
    description: z
      .string({
        required_error: 'description is required',
      })
      .min(1)
      .max(1000),
  }),
  files: z.object({
    image: z
      .array(
        z.object({}).refine(() => true, {
          message: 'Image is required',
        }),
      )
      .nonempty({ message: 'Image array cannot be empty' }),
  }),
});

export const PostValidation = {
  post,
};
