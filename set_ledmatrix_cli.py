
import sys
import json
from sense_hat import SenseHat

sense = SenseHat()

def main():
    try:
        data = json.load(sys.stdin)
        matrix = data.get("matrix", [])
        for y in range(8):
            for x in range(8):
                pixel = matrix[y][x]
                sense.set_pixel(x, y, pixel["r"], pixel["g"], pixel["b"])
        print(json.dumps({"status": "success"}))
    except Exception as e:
        print(json.dumps({"status": "error", "message": str(e)})))

if __name__ == "__main__":
    main()
