export const protect = (req, res, next) => {
  // Check if session contains valid authenticated user details
  if (req.session && req.session.userId) {
    // Inject the user onto req in the shape the rest of the app expects.
    req.user = {
      _id: req.session.userId,
      username: req.session.username,
      avatar: req.session.avatar || ''
    };
    return next();
  }

  // Reject access if session does not exist or has expired
  return res.status(401).json({
    message: "Not authorized, session expired or non-existent. Please log in."
  });
};