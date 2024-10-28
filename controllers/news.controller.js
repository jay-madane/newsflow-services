import { News } from "../models/news.model.js";
import { DailyAverage } from "../models/dailyAverage.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const calculateSentimentAverage = async () => {
    const pipeline = [
        {
            $group: {
                _id: "$tonality",
                count: { $sum: 1 },
            },
        },
        {
            $project: {
                _id: 0,
                tonality: "$_id",
                count: 1,
            },
        },
    ];
    try {
        const results = await News.aggregate(pipeline);
        const totalCount = results.reduce((acc, curr) => acc + curr.count, 0); // calculate total count
        const sentiments = results.map((result) => ({
            tonality: result.tonality,
            percentage: (result.count / totalCount) * 100, // calculate percentages
        }));
        sentiments.forEach((item, i)=>{
            item._id = i + 1;
        });
        return sentiments;
    } catch (error) {
        console.error("Error calculating sentiment average: ", error);
    }
}

const insertDailyAvg = asyncHandler( async (req, res) => {
    try {
        const sentiments = await calculateSentimentAverage();
        const dailyAverage = DailyAverage.create({
            tonality: sentiments.map(sentiment => ({
                name: sentiment.tonality,
                percentage: sentiment.percentage
            }))
        });
        await dailyAverage.save();

        return res
        .status(200)
        .json(
            new ApiResponse(
                201,
                sentiments,
                "Daily average sentiment calculated successfully",
            )
        );
    } catch (error) {
        throw new ApiError(500, "Error calculating daily average sentiment: ", error);
    }
});

const getAllNews = asyncHandler( async (req, res) => {
    const news = await News.find(); // fetch all news documents
    if (!news) {
        throw new ApiError(500, "Failed to fetch all news");
    }
    // send the documents as JSON response
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            news,
            "News fetched successfully"
        )
    );
});

const getAreaChartData = asyncHandler( async (req, res) => {
    const now = new Date();
    const currentDay = now.getUTCDay();

    // calculate the previous week's Monday
    const previousMonday = new Date(now);
    previousMonday.setUTCDate(now.getUTCDate() - currentDay - 6 - (currentDay === 0 ? 7 : 0));
    previousMonday.setUTCHours(0, 0, 0, 0);

    // calculate the previous week's Sunday
    const previousSunday = new Date(previousMonday);
    previousSunday.setUTCDate(previousMonday.getUTCDate() + 6);
    previousSunday.setUTCHours(23, 59, 59, 999);
    
    // fetch data from Monday to Sunday
    const sentimentData = await DailyAverage.find({
        date: {
            $gte: previousMonday,
            $lt: new Date(previousSunday.getTime() + 1) // include Sunday
        }
    }).sort({ date: 1 });

    // initialize series data
    const series = [
        { name: "positive", data: [] },
        { name: "negative", data: [] },
        { name: "neutral", data: [] }
    ];

    // fill series data
    sentimentData.forEach(day => {
        day.tonality.forEach(tonality => {
            const seriesItem = series.find(item => item.name === tonality.name);
            if (seriesItem) {
                seriesItem.data.push(tonality.percentage.toFixed(3));
            }
        });
    });

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            series,
            "Area chart data fetched successfully",
        )
    );
});

const getPieChartData = asyncHandler( async (req, res) => {
    const deptNewsCount = await News.aggregate(
        [
            {
                $group: {
                    _id: "$department",
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    name: "$_id",
                    count: 1,
                    _id: 0
                }
            }
        ]
    );

    if(deptNewsCount === undefined) {
        throw new ApiError(500, "Error counting department news");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            deptNewsCount,
            "Department news count retrieved successfully",
        )
    );
});

export {
    insertDailyAvg,
    getAllNews,
    getAreaChartData,
    getPieChartData,
}