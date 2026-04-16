import fitz
import os
import json

doc = fitz.open("CATALOGO MAXIMUM 2025 - RESUMIDO222.pdf")
os.makedirs("assets/products", exist_ok=True)
images_extracted = 0

text_content = ""

for page_num in range(len(doc)):
    page = doc.load_page(page_num)
    text_content += f"\n--- Page {page_num} ---\n"
    text_content += page.get_text()
    
    image_list = page.get_images(full=True)
    for img_index, img in enumerate(image_list):
        xref = img[0]
        base_image = doc.extract_image(xref)
        image_bytes = base_image["image"]
        image_ext = base_image["ext"]
        
        # Save image
        img_filename = f"assets/products/p{page_num}_i{img_index}.{image_ext}"
        with open(img_filename, "wb") as f:
            f.write(image_bytes)
        images_extracted += 1

with open("pdf_text.txt", "w", encoding="utf-8") as f:
    f.write(text_content)

print(f"Extracted {images_extracted} images and saved text to pdf_text.txt")
