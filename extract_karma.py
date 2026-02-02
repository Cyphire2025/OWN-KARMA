import cv2
import os

def extract_frames(video_path, output_folder):
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

    saved_count = 0
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break

        height, width = frame.shape[:2]
        if height > 1080:
            scale_ratio = 1080 / height
            new_width = int(width * scale_ratio)
            frame = cv2.resize(frame, (new_width, 1080))

        # Save frame
        frame_name = os.path.join(output_folder, f"frame_{saved_count:04d}.jpg")
        cv2.imwrite(frame_name, frame, [int(cv2.IMWRITE_JPEG_QUALITY), 95])
        
        saved_count += 1
        if saved_count % 50 == 0:
            print(f"Extracted {saved_count}/{total_frames}")

    cap.release()
    print(f"Finished {video_path}. Extracted {saved_count} frames.")
    return saved_count

if __name__ == "__main__":
    base_dir = os.getcwd()
    video_path = os.path.join(base_dir, 'public', 'video', 'karma1.mp4')
    output_path = os.path.join(base_dir, 'public', 'images', 'karma')
    
    count = extract_frames(video_path, output_path)
    
    print(f"\nDONE! Extracted {count} frames for Karma Eye.")
