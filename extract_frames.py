import cv2
import os
import sys

def extract_frames(video_path, output_folder, max_frames=None):
    if not os.path.exists(video_path):
        print(f"Error: Video file not found at {video_path}")
        return 0

    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print(f"Error: Could not open video {video_path}")
        return 0

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    print(f"Processing {video_path}...")
    print(f"Total frames: {total_frames}")

    count = 0
    saved_count = 0
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # Optional: Skip frames if frame rate is super high, but let's keep all for smoothness
        # Optional: Resize to max height 1080p if massive
        height, width = frame.shape[:2]
        if height > 1080:
            scale_ratio = 1080 / height
            new_width = int(width * scale_ratio)
            frame = cv2.resize(frame, (new_width, 1080))

        # Save frame
        frame_name = os.path.join(output_folder, f"frame_{saved_count:04d}.jpg")
        
        # JPEG quality 95 for high-quality, cinematic frames
        cv2.imwrite(frame_name, frame, [int(cv2.IMWRITE_JPEG_QUALITY), 95])
        
        saved_count += 1
        count += 1
        
        if max_frames and saved_count >= max_frames:
            break

        if saved_count % 50 == 0:
            print(f"Extracted {saved_count}/{total_frames}")

    cap.release()
    print(f"Finished {video_path}. Extracted {saved_count} frames.")
    return saved_count

if __name__ == "__main__":
    base_dir = os.getcwd()
    
    # Process Intro
    intro_video = os.path.join(base_dir, 'public', 'intro.mp4')
    intro_out = os.path.join(base_dir, 'public', 'images', 'intro')
    print("--- Extracting Intro Frames ---")
    c1 = extract_frames(intro_video, intro_out)
    
    # Process Chapter 1
    chap1_video = os.path.join(base_dir, 'public', 'chap1.mp4')
    chap1_out = os.path.join(base_dir, 'public', 'images', 'chap1')
    print("\n--- Extracting Chapter 1 Frames ---")
    c2 = extract_frames(chap1_video, chap1_out)
    
    # Create a manifest file so JS knows how many frames to load
    manifest_path = os.path.join(base_dir, 'src', 'frame_manifest.js')
    with open(manifest_path, 'w') as f:
        f.write(f"export const frameCounts = {{\n")
        f.write(f"  intro: {c1},\n")
        f.write(f"  chap1: {c2}\n")
        f.write(f"}}\n")
    print(f"\nManifest saved to {manifest_path}")
