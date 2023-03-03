import fs from "fs-extra";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const { readJSON, writeJSON, writeFile } = fs;

const dataFolderPath = join(dirname(fileURLToPath(import.meta.url)), "../data"); // this is the path to data under the src root.

const productsJSONPath = join(dataFolderPath, "products.json");
const reviewsJSONPath = join(dataFolderPath, "reviews.json");
const productImagePublicFolderPath = join(
  process.cwd(),
  "./public/img/products"
);

export const getProducts = () => readJSON(productsJSONPath);
export const getReviews = () => readJSON(reviewsJSONPath);

export const writeProducts = (productsArr) =>
  writeJSON(productsJSONPath, productsArr);
export const writeReviews = (reviewsArr) =>
  writeJSON(reviewsJSONPath, reviewsArr);

export const saveProductImage = (fileName, fileContentAsBuffer) =>
  writeFile(join(productImagePublicFolderPath, fileName), fileContentAsBuffer);
