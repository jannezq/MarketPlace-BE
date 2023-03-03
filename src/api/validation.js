import { checkSchema, validationResult } from "express-validator";
import createHttpError from "http-errors";

const productSchema = {
  name: {
    in: ["body"],
    isString: {
      errorMessage: "Name is a mandatory field and it needs to be a string!",
    },
  },
  description: {
    in: ["body"],
    isString: {
      errorMessage:
        "Description is a mandatory field and it needs to be a string!",
    },
  },
  brand: {
    in: ["body"],
    isString: {
      errorMessage: "Brand is a mandatory field and it needs to be a string!",
    },
  },
  imageUrl: {
    in: ["body"],
    isString: {
      errorMessage: "Image URL needs to be a string!",
    },
  },
  price: {
    in: ["body"],
    isNumeric: {
      errorMessage: "Price is a mandatory field and it needs to be a number!",
    },
  },
  category: {
    in: ["body"],
    isString: {
      errorMessage:
        "Category is a mandatory field and it needs to be a string!",
    },
  },
};

const reviewSchema = {
  comment: {
    in: ["body"],
    isString: {
      errorMessage: "Comment is a mandatory field and it needs to be a string",
    },
  },
  rate: {
    in: ["body"],
    isFloat: {
      options: {
        min: 0,
        max: 5,
      },
      errorMessage:
        "Rate is a mandatory field and it needs to be a number between 0-5!",
    },
  },
};

export const checkProductSchema = checkSchema(productSchema);
export const checkReviewSchema = checkSchema(reviewSchema);

export const triggerBadRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    next();
  } else {
    next(
      createHttpError(400, {
        errors: errors.array(),
      })
    );
  }
};
