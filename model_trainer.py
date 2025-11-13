import streamlit as st
from PIL import Image
import cv2
import numpy as np
import easyocr

# --- 1. TITLE AND INSTRUCTIONS ---
st.title("License Plate Recognition")
st.write("Upload an image to detect the license plate number using EasyOCR and OpenCV")

# --- 2. CACHE THE EASYOCR READER ---
# This loads the model only once, making the app much faster
@st.cache_resource
def load_reader():
    """Loads the EasyOCR reader model into memory."""
    return easyocr.Reader(['en'])

# --- 3. IMAGE PROCESSING FUNCTION ---
# This function contains all the steps from your notebook
def process_image(img_array):
    """
    Takes an OpenCV image array, processes it to find the license plate,
    and returns the processed image and detected text.
    """
    # Initialize reader
    reader = load_reader()
    
    # --- Step 1: Grayscale and Blur ---
    gray = cv2.cvtColor(img_array, cv2.COLOR_BGR2GRAY)
    bfilter = cv2.bilateralFilter(gray, 11, 17, 17) # Noise reduction
    
    # --- Step 2: Edge Detection ---
    edged = cv2.Canny(bfilter, 30, 200) # Edge detection
    
    # --- Step 3: Find Contours ---
    # --- Step 3: Find Contours ---
    contours_info = cv2.findContours(edged.copy(), cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    # cv2.findContours has different return signatures across OpenCV versions:
    # - (contours, hierarchy) or (image, contours, hierarchy). This handles both.
    if len(contours_info) == 2:
        contours = contours_info[0]
    else:
        contours = contours_info[1]
    contours = sorted(contours, key=cv2.contourArea, reverse=True)[:10]
    # --- Step 4: Find Plate Location ---
    location = None
    for contour in contours:
        approx = cv2.approxPolyDP(contour, 10, True)
        if len(approx) == 4:
            location = approx
            break
            
    # Handle case where no 4-point contour is found
    if location is None:
        return None, None, None

    # --- Step 5: Mask and Crop ---
    mask = np.zeros(gray.shape, np.uint8)
    cv2.drawContours(mask, [location], 0, 255, -1)
    cv2.bitwise_and(img_array, img_array, mask=mask)
    
    (x, y) = np.where(mask == 255)
    (x1, y1) = (np.min(x), np.min(y))
    (x2, y2) = (np.max(x), np.max(y))
    cropped_image = gray[x1:x2 + 1, y1:y2 + 1]

    # --- Step 6: Use EasyOCR to Read Text ---
    result = reader.readtext(cropped_image)
    
    # Handle case where no text is read
    if not result:
        return None, None, None
        
    text = result[0][-2] # Get the text from the result
    
    # --- Step 7: Render Result on Image ---
    font = cv2.FONT_HERSHEY_SIMPLEX
    cv2.putText(img_array, text=text, org=(approx[0][0][0], approx[1][0][1] + 60), 
                fontFace=font, fontScale=1, color=(0, 255, 0), 
                thickness=2, lineType=cv2.LINE_AA)
    cv2.rectangle(img_array, tuple(approx[0][0]), tuple(approx[2][0]), (0, 255, 0), 3)
    
    return img_array, text, cropped_image

# --- 4. FILE UPLOADER ---
uploaded_file = st.file_uploader("Choose an image...", type=["jpg", "png", "jpeg"])

if uploaded_file is not None:
    # Convert the uploaded file (from PIL) to an OpenCV image (numpy array)
    image_pil = Image.open(uploaded_file)
    img_cv = np.array(image_pil)
    # Convert RGB (PIL) to BGR (OpenCV)
    img_cv_bgr = cv2.cvtColor(img_cv, cv2.COLOR_RGB2BGR)

    # Display the uploaded image
    st.image(image_pil, caption='Uploaded Image', use_container_width=True)
    
    # Process the image
    with st.spinner('Detecting license plate...'):
        processed_image_bgr, detected_text, cropped_plate = process_image(img_cv_bgr)
    
    # --- 5. DISPLAY RESULTS ---
    if detected_text:
        st.success(f"**Detected License Plate Number:** `{detected_text}`")
        
        # Convert the processed (BGR) image back to RGB for Streamlit display
        processed_image_rgb = cv2.cvtColor(processed_image_bgr, cv2.COLOR_BGR2RGB)
        
        # Display the image with the box and text
        st.image(processed_image_rgb, caption='Processed Image', use_container_width=True)
        
        # Display the small cropped part that was sent to OCR
        st.image(cropped_plate, caption='Cropped Plate (Sent to OCR)', width=300)
    else:
        st.error("Could not find a license plate or read text from the image. Please try a different image.")