export const badRequestHandler = (err, req, res, next) => {
  if (err.status === 400) {
    res.status(400).send({
      success: false,
      message: err.message,
      errors: err.errors.map((e) => e.msg),
    });
  } else next(err);
};

export const unauthorizedHandler = (err, req, res, next) => {
  if (err.status === 401) {
    res.status(401).send({
      success: false,
      message: err.message,
    });
  } else next(err);
};

export const notFoundHandler = (err, req, res, next) => {
  if (err.status === 404) {
    res.status(404).send({
      success: false,
      message: err.message,
    });
  } else next(err);
};

export const genericErrorHandler = (err, req, res, next) => {
  console.log("ERROR: ", err.message);
  res.status(500).send({
    success: false,
    message:
      "Sorry A problem has occured in the server! Please be patience for fixing.",
  });
};
