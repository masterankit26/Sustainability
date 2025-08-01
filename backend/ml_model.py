def predict_irrigation(data):
    if data['moisture'] < 30 and data['temperature'] > 25 and data['humidity'] < 60:
        return True
    return False