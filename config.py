"""
SmartDrip Configuration Constants
"""

RANDOM_SEED = 42
NUM_TAPS = 10
NUM_DAYS = 14
TARIFF_RS_PER_LITER = 0.05
ALERT_THRESHOLD_MINUTES = 15

# Washrooms and tap mapping
WASHROOMS = {
    "Block A - GF": ["tap_01", "tap_02", "tap_03"],
    "Block B - 2F": ["tap_04", "tap_05", "tap_06", "tap_07"],
    "Science Block - 1F": ["tap_08", "tap_09", "tap_10"]
}

# Leak configuration (Tap ID -> Leak start day, Leak flow rate lpm)
LEAKY_TAPS = {
    "tap_03": {"start_day": 4, "flow_lpm": 0.04},
    "tap_06": {"start_day": 7, "flow_lpm": 0.06},
    "tap_09": {"start_day": 9, "flow_lpm": 0.03}
}
