import { User } from "../models/user.model.js";
import { News } from "../models/news.model.js";
import { ApiError } from "./ApiError.js";
import nodemailer from "nodemailer";

// configuration
const transporter = nodemailer.createTransport({
    service: "gmail",
    secure: true,
    port: 465,
    auth: {
        user: process.env.MAIL_ID || "sample@gmail.com",
        pass: process.env.MAIL_PASSWORD
    }
});

// function to calculate tonality percentage
const calculateTonalityPercentage = (total, count) => {
    return total > 0 ? (count / total) * 100 : 0;
}

const newsSummary = async () => {
    try {
        // fetch all news
        const newsArticles = await News.find();

        if(newsArticles.length === 0) {
            console.error("No news articles found");
            return null;
        }

        // calculate counts
        const totalNewsCount = newsArticles.length;
        const negativeNewsCount = newsArticles.filter(news => news.tonality === 'negative').length;
        const positiveNewsCount = newsArticles.filter(news => news.tonality === 'positive').length;
        const neutralNewsCount = newsArticles.filter(news => news.tonality === 'neutral').length;

        // calculate percentages
        const negativePercentage = calculateTonalityPercentage(totalNewsCount, negativeNewsCount);
        const positivePercentage = calculateTonalityPercentage(totalNewsCount, positiveNewsCount);
        const neutralPercentage = calculateTonalityPercentage(totalNewsCount, neutralNewsCount);
        
        return {
            negativeNewsCount,
            negativePercentage,
            positivePercentage,
            neutralPercentage
        }
    } catch (error) {
        throw new ApiError(500, "Error while calculating news summary: ", error);
    }
}

