const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");

function webhookUrl() {
  const url = process.env.WECOM_WEBHOOK_STOCK;
  if (!url) throw new Error("Thiếu biến môi trường WECOM_WEBHOOK_STOCK");
  return url;
}

async function post(data) {
  const { data: result } = await axios.post(webhookUrl(), data);
  if (result.errcode !== 0) throw new Error(result.errmsg);
  return result;
}

function sendTemplateCard(card) {
  return post({ msgtype: "template_card", template_card: card });
}

function sendMarkdown(content) {
  return post({ msgtype: "markdown", markdown: { content } });
}

function sendText(content, mentionedList = []) {
  return post({
    msgtype: "text",
    text: { content, mentioned_list: mentionedList },
  });
}

async function uploadFile(filePath) {
  const form = new FormData();
  form.append("media", fs.createReadStream(filePath));

  const key = new URL(webhookUrl()).searchParams.get("key");
  const uploadUrl = `https://qyapi.weixin.qq.com/cgi-bin/webhook/upload_media?key=${key}&type=file`;

  const { data: result } = await axios.post(uploadUrl, form, {
    headers: form.getHeaders(),
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
  });
  if (result.errcode !== 0) throw new Error(result.errmsg);
  return result.media_id;
}

function sendFile(mediaId) {
  return post({ msgtype: "file", file: { media_id: mediaId } });
}

module.exports = {
  sendTemplateCard,
  sendMarkdown,
  sendText,
  uploadFile,
  sendFile,
};