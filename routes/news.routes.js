import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { 
    getAllNews,
    getAreaChartData,
    getPieChartData,
    insertDailyAvg
} from "../controllers/news.controller.js";

const router = Router();

// secured routes
router.route("/allNews").get(verifyJWT, getAllNews);

router.route("/insertDailyAvg").post(insertDailyAvg);

router.route("/getAreaChartData").get(verifyJWT, getAreaChartData);

router.route("/getPieChartData").get(verifyJWT, getPieChartData);

export default router;