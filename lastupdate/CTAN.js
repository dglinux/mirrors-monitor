module.exports = async function (repoUrl) {
  const text = await (await fetch(repoUrl + "/timestamp")).text();
  const lines = text.split("\n");
  const [year, month, date, hour, minute] = lines[lines.length - 2].split("-");
  return Math.round(Date.UTC(year, month - 1, date, hour, minute) / 1000);
};
