#!/bin/bash

# Define ports to kill
PORTS=("3000" "8000")

# Loop through each port and kill associated processes
for PORT in "${PORTS[@]}"; do
    PIDS=$(lsof -ti tcp:"$PORT")  # Get all PIDs on the given port
    if [ -n "$PIDS" ]; then
        echo "🔴 Killing process(es) on port $PORT (PIDs: $PIDS)"
        echo "$PIDS" | xargs kill -9  # ✅ Pass PIDs correctly to kill
    else
        echo "✅ No process running on port $PORT"
    fi
done

echo "🎯 All specified ports are now free!"

