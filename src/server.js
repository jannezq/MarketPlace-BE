import Express from "express";
import listEndpoints from "express-list-endpoints";
import {
  badRequestHandler,
  unauthorizedHandler,
  notFoundHandler,
  genericErrorHandler,
} from "./errorHandlers.js";
import { join } from "path";
import productsRouter from "./api/products/index.js";

const server = Express();
const port = 3001;
const publicFolderPath = join(process.cwd(), "public");

// ******************************GLOBAL MIDDLEWARES***************************

server.use(Express.static(publicFolderPath));
server.use(Express.json());

// ************************** ENDPOINTS ***********************
server.use("/products", productsRouter);

// ************************* ERROR HANDLERS *******************
server.use(badRequestHandler); // 400
server.use(unauthorizedHandler); // 401
server.use(notFoundHandler); // 404
server.use(genericErrorHandler); // 500 (this should ALWAYS be the last one)

server.listen(port, () => {
  console.table(listEndpoints(server));
  console.log(`Server is running on port ${port}`);
});
