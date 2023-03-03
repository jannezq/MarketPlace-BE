import Express from "express";
import listEndpoints from "express-list-endpoints";

const server = Express();
const port = 3001;

server.use(Express.json());

server.listen(port, () => {
  console.table(listEndpoints(server));
  console.log(`Server is running on port ${port}`);
});
