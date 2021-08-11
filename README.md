# Mirrors Monitor

Monitor data generator for DGLinux mirrors. Gets delay time (in seconds) by comparing timestamps between upstreams and local and stores it in influxdb each run. You should run it with a timer job, i.e. cronie or systemd-timer.

Use influxdb 2.x. Set these environment variables: `INFLUX_URL`, `INFLUX_TOKEN`, `INFLUX_ORG`, `INFLUX_BUCKET`.

## Credit

Forked from [MirrorZ monitor](https://github.com/mirrorz-org/mirrorz-monitor).

