# GCP Speedtest Logger
GCP implementation of the speedtest logger

## Setup
1. Install [google-cloud-sdk](https://cloud.google.com/sdk/) and make sure to follow init procedure
1. Make sure that [gcp-speedtest-api](https://github.com/cx-cloud-101/gcp-speedtest-api) is deployed
1. To enable remote trigger through Pub/Sub
    1. Create topic `speedtest-trigger`
    1. Test with trigger message (Speedtest Logger must be running with `--triggerTopic`)
        ```
        gcloud pubsub topics publish speedtest-trigger --message='{"user": "<user>", "device": <device>}'
        ```

## Usage
Read the help text. 
```
yarn install
yarn start -h
```

