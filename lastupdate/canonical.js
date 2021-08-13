/** Possible Canonical server names */
const SERVER_NAMES = ["aerodent", "actiontoad", "kazooie", "banjo"];
module.exports = async function (repoUrl, tracePrefix) {
  let trace = null;
  for (const name of SERVER_NAMES) {
    trace = await fetch(repoUrl + tracePrefix + name);
    if (trace.status === 200) break;
  }
  return Math.round(new Date(await trace.text()) / 1000);
};
