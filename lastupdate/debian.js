module.exports = async function (repoUrl) {
  const text = await (await fetch(repoUrl + "/project/trace/master")).text();
  return Math.round(new Date(text.match(/Date: (.+)/)[1]) / 1000);
};
