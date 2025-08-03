import Joi from "joi";
import { Types } from "mongoose";

// Joi schema for validating ObjectId
export const idSchema = Joi.object({
  id: Joi.string()
    .custom((value, helpers) => {
      if (!Types.ObjectId.isValid(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    }, 'ObjectId validation')
    .required(),
});