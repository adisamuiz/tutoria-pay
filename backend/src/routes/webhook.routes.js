import express from "express";
const router = express.Router();
import { verifyAndReceiveWebhook } from "../controllers/webhook.controller.js";

router.post('/monnify-payments', verifyAndReceiveWebhook);

export default router;