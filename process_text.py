import sys
import json
import os
os.environ['HF_HUB_DISABLE_SYMLINKS_WARNING'] = '1'
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

# Import model configuration
try:
    from model_config import MODEL_NAME
except ImportError:
    MODEL_NAME = "deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B"  # Default fallback

def process_text(text):
    try:
        # Load the selected model
        model_name = f"deepseek-ai/{MODEL_NAME}"
        tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)
        
        model = AutoModelForCausalLM.from_pretrained(
            model_name,
            trust_remote_code=True,
            torch_dtype=torch.float16,  # Use float16 for better memory efficiency
            device_map="auto"           # Automatically handle device placement
        )
        
        # Prepare a clear prompt that enforces ≤50 words and includes an explicit end token
        prompt = f"""
You are a presentation‐enhancement expert. Please rewrite the following slide text to make it more engaging, clear, and professional. Keep your rewritten version under 50 words, focusing on slide flow.

Original text:
{text}

Enhanced version (≤50 words): <END>
"""
        # Tokenize the prompt
        inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
        
        # Generate with a lower max_new_tokens so the model cannot exceed ~50 words
        eos_token_id = tokenizer.encode("<END>")[0]
        outputs = model.generate(
            **inputs,
            max_new_tokens=80,         # Caps the length to roughly 50 words
            temperature=0.7,
            top_p=0.9,
            repetition_penalty=1.1,
            eos_token_id=eos_token_id, # Stop generation at <END>
            pad_token_id=tokenizer.eos_token_id
        )
        
        # Decode and clean up the output
        processed_text = tokenizer.decode(outputs[0], skip_special_tokens=False)
        
        # Extract the portion after "Enhanced version (≤50 words):"
        if "Enhanced version (≤50 words):" in processed_text:
            enhanced_text = processed_text.split("Enhanced version (≤50 words):")[-1]
            # Remove the <END> marker if present
            enhanced_text = enhanced_text.replace("<END>", "").strip()
        else:
            # Fallback: take everything after the original prompt
            enhanced_text = processed_text.replace(prompt, "").replace("<END>", "").strip()
        
        return enhanced_text
    except Exception as e:
        print(f"Error processing text: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("No text provided", file=sys.stderr)
        sys.exit(1)
        
    text = sys.argv[1]
    result = process_text(text)
    print(result)
