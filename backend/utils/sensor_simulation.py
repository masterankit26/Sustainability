import random
from datetime import datetime

def get_sensor_data():
    return {
        'timestamp': datetime.utcnow().isoformat(),
        'moisture': round(random.uniform(10, 60), 2),
        'temperature': round(random.uniform(20, 35), 2),
        'humidity': round(random.uniform(30, 80), 2),
        'light': round(random.uniform(100, 1000), 2)
    }