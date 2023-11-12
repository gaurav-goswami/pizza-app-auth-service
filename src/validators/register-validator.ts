import { checkSchema } from "express-validator";

export default checkSchema({
  firstName: {
    errorMessage: "First name is required",
    notEmpty: true,
  },
  lastName: {
    errorMessage: "Last name is required",
    notEmpty: true,
  },
  email: {
    errorMessage: "Email Id is required",
    notEmpty: true,
    trim: true,
  },
  password: {
    errorMessage: "Password is required",
    notEmpty: true,
  },
});

// export default [body('email').notEmpty().withMessage("Email Id is required")];
