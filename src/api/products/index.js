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
    const products = await getProducts();
    if (req.query && req.query.category) {
      const productsByCategory = products.filter(
        (p) => p.category.toLowerCase() === req.query.category.toLowerCase()
      );
      res.send(productsByCategory);
    } else {
      res.send(products);
    }
  } catch (error) {
    next(error);
  }
}); //GET a product by ID
productsRouter.get("/:productId", async (req, res, next) => {
  try {
    const products = await getProducts();
    const specificProduct = products.find((p) => p.id === req.params.productId);
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
      const products = await getProducts();
      const index = products.findIndex((p) => p.id === req.params.productId);
      if (index !== -1) {
        const updatedProduct = {
          ...products[index],
          ...req.body,
          updatedAt: new Date(),
        };
        products[index] = updatedProduct;
        await writeProducts(products);
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
    const products = await getProducts();
    const remainingProducts = products.filter(
      (p) => p.id !== req.params.productId
    );
    if (products.length !== remainingProducts.length) {
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
      const products = await getProducts();
      const index = products.findIndex((p) => p.id === req.params.productId);
      if (index !== -1) {
        const fileExtension = extname(req.file.originalname);
        const fileName = req.params.productId + fileExtension;
        await saveProductImage(fileName, req.file.buffer);
        products[
          index
        ].imageUrl = `http://localhost:3001/img/products/${fileName}`;
        await writeProducts(products);
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
productsRouter.post("/");

export default productsRouter;
