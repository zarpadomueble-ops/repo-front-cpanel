import os
from PIL import Image

def process_images():
    source_dir = "/home/tomii/.gemini/antigravity/brain/63c689fb-0975-45ff-b6a2-e5204e510aa4"
    desktop_dir = "/home/tomii/Descargas/front/Assets/optimized/desktop-16x9"
    mobile_dir = "/home/tomii/Descargas/front/Assets/optimized/mobile-9x16"
    
    os.makedirs(desktop_dir, exist_ok=True)
    os.makedirs(mobile_dir, exist_ok=True)
    
    images_to_process = [
        ("escritorio_gamer", "050-escritorio_gamer.webp"),
        ("placard_vestidor", "051-placard_vestidor.webp"),
        ("vanitory_madera", "052-vanitory_madera.webp"),
        ("mesa_comedor", "053-mesa_comedor.webp"),
        ("rack_tv_flotante", "054-rack_tv_flotante.webp")
    ]
    
    # find exact files
    all_files = os.listdir(source_dir)
    
    for prefix, out_name in images_to_process:
        source_file = None
        for f in all_files:
            if f.startswith(prefix) and f.endswith(".png"):
                source_file = os.path.join(source_dir, f)
                break
        
        if not source_file:
            print(f"Skipping {prefix}, file not found")
            continue
            
        print(f"Processing {source_file} -> {out_name}")
        img = Image.open(source_file)
        w, h = img.size
        
        # 16:9 Desktop Crop
        target_ratio_desk = 16 / 9
        current_ratio = w / h
        
        if current_ratio > target_ratio_desk:
            new_w = int(h * target_ratio_desk)
            left = (w - new_w) / 2
            desk_img = img.crop((left, 0, left + new_w, h))
        else:
            new_h = int(w / target_ratio_desk)
            top = (h - new_h) / 2
            desk_img = img.crop((0, top, w, top + new_h))
            
        desk_img = desk_img.resize((1024, 576), Image.Resampling.LANCZOS)
        desk_img.save(os.path.join(desktop_dir, out_name), "WEBP", quality=85)
        
        # 9:16 Mobile Crop
        target_ratio_mob = 9 / 16
        
        if current_ratio > target_ratio_mob:
            new_w = int(h * target_ratio_mob)
            left = (w - new_w) / 2
            mob_img = img.crop((left, 0, left + new_w, h))
        else:
            new_h = int(w / target_ratio_mob)
            top = (h - new_h) / 2
            mob_img = img.crop((0, top, w, top + new_h))
            
        mob_img = mob_img.resize((576, 1024), Image.Resampling.LANCZOS)
        mob_img.save(os.path.join(mobile_dir, out_name), "WEBP", quality=85)

if __name__ == "__main__":
    process_images()
