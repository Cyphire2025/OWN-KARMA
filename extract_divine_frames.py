import cv2
import os

def extract_frames(video_path, output_folder, fps=30):
    """
    Extract frames from video at specified FPS
    """
    # Create output folder if it doesn't exist
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)
    
    # Open video
    video = cv2.VideoCapture(video_path)
    
    if not video.isOpened():
        print(f"Error: Could not open video {video_path}")
        return
    
    # Get video properties
    original_fps = video.get(cv2.CAP_PROP_FPS)
    total_frames = int(video.get(cv2.CAP_PROP_FRAME_COUNT))
    
    print(f"Video FPS: {original_fps}")
    print(f"Total Frames: {total_frames}")
    print(f"Extracting at {fps} FPS...")
    
    # Calculate frame interval
    frame_interval = int(original_fps / fps)
    
    frame_count = 0
    saved_count = 0
    
    while True:
        ret, frame = video.read()
        
        if not ret:
            break
        
        # Save frame at specified interval
        if frame_count % frame_interval == 0:
            filename = f"frame_{str(saved_count).zfill(4)}.jpg"
            output_path = os.path.join(output_folder, filename)
            cv2.imwrite(output_path, frame, [cv2.IMWRITE_JPEG_QUALITY, 90])
            saved_count += 1
            
            if saved_count % 10 == 0:
                print(f"Extracted {saved_count} frames...")
        
        frame_count += 1
    
    video.release()
    print(f"\nDone! Extracted {saved_count} frames to {output_folder}")
    return saved_count

if __name__ == "__main__":
    # Configuration
    video_path = "public/video/car1.mp4"
    output_folder = "public/images/divine"
    
    # Extract at 30 FPS for smooth playback
    total_frames = extract_frames(video_path, output_folder, fps=30)
    
    print(f"\nTotal frames extracted: {total_frames}")
    print(f"Frames saved to: {output_folder}")
