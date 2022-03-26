const functions = require("firebase-functions");
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const NodeMailer = require('nodemailer')

exports.observeFirestore =  functions.region('asia-northeast1').firestore.document('{table}/{ID}').onWrite((change, context) => {
    if(context.params.table === "logs") return 0;
    const dt = new Date(Date.now() + ((new Date().getTimezoneOffset() + (9 * 60)) * 60 * 1000));
    const nowdt = dt.getFullYear() + "-" + (dt.getMonth()+1) + "-" +  dt.getDate() + " " + dt.getHours() + ":" + ('0' + dt.getMinutes()).slice(-2);
    const { after, before } = change 
    const log = {
        param: context.params.table + "/" + context.params.ID,
        after: after.data() || "存在しません",
        before: before.data() || "存在しません"
    }
    db.collection('logs').doc(nowdt).set(log);
    sendMail(log);
});

const sendMail = async (log) => {
    const logText = JSON.stringify(log,null,2)
    const auth = {
        type: "OAuth2",
        user: "example@example.com",
        clientId: 'clientId',
        clientSecret: "clientSecret",
        refreshToken: "refreshToken",
    };
    const transport = {
        service: "gmail",
        auth,
    };
    // 送信内容を作成
    const mailData = {
        from: 'firestore observer', // 送信元名
        to: 'example@example.com',                         // 送信先
        subject: 'firestoreに変更がありました',                               // 件名
        text: logText                       // HTMLメール
    }
    const transporter = NodeMailer.createTransport(transport)
    transporter.sendMail(mailData, (err, response) => {
        console.log(err || response);
    });
}
