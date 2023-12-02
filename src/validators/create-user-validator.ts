import { checkSchema } from "express-validator";

export default checkSchema({
  firstName: {
    errorMessage: "First name is required",
    notEmpty: true,
    trim: true,
  },
  lastName: {
    errorMessage: "Last name is required",
    notEmpty: true,
    trim: true,
  },
  email: {
    errorMessage: "Email is required",
    notEmpty: true,
    trim: true,
    isEmail: {
      errorMessage: "Enter a valid email",
    },
  },
  password: {
    errorMessage: "Password is required",
    notEmpty: true,
    trim: true,
    isLength: {
      options: {
        min: 8,
      },
      errorMessage: "Password should contain at least 8 characters",
    },
  },
  role: {
    errorMessage: "Role is required",
    notEmpty: true,
    trim: true,
  },
});
