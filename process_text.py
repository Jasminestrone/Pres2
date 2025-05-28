import sys
import json
import os
os.environ['HF_HUB_DISABLE_SYMLINKS_WARNING'] = '1'
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

def process_text(text):
    try:
        # Load the DeepSeek model
        model_name = "deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B"
        tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)
        
        model = AutoModelForCausalLM.from_pretrained(
            model_name,
            trust_remote_code=True,
            torch_dtype=torch.float16,  # Use float16 for better memory efficiency
            device_map="auto"  # Automatically handle device placement
        )
        
        # Prepare the prompt
        prompt = f"""You are a presentation enhancement expert. Please improve the following presentation text storyline to make it more engaging, clear, and professional, give this feedback in a clear and consise way considering how every slide works together. Your repsonse must be less then 50 words:

Original text:
{text}

Enhanced version:"""
        
        # Generate the enhanced text
        inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
        outputs = model.generate(
            **inputs,
            max_new_tokens=512,
            temperature=0.7,
            top_p=0.9,
            repetition_penalty=1.1,
            do_sample=True
        )
        
        # Decode and clean up the output
        processed_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        # Extract only the enhanced version (remove the prompt)
        enhanced_text = processed_text.split("Enhanced version:")[-1].strip()
        
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