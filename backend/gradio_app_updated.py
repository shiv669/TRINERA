# Updated app.py for Gradio Space with text output
import gradio as gr
import subprocess
from pathlib import Path
import os
from PIL import Image
import json

# ROOT directory (root of your space)
ROOT_DIR = Path(__file__).parent
WEIGHTS = ROOT_DIR / "best.pt"
YOLO_DETECT = ROOT_DIR / "detect.py"

# YOLOv5 default output directory
OUTPUT_PROJECT = ROOT_DIR / "runs" / "detect"
OUTPUT_NAME = "exp"

# Ensure output dir exists
os.makedirs(OUTPUT_PROJECT, exist_ok=True)

def detect_image(image):
    """
    Detect pests in the uploaded image.
    Returns: (output_image, detection_text)
    """
    # Save uploaded image temporarily
    input_path = ROOT_DIR / "temp_input.jpg"
    image.save(input_path)

    # Run YOLOv5 detect.py via subprocess
    # Add --save-txt to save detection results
    cmd = [
        "python", str(YOLO_DETECT),
        "--weights", str(WEIGHTS),
        "--source", str(input_path),
        "--project", str(OUTPUT_PROJECT),
        "--name", OUTPUT_NAME,
        "--exist-ok",
        "--save-txt",  # Save detection results as text
        "--save-conf"  # Save confidence scores
    ]

    try:
        result = subprocess.run(cmd, check=True, capture_output=True, text=True)
        print("YOLOv5 output:", result.stdout)
    except subprocess.CalledProcessError as e:
        return None, f"Error running YOLOv5: {e}"

    # YOLOv5 output image path
    output_image_path = OUTPUT_PROJECT / OUTPUT_NAME / input_path.name
    
    # YOLOv5 label file path (contains detection results)
    label_file = OUTPUT_PROJECT / OUTPUT_NAME / "labels" / input_path.with_suffix('.txt').name
    
    # Parse detection results
    detections = []
    if label_file.exists():
        with open(label_file, 'r') as f:
            lines = f.readlines()
            for line in lines:
                parts = line.strip().split()
                if len(parts) >= 6:
                    class_id = int(parts[0])
                    confidence = float(parts[5])
                    detections.append({
                        'class_id': class_id,
                        'confidence': confidence
                    })
    
    # Map class IDs to pest names - IP102 Dataset (102 pest classes)
    class_names = {
        0: "rice leaf roller",
        1: "rice leaf caterpillar",
        2: "paddy stem maggot",
        3: "asiatic rice borer",
        4: "yellow rice borer",
        5: "rice gall midge",
        6: "Rice Stemfly",
        7: "brown plant hopper",
        8: "white backed plant hopper",
        9: "small brown plant hopper",
        10: "rice water weevil",
        11: "rice leafhopper",
        12: "grain spreader thrips",
        13: "rice shell pest",
        14: "grub",
        15: "mole cricket",
        16: "wireworm",
        17: "white margined moth",
        18: "black cutworm",
        19: "large cutworm",
        20: "yellow cutworm",
        21: "red spider",
        22: "corn borer",
        23: "army worm",
        24: "aphids",
        25: "Potosiabre vitarsis",
        26: "peach borer",
        27: "english grain aphid",
        28: "green bug",
        29: "bird cherry-oataphid",
        30: "wheat blossom midge",
        31: "penthaleus major",
        32: "longlegged spider mite",
        33: "wheat phloeothrips",
        34: "wheat sawfly",
        35: "cereal northern leaf beetle",
        36: "pentatomidae",
        37: "beet fly",
        38: "flea beetle",
        39: "cabbage army worm",
        40: "beet army worm",
        41: "Beet spot flies",
        42: "meadow moth",
        43: "beet weevil",
        44: "sericaorient alismots chulsky",
        45: "alfalfa weevil",
        46: "flax budworm",
        47: "alfalfa plant bug",
        48: "tarnished plant bug",
        49: "Locustoidea",
        50: "lytta polita",
        51: "legume blister beetle",
        52: "blister beetle",
        53: "therioaphis maculata Buckton",
        54: "odontothrips loti",
        55: "Thrips",
        56: "alfalfa seed chalcid",
        57: "Pieris canidia",
        58: "Apolygus lucorum",
        59: "Limacodidae",
        60: "Viteus vitifolii",
        61: "Colomerus vitis",
        62: "Brevipoalpus lewisi McGregor",
        63: "oides decempunctata",
        64: "Polyphagotars onemus latus",
        65: "Pseudococcus comstocki Kuwana",
        66: "parathrene regalis",
        67: "Ampelophaga",
        68: "Lycorma delicatula",
        69: "Xylotrechus",
        70: "Cicadellidae",
        71: "Miridae",
        72: "Trialeurodes vaporariorum",
        73: "Erythroneura apicalis",
        74: "Papilio xuthus",
        75: "Panonchus citri McGregor",
        76: "Phyllocoptes oleiverus ashmead",
        77: "Icerya purchasi Maskell",
        78: "Unaspis yanonensis",
        79: "Ceroplastes rubens",
        80: "Chrysomphalus aonidum",
        81: "Aleurocanthus spiniferus",
        82: "Tetradacus c Bactrocera minax",
        83: "Dacus dorsalis(Hendel)",
        84: "Bactrocera tsuneonis",
        85: "Prodenia litura",
        86: "Adristyrannus",
        87: "Phyllocnistis citrella Stainton",
        88: "Toxoptera citricidus",
        89: "Toxoptera aurantii",
        90: "Aphis citricola Vander Goot",
        91: "Scirtothrips dorsalis Hood",
        92: "Dasineura sp",
        93: "Lawana imitata Melichar",
        94: "Salurnis marginella Guerr",
        95: "Deporaus marginatus Pascoe",
        96: "Chlumetia transversa",
        97: "Mango flat beak leafhopper",
        98: "Rhytidodera bowrinii white",
        99: "Sternochetus frigidus",
        100: "Cicadellidae",
        101: "Chrysomelidae"
    }
    
    # Format output text
    if detections:
        detection_text = "**Detected Pests:**\n\n"
        for det in detections:
            pest_name = class_names.get(det['class_id'], f"Unknown Pest (Class {det['class_id']})")
            confidence = det['confidence'] * 100
            detection_text += f"- **{pest_name}** (Confidence: {confidence:.1f}%)\n"
    else:
        detection_text = "No pests detected in the image."
    
    # Return both image and text
    if output_image_path.exists():
        return str(output_image_path), detection_text
    else:
        return None, "Error: output image not found"

demo = gr.Blocks()

with demo:
    gr.Markdown("# 🐛 Trinera Pest Detection")
    gr.Markdown("Upload an image to detect pests using YOLOv5")
    
    with gr.Tab("Image Detection"):
        with gr.Row():
            with gr.Column():
                img_input = gr.Image(type="pil", label="Upload Image")
            with gr.Column():
                img_output = gr.Image(label="Detected Output")
                text_output = gr.Textbox(label="Detection Results", lines=5)
        
        img_input.change(detect_image, inputs=img_input, outputs=[img_output, text_output])

demo.launch(server_name="0.0.0.0", server_port=7860)
