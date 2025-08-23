#!/usr/bin/env python3
"""
addStudentData.py

Reads `students.txt` and pairs each line with an image from `dataset/`.
Sends POST multipart/form-data requests to create students at the configured URL.

Default behavior is a dry-run. To actually send requests use --execute.

Fields sent per request:
 - name: from students.txt (one name per line)
 - division: "B" (hardcoded)
 - rollNumber: image filename without extension
 - images: the image file (multipart file field)

Produces `output/results.json` containing an array of per-student outcomes.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import time
from pathlib import Path
from typing import List

# Optional import; we won't fail at import-time if requests isn't installed because
# the default mode is dry-run. If execute is requested and requests is missing,
# we will surface a clear error.
try:
	import requests
except Exception:  # pragma: no cover - handled at runtime
	requests = None


ROOT = Path(__file__).resolve().parent
STUDENTS_FILE = ROOT / "students.txt"
DATASET_DIR = ROOT / "dataset"
OUTPUT_DIR = ROOT / "output"
OUTPUT_FILE = OUTPUT_DIR / "results.json"


def read_students(path: Path) -> List[str]:
	if not path.exists():
		raise FileNotFoundError(f"students file not found: {path}")
	with path.open("r", encoding="utf-8", errors="ignore") as f:
		lines = [l.strip() for l in f.readlines() if l.strip()]
	return lines


def list_images(path: Path) -> List[Path]:
	if not path.exists() or not path.is_dir():
		raise FileNotFoundError(f"dataset directory not found: {path}")
	# sort filenames so pairing is deterministic
	imgs = sorted([p for p in path.iterdir() if p.is_file()])
	return imgs


def make_request(url: str, name: str, division: str, roll: str, image_path: Path, timeout: int = 30):
	if requests is None:
		raise RuntimeError("requests library is not installed. Install it or run with --dry-run.")

	data = {"name": name, "division": division, "rollNumber": roll}
	with image_path.open("rb") as fh:
		files = {"images": (image_path.name, fh, "application/octet-stream")}
		resp = requests.post(url, data=data, files=files, timeout=timeout)
	return resp


def ensure_output_dir():
	OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def main(argv: List[str] | None = None) -> int:
	parser = argparse.ArgumentParser(description="Batch create students by POSTing images and metadata")
	parser.add_argument("--url", default="http://localhost:8080/student", help="Endpoint URL to POST each student")
	parser.add_argument("--execute", action="store_true", help="Actually perform HTTP requests. Default is dry-run.")
	parser.add_argument("--delay", type=float, default=0.2, help="Delay between requests in seconds")
	parser.add_argument("--retries", type=int, default=2, help="Number of retries for failed requests")
	parser.add_argument("--start", type=int, default=0, help="Start index (0-based) to resume")
	parser.add_argument("--limit", type=int, default=0, help="Limit number of requests (0 = no limit)")
	args = parser.parse_args(argv)

	try:
		students = read_students(STUDENTS_FILE)
	except Exception as e:
		print(f"ERROR reading students: {e}")
		return 2

	try:
		images = list_images(DATASET_DIR)
	except Exception as e:
		print(f"ERROR listing images: {e}")
		return 2

	total_students = len(students)
	total_images = len(images)

	print(f"Found {total_students} student names and {total_images} images in dataset/")

	count = min(total_students, total_images)
	if total_students != total_images:
		print("WARNING: number of students and images differ. Will process up to the smaller of the two.")

	ensure_output_dir()
	results = []

	end_index = count if args.limit == 0 else min(count, args.start + args.limit)

	for i in range(args.start, end_index):
		name = students[i]
		image_path = images[i]
		roll = image_path.stem
		entry = {"index": i, "name": name, "rollNumber": roll, "image": str(image_path.name)}

		if not args.execute:
			entry.update({"status": "dry-run", "http_status": None, "response": None})
			print(f"DRY-RUN: [{i}] name={name!r} roll={roll} image={image_path.name}")
			results.append(entry)
			continue

		# execute mode
		attempt = 0
		last_exc = None
		while attempt <= args.retries:
			try:
				resp = make_request(args.url, name, "B", roll, image_path)
				entry.update({"status": "ok" if resp.status_code < 400 else "error", "http_status": resp.status_code, "response": resp.text})
				print(f"[{i}] {image_path.name} -> {resp.status_code}")
				break
			except Exception as exc:
				last_exc = exc
				attempt += 1
				print(f"[{i}] attempt {attempt}/{args.retries} failed: {exc}")
				time.sleep(1 + attempt * 0.5)
		else:
			entry.update({"status": "failed", "http_status": None, "response": str(last_exc)})
			print(f"[{i}] FAILED after {args.retries} retries: {last_exc}")

		results.append(entry)
		time.sleep(args.delay)

	# write results
	with OUTPUT_FILE.open("w", encoding="utf-8") as f:
		json.dump(results, f, indent=2, ensure_ascii=False)

	print(f"Done. Processed {len(results)} items. Results written to {OUTPUT_FILE}")
	return 0


if __name__ == "__main__":
	raise SystemExit(main())

""" 

Test script:
python addStudentData.py --limit 5
[--start 5][--limit 5][--delay 0.5][--retries 3][--execute]

Run script:
python addStudentData.py --execute

"""