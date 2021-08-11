#!/usr/bin/env node
const SITE = "https://mirrors.dgut.edu.cn";

const Timeout = require("await-timeout");
const timeout = 15000;

fetch_extra = require("node-fetch-extra");
async function fetchV6First(u, opt) {
  const promise = fetch_extra(u, { family: 6, ...opt });
  return await Timeout.wrap(promise, timeout / 10, "Timeout").catch(
    async (e) => {
      const promise = fetch_extra(u, opt);
      return await Timeout.wrap(promise, timeout / 3, "Timeout").catch(
        () => null
      );
    }
  );
}
global.fetch = fetchV6First;

// cname: async (repourl: string) => unix_timestamp: int
const GETTERS = {
  archlinux: require("./lastupdate/archlinux"),
  arch4edu: require("./lastupdate/arch4edu"),
  archlinuxcn: require("./lastupdate/archlinuxcn"),
  blackarch: require("./lastupdate/blackarch"),
  anthon: require("./lastupdate/anthon"),
  centos: require("./lastupdate/centos"),
  "centos-altarch": require("./lastupdate/centos-altarch"),
  "centos-vault": require("./lastupdate/centos-vault"),
  ceph: require("./lastupdate/ceph"),
  chakra: require("./lastupdate/chakra"),
  gnu: require("./lastupdate/gnu"),
  "gnu-alpha": require("./lastupdate/gnu-alpha"),
  mageia: require("./lastupdate/mageia"),
  manjaro: require("./lastupdate/manjaro"),
  "manjaro-arm": require("./lastupdate/manjaro-arm"),
  mariadb: require("./lastupdate/mariadb"),
  msys2: require("./lastupdate/msys2"),
  postgresql: require("./lastupdate/postgresql"),
};

/** The END upstreams, not to include trailing slashes */
const UPSTREAMS = {
  archlinux: "https://mirror.pkgbuild.com",
  archlinuxcn: "https://repo.archlinuxcn.org",
  centos: "http://mirror.centos.org/centos",
  CTAN: "https://dante.ctan.org/tex-archive",
  debian: "https://deb.debian.org/debian",
  "debian-cd": "https://cdimage.debian.org/debian-cd",
  "debian-security": "https://deb.debian.org/debian-security",
  deepin: "http://packages.deepin.com/deepin",
  "deepin-cd": "http://packages.deepin.com/deepin-cd",
  epel: "https://download-ib01.fedoraproject.org/pub/epel",
  kali: "https://archive.kali.org/kali",
  "kali-images": "https://archive.kali.org/kali-images",
  kicad: "https://kicad-downloads.s3.cern.ch",
  manjaro: "https://repo.manjaro.org/repo",
  "nixos-images": "https://channels.nixos.org",
  php: "https://www.php.net/distributions",
  raspberrypi: "https://archive.raspberrypi.org/debian",
  raspbian: "https://archive.raspbian.org",
  termux: "https://packages.termux.org",
  ubuntu: "http://archive.ubuntu.com/ubuntu",
  "ubuntu-releases": "https://releases.ubuntu.com/releases",
  ubuntukylin: "http://archive.ubuntukylin.com/ubuntukylin",
  "ubuntukylin-cd": "http://cdimage.ubuntukylin.com/releases/basic",
};

const { InfluxDB, Point, HttpError } = require("@influxdata/influxdb-client");
const { url, token, org, bucket } = require("./env");

const writeApi = new InfluxDB({ url, token }).getWriteApi(org, bucket, "ns");

/** Make sure a failure on a distro doesn't affect monitoring other distros */
async function getLastUpdated(name, baseUrl) {
  try {
    return await GETTERS[name](baseUrl);
  } catch (err) {
    console.error(err);
    return null;
  }
}

async function main() {
  const resp = await fetch(`${SITE}/static/status.json`);
  const status = await resp.json();
  for (const distro of status) {
    const lastUpdated =
      distro.name in GETTERS
        ? await getLastUpdated(distro.name, `${SITE}/${distro.name}`)
        : distro.last_update_ts;
    const upstreamUpdated =
      distro.name in GETTERS && distro.name in UPSTREAMS
        ? await getLastUpdated(distro.name, UPSTREAMS[distro.name])
        : Math.round(Date.now() / 1000);
    if (lastUpdated && upstreamUpdated) {
      const p = new Point("delay")
        .timestamp(new Date())
        .tag("name", distro.name)
        .intField("value", upstreamUpdated - lastUpdated);
      writeApi.writePoint(p);
    }
  }
  writeApi
    .close()
    .then(() => {
      //console.log('FINISHED')
      process.exit(0);
    })
    .catch((e) => {
      if (e instanceof HttpError && e.statusCode === 401) {
        console.log("Should setup a new InfluxDB database.");
      }
      console.log("\nFinished ERROR");
      process.exit(0);
    });
}

main();
