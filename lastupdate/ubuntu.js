const canonical = require('./canonical');
module.exports = async function (repoUrl) {
  return await canonical(repoUrl, '/.trace/ubuntu-')
};
