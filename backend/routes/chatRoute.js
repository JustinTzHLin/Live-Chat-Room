import express from "express";
import tokenController from "../controllers/tokenController.js";
import chatController from "../controllers/chatController.js";
const router = express.Router();

router.post(
  "/sendMessage",
  tokenController.verifyLoggedInToken,
  chatController.sendMessage,
  (req, res) => res.status(200).json(res.locals.result)
);

export default router;
