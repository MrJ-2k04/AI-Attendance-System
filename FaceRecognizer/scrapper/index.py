import os
import requests

# Create uploads folder if it doesn't exist
save_dir = "../dataset"
os.makedirs(save_dir, exist_ok=True)

# Base URL
base_url = "https://svgupgca.svguerp.in/studentinfosys/photopic/CI211_"

# Range of IDs
start_id = 1  # Start from 001
end_id = 135  # End at 135

for student_id in range(start_id, end_id + 1):
    student_id_str = f"24CI2110{student_id:03d}"  # Keep prefix fixed and format last three digits
    url = f"{base_url}{student_id_str}.jpg"

    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()  # Raise HTTPError for bad responses (4xx and 5xx)

        # Save the file in uploads folder
        file_path = os.path.join(save_dir, f"{student_id_str}.jpg")
        with open(file_path, "wb") as file:
            file.write(response.content)

        print(f"Downloaded: {student_id_str}.jpg")

    except requests.exceptions.RequestException as e:
        print(f"Failed to download {student_id_str}.jpg: {e}")

