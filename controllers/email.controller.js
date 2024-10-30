import { ApiResponse } from "../utils/ApiResponse.js";
import { sendEmails } from "../utils/email.js";

const postAllEmails = async (req, res) => {
    await sendEmails();
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "Emails sent successfully"
        )
    );
}

export {
    postAllEmails
}