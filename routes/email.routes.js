import { Router } from "express";
import { postAllEmails } from "../controllers/email.controller.js";

const router = Router();

router.route("/postAllEmails").get(postAllEmails);

export default router;