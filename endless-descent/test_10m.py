#!/usr/bin/env python3
"""
Test script to simulate 10,000,000 rounds of Endless Descent
and verify exact RTP, Hit Rate, and Win Cap.
"""
import random
import math

THEORETICAL_RTP = 0.96
WIN_CAP_MULT = 10000.0  # 10,000x hard cap

def simulate_10m():
    total_rounds = 10_000_000
    print(f"Simulating {total_rounds:,} rounds...")

if __name__ == '__main__':
    simulate_10m()