// send mail
const sendEmails = async () => {
    try {
        const users = await User.find();
        const summary = await newsSummary();

        if (summary === null) {
            console.error("No news summary found");
            return;
        }

        for(let user of users) {

            // generated using tabular
            const emailContent = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
            <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
            <head>
            <title></title>
            <meta charset="UTF-8" />
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
            <!--[if !mso]>-->
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <!--<![endif]-->
            <meta name="x-apple-disable-message-reformatting" content="" />
            <meta content="target-densitydpi=device-dpi" name="viewport" />
            <meta content="true" name="HandheldFriendly" />
            <meta content="width=device-width" name="viewport" />
            <meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no" />
            <style type="text/css">
            table {
            border-collapse: separate;
            table-layout: fixed;
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt
            }
            table td {
            border-collapse: collapse
            }
            .ExternalClass {
            width: 100%
            }
            .ExternalClass,
            .ExternalClass p,
            .ExternalClass span,
            .ExternalClass font,
            .ExternalClass td,
            .ExternalClass div {
            line-height: 100%
            }
            .gmail-mobile-forced-width {
            display: none;
            display: none !important;
            }
            body, a, li, p, h1, h2, h3 {
            -ms-text-size-adjust: 100%;
            -webkit-text-size-adjust: 100%;
            }
            html {
            -webkit-text-size-adjust: none !important
            }
            body, #innerTable {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale
            }
            #innerTable img+div {
            display: none;
            display: none !important
            }
            img {
            Margin: 0;
            padding: 0;
            -ms-interpolation-mode: bicubic
            }
            h1, h2, h3, p, a {
            line-height: inherit;
            overflow-wrap: normal;
            white-space: normal;
            word-break: break-word
            }
            a {
            text-decoration: none
            }
            h1, h2, h3, p {
            min-width: 100%!important;
            width: 100%!important;
            max-width: 100%!important;
            display: inline-block!important;
            border: 0;
            padding: 0;
            margin: 0
            }
            a[x-apple-data-detectors] {
            color: inherit !important;
            text-decoration: none !important;
            font-size: inherit !important;
            font-family: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important
            }
            u + #body a {
            color: inherit;
            text-decoration: none;
            font-size: inherit;
            font-family: inherit;
            font-weight: inherit;
            line-height: inherit;
            }
            a[href^="mailto"],
            a[href^="tel"],
            a[href^="sms"] {
            color: inherit;
            text-decoration: none
            }
            </style>
            <style type="text/css">
            @media (min-width: 481px) {
            .hd { display: none!important }
            }
            </style>
            <style type="text/css">
            @media (max-width: 480px) {
            .hm { display: none!important }
            }
            </style>
            <style type="text/css">
            @media (max-width: 480px) {
            .t14,.t18,.t24,.t26,.t33,.t37,.t39{width:420px!important}.t26{padding-bottom:70px!important}.t3{mso-line-height-alt:50px!important;line-height:50px!important}.t1{width:40px!important}.t10,.t29,.t41,.t5{width:420px!important}.t16{mso-line-height-alt:18px!important;line-height:18px!important}.t13,.t17{line-height:26px!important;font-size:16px!important}.t20,.t31{mso-line-height-alt:30px!important;line-height:30px!important}.t12,.t7{mso-line-height-alt:28px!important}.t21,.t22{line-height:46px!important;mso-text-raise:10px!important}.t21{font-size:12px!important}.t4,.t9{font-size:32px!important}.t41{padding-top:60px!important;padding-bottom:60px!important}.t29{padding-bottom:40px!important}.t12{line-height:28px!important;display:block!important}.t10,.t5{padding-bottom:28px!important}.t9{line-height:40px!important}.t7{line-height:28px!important}.t4{line-height:40px!important;mso-text-raise:2px!important}
            }
            </style>
            <style type="text/css">@media (max-width: 480px) {[class~="x_t26"]{padding-bottom:70px!important;width:420px!important;} [class~="x_t24"]{width:420px!important;} [class~="x_t3"]{mso-line-height-alt:50px!important;line-height:50px!important;} [class~="x_t1"]{width:40px!important;} [class~="x_t16"]{mso-line-height-alt:18px!important;line-height:18px!important;} [class~="x_t14"]{width:420px!important;} [class~="x_t13"]{line-height:26px!important;font-size:16px!important;} [class~="x_t20"]{mso-line-height-alt:30px!important;line-height:30px!important;} [class~="x_t18"]{width:420px!important;} [class~="x_t17"]{line-height:26px!important;font-size:16px!important;} [class~="x_t22"]{line-height:46px!important;mso-text-raise:10px!important;} [class~="x_t21"]{line-height:46px!important;font-size:12px!important;mso-text-raise:10px!important;} [class~="x_t41"]{padding-top:60px!important;padding-bottom:60px!important;width:420px!important;} [class~="x_t39"]{width:420px!important;} [class~="x_t31"]{mso-line-height-alt:30px!important;line-height:30px!important;} [class~="x_t29"]{padding-bottom:40px!important;width:420px!important;} [class~="x_t33"]{width:420px!important;} [class~="x_t37"]{width:420px!important;} [class~="x_t12"]{mso-line-height-alt:28px!important;line-height:28px!important;display:block!important;} [class~="x_t10"]{padding-bottom:28px!important;width:420px!important;} [class~="x_t9"]{line-height:40px!important;font-size:32px!important;} [class~="x_t7"]{mso-line-height-alt:28px!important;line-height:28px!important;} [class~="x_t5"]{padding-bottom:28px!important;width:420px!important;} [class~="x_t4"]{line-height:40px!important;font-size:32px!important;mso-text-raise:2px!important;}}</style>
            <!--[if !mso]>-->
            <link href="https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;600;700&amp;family=Montserrat:wght@800&amp;display=swap" rel="stylesheet" type="text/css" />
            <!--<![endif]-->
            <!--[if mso]>
            <xml>
            <o:OfficeDocumentSettings>
            <o:AllowPNG/>
            <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
            </xml>
            <![endif]-->
            </head>
            <body id="body" class="t45" style="min-width:100%;Margin:0px;padding:0px;background-color:#EDEDED;"><div class="t44" style="background-color:#EDEDED;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center"><tr><td class="t43" style="font-size:0;line-height:0;mso-line-height-rule:exactly;background-color:#EDEDED;" valign="top" align="center">
            <!--[if mso]>
            <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false">
            <v:fill color="#EDEDED"/>
            </v:background>
            <![endif]-->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" id="innerTable"><tr><td align="center">
            <table class="t27" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;">
            <tr>
            <!--[if mso]>
            <td width="680" class="t26" style="background-color:#FFFFFF;padding:60px 30px 100px 30px;">
            <![endif]-->
            <!--[if !mso]>-->
            <td class="t26" style="background-color:#FFFFFF;width:620px;padding:60px 30px 100px 30px;">
            <!--<![endif]-->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100% !important;"><tr><td align="center">
            <table class="t25" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;">
            <tr>
            <!--[if mso]>
            <td width="475" class="t24" style="background-color:transparent;">
            <![endif]-->
            <!--[if !mso]>-->
            <td class="t24" style="background-color:transparent;width:475px;">
            <!--<![endif]-->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100% !important;"><tr><td align="left">
            <table class="t2" role="presentation" cellpadding="0" cellspacing="0" style="Margin-right:auto;">
            <tr>
            <!--[if mso]>
            <td width="82" class="t1">
            <![endif]-->
            <!--[if !mso]>-->
            <td class="t1" style="width:82px;">
            <!--<![endif]-->
            <div style="font-size:0px;"><img class="t0" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="82" height="91.25" alt="" src="https://e80155bd-cbe4-4383-ba9d-a0eb99e071d1.b-cdn.net/e/ce922f43-73af-47a0-8781-c66462f68715/589da1c7-342b-433d-80f4-e6e96d13f8e4.png"/></div></td>
            </tr></table>
            </td></tr><tr><td><div class="t3" style="mso-line-height-rule:exactly;mso-line-height-alt:46px;line-height:46px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="center">
            <table class="t6" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;">
            <tr>
            <!--[if mso]>
            <td width="475" class="t5" style="border-bottom:1px solid #E1E2E6;padding:0 0 40px 0;">
            <![endif]-->
            <!--[if !mso]>-->
            <td class="t5" style="border-bottom:1px solid #E1E2E6;width:475px;padding:0 0 40px 0;">
            <!--<![endif]-->
            <h1 class="t4" style="margin:0;Margin:0;font-family:Fira Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:52px;font-weight:700;font-style:normal;font-size:48px;text-decoration:none;text-transform:none;direction:ltr;color:#000000;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;">News Summary for<br/>${user.department.charAt(0).toUpperCase() + user.department.slice(1)} Department</h1></td>
            </tr></table>
            </td></tr><tr><td><div class="t7" style="mso-line-height-rule:exactly;mso-line-height-alt:40px;line-height:40px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="left">
            <table class="t11" role="presentation" cellpadding="0" cellspacing="0" style="Margin-right:auto;">
            <tr>
            <!--[if mso]>
            <td width="475" class="t10" style="padding:0 0 40px 0;">
            <![endif]-->
            <!--[if !mso]>-->
            <td class="t10" style="width:475px;padding:0 0 40px 0;">
            <!--<![endif]-->
            <h2 class="t9" style="margin:0;Margin:0;font-family:Fira Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:30px;font-weight:700;font-style:normal;font-size:24px;text-decoration:none;text-transform:none;direction:ltr;color:#333333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;"><span class="t8" style="margin:0;Margin:0;mso-line-height-rule:exactly;">Total ${summary.negativeNewsCount} News have a negative sentiment!</span>&nbsp;</h2></td>
            </tr></table>
            </td></tr>
            <!--[if !mso]>-->
            <tr><td><div class="t12" style="mso-line-height-rule:exactly;font-size:1px;display:none;">&nbsp;&nbsp;</div></td></tr>
            <!--<![endif]-->
            <tr><td align="center">
            <table class="t15" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;">
            <tr>
            <!--[if mso]>
            <td width="475" class="t14">
            <![endif]-->
            <!--[if !mso]>-->
            <td class="t14" style="width:475px;">
            <!--<![endif]-->
            <p class="t13" style="margin:0;Margin:0;font-family:Fira Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:28px;font-weight:400;font-style:normal;font-size:18px;text-decoration:none;text-transform:none;direction:ltr;color:#9095A2;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;">
                Negative News: ${summary.negativePercentage.toFixed(2)}%<br>
                Positive News: ${summary.positivePercentage.toFixed(2)}%<br>
                Neutral News: ${summary.neutralPercentage.toFixed(2)}%
            </p></td>
            </tr></table>
            </td></tr><tr><td><div class="t16" style="mso-line-height-rule:exactly;mso-line-height-alt:28px;line-height:28px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="center">
            <table class="t19" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;">
            <tr>
            <!--[if mso]>
            <td width="475" class="t18">
            <![endif]-->
            <!--[if !mso]>-->
            <td class="t18" style="width:475px;">
            <!--<![endif]-->
            <p class="t17" style="margin:0;Margin:0;font-family:Fira Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:28px;font-weight:400;font-style:normal;font-size:18px;text-decoration:none;text-transform:none;direction:ltr;color:#9095A2;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;">Tap the button below to analyze immediately.</p></td>
            </tr></table>
            </td></tr><tr><td><div class="t20" style="mso-line-height-rule:exactly;mso-line-height-alt:50px;line-height:50px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="left">
            <table class="t23" role="presentation" cellpadding="0" cellspacing="0" style="Margin-right:auto;">
            <tr>
            <!--[if mso]>
            <td width="246" class="t22" style="background-color:#6B84FF;overflow:hidden;text-align:center;line-height:48px;mso-line-height-rule:exactly;mso-text-raise:11px;border-radius:40px 40px 40px 40px;">
            <![endif]-->
            <!--[if !mso]>-->
            <td class="t22" style="background-color:#6B84FF;overflow:hidden;width:246px;text-align:center;line-height:48px;mso-line-height-rule:exactly;mso-text-raise:11px;border-radius:40px 40px 40px 40px;">
            <!--<![endif]-->
            <a class="t21" href="http://localhost:3001" style="display:block;margin:0;Margin:0;font-family:Montserrat,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:48px;font-weight:800;font-style:normal;font-size:13px;text-decoration:none;text-transform:uppercase;letter-spacing:0.5px;direction:ltr;color:#FFFFFF;text-align:center;mso-line-height-rule:exactly;mso-text-raise:11px;" target="_blank">Check out Now</a></td>
            </tr></table>
            </td></tr></table></td>
            </tr></table>
            </td></tr></table></td>
            </tr></table>
            </td></tr><tr><td align="center">
            <table class="t42" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;">
            <tr>
            <!--[if mso]>
            <td width="680" class="t41" style="background-color:#000000;padding:80px 30px 80px 30px;">
            <![endif]-->
            <!--[if !mso]>-->
            <td class="t41" style="background-color:#000000;width:620px;padding:80px 30px 80px 30px;">
            <!--<![endif]-->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100% !important;"><tr><td align="center">
            <table class="t40" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;">
            <tr>
            <!--[if mso]>
            <td width="475" class="t39" style="background-color:transparent;">
            <![endif]-->
            <!--[if !mso]>-->
            <td class="t39" style="background-color:transparent;width:475px;">
            <!--<![endif]-->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100% !important;"><tr><td align="center">
            <table class="t30" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;">
            <tr>
            <!--[if mso]>
            <td width="475" class="t29" style="border-bottom:1px solid #262626;padding:0 0 60px 0;">
            <![endif]-->
            <!--[if !mso]>-->
            <td class="t29" style="border-bottom:1px solid #262626;width:475px;padding:0 0 60px 0;">
            <!--<![endif]-->
            <h1 class="t28" style="margin:0;Margin:0;font-family:Fira Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:32px;font-weight:600;font-style:normal;font-size:32px;text-decoration:none;text-transform:none;direction:ltr;color:#FFFFFF;text-align:left;mso-line-height-rule:exactly;">NewsFlow</h1></td>
            </tr></table>
            </td></tr><tr><td><div class="t31" style="mso-line-height-rule:exactly;mso-line-height-alt:40px;line-height:40px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="center">
            <table class="t34" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;">
            <tr>
            <!--[if mso]>
            <td width="475" class="t33">
            <![endif]-->
            <!--[if !mso]>-->
            <td class="t33" style="width:475px;">
            <!--<![endif]-->
            <p class="t32" style="margin:0;Margin:0;font-family:Fira Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:400;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;direction:ltr;color:#9095A2;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;">If you do not wish or intend to receive this information, you can ignore and delete this email.</p></td>
            </tr></table>
            </td></tr><tr><td><div class="t35" style="mso-line-height-rule:exactly;mso-line-height-alt:20px;line-height:20px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="center">
            <table class="t38" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;">
            <tr>
            <!--[if mso]>
            <td width="475" class="t37">
            <![endif]-->
            <!--[if !mso]>-->
            <td class="t37" style="width:475px;">
            <!--<![endif]-->
            <p class="t36" style="margin:0;Margin:0;font-family:Fira Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:400;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;direction:ltr;color:#9095A2;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;">NewsFlow. All rights reserved</p></td>
            </tr></table>
            </td></tr></table></td>
            </tr></table>
            </td></tr></table></td>
            </tr></table>
            </td></tr></table></td></tr></table></div><div class="gmail-mobile-forced-width" style="white-space: nowrap; font: 15px courier; line-height: 0;">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
            </div></body>
            </html>`

            const mailOptions = {
                from: process.env.MAIL_ID || "sample@gmail.com",
                to: user.email,
                subject: "Newsflow Notification",
                html: emailContent
            }

            transporter.sendMail(mailOptions);
        }
    } catch (error) {
        console.error("Mail not sent: ", error);
        return null;
    }
}

export { sendEmails };