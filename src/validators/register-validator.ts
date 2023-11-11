import { checkSchema } from "express-validator";

export default checkSchema({
  email: {
    errorMessage: "Email Id is required",
    notEmpty: true,
    trim: true,
  },
});

// export default [body('email').notEmpty().withMessage("Email Id is required")];
