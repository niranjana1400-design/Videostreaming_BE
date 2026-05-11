const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // 1. Check if user exists 
      if (!req.user) {
        return res.status(401).json({
          message: "Not authorized: user not found"
        });
      }

      // 2. Check if role exists
      if (!req.user.role) {
        return res.status(403).json({
          message: "Access denied: role not defined"
        });
      }

      const userRole = req.user.role;

      console.log("USER ROLE:", userRole);
      console.log("ALLOWED ROLES:", allowedRoles);

      // 3. Check permission
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          message: "Access denied: insufficient permissions",
          requiredRoles: allowedRoles,
          yourRole: userRole
        });
      }

      // 4. All good
      next();

    } catch (error) {
      console.error("Role Middleware Error:", error);

      return res.status(500).json({
        message: "Server error in role middleware"
      });
    }
  };
};

module.exports = { checkRole };