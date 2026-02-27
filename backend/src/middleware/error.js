function notFoundHandler(req, res) {
  res.status(404).json({ message: 'Not Found' });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // eslint-disable-next-line no-console
  console.error('[backend] error', err);

  if (res.headersSent) return;
  res.status(500).json({ message: 'Internal Server Error' });
}

module.exports = { notFoundHandler, errorHandler };
