import express from "express";

const Router = express.Router();

Router.post("/", (req, res) => {
  res.status(201).json({});
});

export default Router;
