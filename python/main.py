import speedtest as sp
import datetime
import requests
import pycountry


def speed_test():

    # Do the speed test
    s = sp.Speedtest()
    s.download()
    s.upload()

    # Get the results
    res = s.results.dict()
    return res

def build_body(res, user, device):
    body = { 
        "user": user,
        "device": device,
        "timestamp": datetime.datetime.now().timestamp(),
        "data": {
            "speeds": {
                "download": round(res['download']),
                "upload": round(res['upload']),
            },
            "client": {
                "ip": res['client']['ip'],
                "lat": res['client']['lat'],
                "lon": res['client']['lon'],
                "isp": res['client']['isp'],
                "country": res['client']['country'],
            },
            "server": {
                "host": res['server']['host'],
                "lat": res['server']['lat'],
                "lon": res['server']['lon'],
                "country": pycountry.countries.get(name=res['server']['country'], default="Unknown Country").alpha_2,
                "distance": round(res['server']['d'], 4),
                "ping": res['ping'],
                "id": res['server']['id'],
            }
        }
    }
    return body

def post_to_api(body, api_url):
    headers = {'Content-type': 'application/json', 'Accept': 'text/plain'}
    r = requests.post(api_url, json=body, headers=headers)
    
    # Print the status code of the response.
    print(r.status_code)

def main():

    # Main user (yourself)
    user = 'sfl' # Replace with your username
    api_url = "https://speedtest-api-raxcsdlzxq-ew.a.run.app/speedtest" # Replace with your API URL

    # Do speed test
    raw_res = speed_test()

    # Format body to API spec
    body = build_body(raw_res, user, 1)

    # Post to API
    post_to_api(body, api_url)

if __name__ == '__main__':
    main()