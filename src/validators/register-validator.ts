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
    isEmail: {
      errorMessage: "Invalid email",
    },
  },
  password: {
    errorMessage: "Password is required",
    notEmpty: true,
    isLength: {
      options: {
        min: 8,
      },
      errorMessage: "Password length should be at least 8 characters",
    },
  },
});

// export default [body('email').notEmpty().withMessage("Email Id is required")];
