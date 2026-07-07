export const protect = (req, res, next) => {
  // Check if session contains valid authenticated user details
  if (req.session && req.session.userId) {
    // Inject user identity into req object for downstream handlers.
    // NOTE: postRoutes.js reads req.user._id, so we expose it in that shape
    // (previously this only set req.userId / req.username, which caused
    // "Cannot read properties of undefined" on every create/update/delete).
    req.user = {
      _id: req.session.userId,
      username: req.session.username
    };
    req.userId = req.session.userId;
    req.username = req.session.username;
    return next();
  }

  // Reject access if session does not exist or has expired
  return res.status(401).json({
    message: "Not authorized, session expired or non-existent. Please log in."
  });
};