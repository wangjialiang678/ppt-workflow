#!/usr/bin/env python3
"""
Image Forge — 通用图片生成
基于 Gemini Image API，支持多种尺寸和风格。

Usage:
    python generate.py "prompt" output.png [--aspect 1:1] [--size 1K] [--model MODEL]
"""

import argparse
import os
import sys


def main():
    parser = argparse.ArgumentParser(description="Image Forge: Generate images with Gemini")
    parser.add_argument("prompt", help="Image generation prompt")
    parser.add_argument("output", help="Output file path (.png)")
    parser.add_argument("--aspect", default="1:1",
                        choices=["1:1", "2:3", "3:2", "3:4", "4:3", "4:5", "5:4", "9:16", "16:9", "21:9"],
                        help="Aspect ratio (default: 1:1)")
    parser.add_argument("--size", default="1K",
                        choices=["1K", "2K", "4K"],
                        help="Resolution (default: 1K)")
    parser.add_argument("--model", default="gemini-2.5-flash-image",
                        help="Gemini model ID")
    args = parser.parse_args()

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("Error: GEMINI_API_KEY not set. Run: source ~/.claude/api-vault.env", file=sys.stderr)
        sys.exit(1)

    try:
        from google import genai
        from google.genai import types
    except ImportError:
        print("Error: google-genai not installed. Run: pip install google-genai", file=sys.stderr)
        sys.exit(1)

    # Ensure output directory exists
    out_dir = os.path.dirname(args.output)
    if out_dir:
        os.makedirs(out_dir, exist_ok=True)

    client = genai.Client(api_key=api_key)

    print(f"[Image Forge] Generating: '{args.prompt[:80]}...'")
    print(f"  aspect={args.aspect}, size={args.size}, model={args.model}")

    # Build config — some models don't support image_config
    config_kwargs = {'response_modalities': ['TEXT', 'IMAGE']}
    try:
        response = client.models.generate_content(
            model=args.model,
            contents=[args.prompt],
            config=types.GenerateContentConfig(**config_kwargs)
        )
    except Exception as e:
        print(f"Error calling Gemini API: {e}", file=sys.stderr)
        sys.exit(1)

    saved = False
    for part in response.parts:
        if part.inline_data:
            image = part.as_image()
            image.save(args.output)
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
