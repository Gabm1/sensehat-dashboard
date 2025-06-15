
import argparse
import json
from sense_hat import SenseHat
import math

sense = SenseHat()

def convert_units(data, args):
    result = {}

    if args.r:
        roll = sense.get_orientation()['roll']
        if args.u == 'radians':
            roll = math.radians(roll)
        result['roll'] = {"value": round(roll, 2), "unit": args.u}

    if args.p:
        pitch = sense.get_orientation()['pitch']
        if args.u == 'radians':
            pitch = math.radians(pitch)
        result['pitch'] = {"value": round(pitch, 2), "unit": args.u}

    if args.y:
        yaw = sense.get_orientation()['yaw']
        if args.u == 'radians':
            yaw = math.radians(yaw)
        result['yaw'] = {"value": round(yaw, 2), "unit": args.u}

    if args.P:
        pressure = sense.get_pressure()
        if args.P_unit == 'mmHg':
            pressure *= 0.75006157584566
        result['pressure'] = {"value": round(pressure, 2), "unit": args.P_unit}

    if args.T:
        temp = sense.get_temperature()
        if args.T_unit == 'F':
            temp = temp * 9/5 + 32
        result['temperature'] = {"value": round(temp, 2), "unit": args.T_unit}

    if args.H:
        humidity = sense.get_humidity()
        if args.H_unit == 'fraction':
            humidity /= 100
        result['humidity'] = {"value": round(humidity, 2), "unit": args.H_unit}

    events = sense.stick.get_events()
    joystick_data = []

    if events:
        for event in events:
            joystick_data.append({
                "direction": event.direction,
                "action": event.action
            })
    else:
        joystick_data.append({
            "direction": "middle",
            "action": "held"
        })

    result["joystick"] = joystick_data
    return result

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('-r', action='store_true')
    parser.add_argument('-p', action='store_true')
    parser.add_argument('-y', action='store_true')
    parser.add_argument('-u', choices=['degrees', 'radians'], default='degrees')

    parser.add_argument('-P', action='store_true')
    parser.add_argument('--P_unit', choices=['hPa', 'mmHg'], default='hPa')

    parser.add_argument('-T', action='store_true')
    parser.add_argument('--T_unit', choices=['C', 'F'], default='C')

    parser.add_argument('-H', action='store_true')
    parser.add_argument('--H_unit', choices=['percent', 'fraction'], default='percent')

    args = parser.parse_args()
    data = convert_units({}, args)
    print(json.dumps(data))

if __name__ == '__main__':
    main()
