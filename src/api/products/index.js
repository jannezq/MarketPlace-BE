import Express from "express";
import createHttpError from "http-errors";
import multer from "multer";
import uniqid from "uniqid";
import { extname } from "path";
import {
  checkProductSchema,
  checkReviewSchema,
  triggerBadRequest,
} from "../validation.js";

import {
  getProducts,
  writeProducts,
  getReviews,
  writeReviews,
  saveProductImage,
} from "../../lib/fs-tools.js";

const productsRouter = Express.Router();

//POST a product
productsRouter.post(
  "/",
  checkProductSchema,
  triggerBadRequest,
  async (req, res, next) => {
    try {
      const newProduct = {
        ...req.body,
        id: uniqid(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const productsArr = await getProducts();
      productsArr.push(newProduct);
      await writeProducts(productsArr);

      res.status(201).send({
        message: "successfully created product!",
        id: newProduct.id,
      });
    } catch (error) {
      next(error);
    }
  }
);
//GET a product by categor
productsRouter.get("/", async (req, res, next) => {
  try {
    const productArr = await getProducts();
    if (req.query && req.query.category) {
      const productsByCategory = productArr.filter(
        (p) => p.category.toLowerCase() === req.query.category.toLowerCase()
      );
      res.send(productsByCategory);
    } else {
      res.send(productArr);
    }
  } catch (error) {
    next(error);
  }
}); //GET a product by ID
productsRouter.get("/:productId", async (req, res, next) => {
  try {
    const productArr = await getProducts();
    const specificProduct = productArr.find(
      (p) => p.id === req.params.productId
    );
    res.send(specificProduct);
  } catch (error) {
    next(error);
  }
});
//PUT a product by ID
productsRouter.put(
  "/:productId",
  checkProductSchema,
  triggerBadRequest,
  async (req, res, next) => {
    try {
      const productArr = await getProducts();
      const index = productArr.findIndex((p) => p.id === req.params.productId);
      if (index !== -1) {
        const updatedProduct = {
          ...productArr[index],
          ...req.body,
          updatedAt: new Date(),
        };
        productArr[index] = updatedProduct;
        await writeProducts(productArr);
        res.send({
          success: true,
          message: "Product updated!",
          id: updatedProduct.id,
        });
      } else {
        next(
          createHttpError(404, `Product with id ${req.params.id} not found!`)
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

//DELETE a product by ID
productsRouter.delete("/:productId", async (req, res, next) => {
  try {
    const productArr = await getProducts();
    const remainingProducts = productArr.filter(
      (p) => p.id !== req.params.productId
    );
    if (productArr.length !== remainingProducts.length) {
      await writeProducts(remainingProducts);
      res.status(204).send();
    } else {
      next(
        createHttpError(
          404,
          `Product with id ${req.params.productId} not found!`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

//POST an image on product by ID
productsRouter.post(
  "/:productId/upload",
  multer().single("image"),
  async (req, res, next) => {
    try {
      const productArr = await getProducts();
      const index = productArr.findIndex((p) => p.id === req.params.productId);
      if (index !== -1) {
        const fileExtension = extname(req.file.originalname);
        const fileName = req.params.productId + fileExtension;
        await saveProductImage(fileName, req.file.buffer);
        productArr[
          index
        ].imageUrl = `http://localhost:3001/img/productArr/${fileName}`;
        await writeProducts(productArr);
        res.status(201).send({
          success: true,
          message: `Image uploaded to product with id ${req.params.productId}`,
        });
      } else {
        next(
          createHttpError(
            404,
            `Product with id ${req.params.productId} not found!`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

//REVIEW SECTION

//POST a  comment on product by ID
productsRouter.post(
  "/:productId/reviews",
  checkReviewSchema,
  triggerBadRequest,
  async (req, res, next) => {
    try {
      const productsArr = await getProducts();
      const index = productsArr.findIndex((p) => p.id === req.params.productId);
      if (index !== 1) {
        const newReview = {
          ...req.body,
          productId: req.params.productId,
          id: uniqid(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        const reviewsArr = await getReviews();
        reviewsArr.push(newReview);
        await writeReviews(reviewsArr);
        res.status(201).send({
          success: true,
          message: "Thank you for you review!",
          id: newReview.id,
        });
      } else {
        next(
          createHttpError(
            404,
            `no product found with id ${req.params.productId}`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

// GET all reviews of a product
productsRouter.get("/:productId/reviews", async (req, res, next) => {
  try {
    const productArr = await getProducts();
    const index = productArr.find((p) => p.id === req.params.productId);
    if (index !== -1) {
      const reviewsArr = await getReviews();
      reviewsArr.find((r) => r.productId === req.params.productId);
      res.status(201).send(reviewsArr);
    } else {
      next(
        createHttpError(
          404,
          `Sorry no product found with id ${req.params.productId}`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

//GET A review
productsRouter.get("/:productId/reviews/:reviewId", async (req, res, next) => {
  try {
    const productsArr = await getProducts();
    const index = productsArr.findIndex((p) => p.id === req.params.productId);
    if (index !== -1) {
      const reviewsArr = (await getReviews()).filter(
        (r) => r.productId === req.params.productId
      );
      const foundReview = reviewsArr.find((r) => r.id === req.params.reviewId);
      if (foundReview) {
        res.send(foundReview);
      } else {
        next(
          createHttpError(
            404,
            `no review found with id ${req.params.reviewId} belonging to product with id ${req.params.productId}`
          )
        );
      }
    } else {
      next(
        createHttpError(404, `no product found with id ${req.params.productId}`)
      );
    }
  } catch (error) {
    next(error);
  }
});

//PUT a product review
// productsRouter.put(
//   "/:productId/reviews/:reviewId",
//   checkReviewSchema,
//   triggerBadRequest,
//   async (req, res, next) => {
//     try {
//       const productArr = await getProducts();
//       const i = productArr.findIndex((p) => p.id === req.params.productId);
//       if (i !== -1) {
//         const reviewsArr = await getReviews();
//         const j = reviewsArr.findIndex((r) => r.id === req.params.reviewId);
//         if (j !== -1) {
//           if (reviewsArr[j].productId === req.params.productId) {
//             const updatedReview = {
//               ...reviewsArr[j],
//               ...req.body,
//               updatedAt: new Date(),
//             };
//             reviewsArr[j] = updatedReview;
//             await writeReviews(reviewsArr);
//             res.send({
//               updatedReview,
//             });
//           } else {
//             next(
//               createHttpError(
//                 404,
//                 `Review with id ${req.params.reviewId} does not belong to product with id ${req.params.productId}`
//               )
//             );
//           }
//         } else {
//           next(
//             createHttpError(
//               404,
//               `no review found with id ${req.params.reviewId}`
//             )
//           );
//         }
//       } else {
//         next(
//           createHttpError(
//             404,
//             `no product found with id ${req.params.productId}`
//           )
//         );
//       }
//     } catch (error) {
//       next(error);
//     }
//   }
// );

//DELETE product review
productsRouter.delete(
  "/:productId/reviews/:reviewId",
  async (req, res, next) => {
    try {
      const productArr = await getProducts();
      const i = productArr.findIndex((p) => p.id === req.params.productId);
      if (i !== -1) {
        const reviewsArr = await getReviews();
        const j = reviewsArr.findIndex((r) => r.id === req.params.reviewId);
        if (j !== -1) {
          if (reviewsArr[j].productId === req.params.productId) {
            const remainingReviews = reviewsArr.filter(
              (r) => r.id !== req.params.reviewId
            );
            await writeReviews(remainingReviews);
            res.status(204).send({
              message: `Review for product ID: ${req.params.productId} has been deleted!`,
            });
          } else {
            next(
              createHttpError(
                404,
                `review with id ${req.params.reviewId} does not belong to product with id ${req.params.productId}`
              )
            );
          }
        } else {
          next(
            createHttpError(
              404,
              `no review found with id ${req.params.reviewId}`
            )
          );
        }
      } else {
        next(
          createHttpError(
            404,
            `no product found with id ${req.params.productId}`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

export default productsRouter;
