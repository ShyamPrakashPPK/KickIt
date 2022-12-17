const env = require('dotenv').config()



////////////////////////////////////////////////////////////
const SID = process.env.twilio_sid;
const TOKEN = process.env.twilio_token;            //id regiisterd with phone number 9446791982
const serviceID = process.env.twilio_service_id;
///////////////////////////////////////////////////////////
const client = require("twilio")(SID, TOKEN);


var mobileNumber


module.exports = {

    sendOTP: (phoneNumber) => {
        mobileNumber = phoneNumber
        console.log(phoneNumber, 'sent otp ill ethiiiiiiiiiiiiiiiiiiiiiii');
        return new Promise(async (resolve, reject) => {
            client.verify
                .services(serviceID) // Change service ID
                .verifications.create({
                    to: `+${phoneNumber}`,
                    channel: "sms",
                })
                .then((data) => {
                    resolve(data)
                });

        })

    },
    verifyOTP: (OTP) => {
        console.log(OTP, 'from verify otp---------------------------');
        return new Promise(async (resolve, reject) => {
            client.verify
                .services(serviceID)
                .verificationChecks.create({
                    to: `+${mobileNumber}`,
                    code: OTP,

                })
                .then((data) => {
                    if (data.status === "approved") {
                        resolve({ status: true })
                    } else {
                        resolve({ status: false })
                    } console.log(data.status, "**************************************************************");
                });

        })
    }

}