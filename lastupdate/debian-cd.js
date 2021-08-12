const date = require("./date");
module.exports = async function (repoUrl) {
  return await date(repoUrl + "/project/trace/cdimage.debian.org");
};
