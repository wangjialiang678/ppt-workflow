#!/usr/bin/env python3
"""
Image Forge — 图片编辑/精修
基于 Gemini Image API，支持对已有图片进行 AI 编辑。

Usage:
    python edit.py input.png "editing instruction" output.png [--aspect RATIO] [--model MODEL]
"""

import argparse
import os
import sys


def main():
    parser = argparse.ArgumentParser(description="Image Forge: Edit images with Gemini")
    parser.add_argument("input", help="Input image file path")
    parser.add_argument("prompt", help="Editing instruction")
    parser.add_argument("output", help="Output file path (.png)")
    parser.add_argument("--aspect", default=None,
                        choices=["1:1", "2:3", "3:2", "3:4", "4:3", "4:5", "5:4", "9:16", "16:9", "21:9"],
                        help="Output aspect ratio (default: preserve original)")
    parser.add_argument("--model", default="gemini-2.5-flash-image",
                        help="Gemini model ID")
    args = parser.parse_args()

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("Error: GEMINI_API_KEY not set. Run: source ~/.claude/api-vault.env", file=sys.stderr)
        sys.exit(1)

    if not os.path.exists(args.input):
        print(f"Error: Input file not found: {args.input}", file=sys.stderr)
        sys.exit(1)

    try:
        from google import genai
        from google.genai import types
        from PIL import Image
    except ImportError as e:
        missing = "google-genai" if "genai" in str(e) else "Pillow"
        print(f"Error: {missing} not installed", file=sys.stderr)
        sys.exit(1)

    out_dir = os.path.dirname(args.output)
    if out_dir:
        os.makedirs(out_dir, exist_ok=True)

    client = genai.Client(api_key=api_key)
    img = Image.open(args.input)

    print(f"[Image Forge] Editing: '{args.input}'")
    print(f"  Instruction: '{args.prompt[:80]}'")

    config_kwargs = {'response_modalities': ['TEXT', 'IMAGE']}
    if args.aspect:
        config_kwargs['image_config'] = types.ImageConfig(aspect_ratio=args.aspect)

    try:
        response = client.models.generate_content(
            model=args.model,
            contents=[args.prompt, img],
            config=types.GenerateContentConfig(**config_kwargs)
        )
    except Exception as e:
        print(f"Error calling Gemini API: {e}", file=sys.stderr)
        sys.exit(1)

    saved = False
    for part in response.parts:
        if part.inline_data:
            result = part.as_image()
            result.save(args.output)
            print(f"[OK] Saved: {args.output}")
            saved = True
            break
        elif part.text:
            print(f"[Model]: {part.text}")

    if not saved:
        print("Error: No image in response", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
