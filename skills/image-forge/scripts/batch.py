#!/usr/bin/env python3
"""
Image Forge — 批量生成多个变体
从 YAML 文件读取多组提示词，批量生成图片。适合 Logo 设计多方案对比。

Usage:
    python batch.py --prompts prompts.yaml --output-dir ./logos/ [--aspect 1:1] [--size 1K]
    python batch.py --prompt "base prompt" --variations 5 --output-dir ./logos/

YAML format:
    - name: geometric
      prompt: "flat vector abstract logo mark..."
    - name: pictorial
      prompt: "flat vector logo of a microphone..."
"""

import argparse
import os
import sys
import time


def main():
    parser = argparse.ArgumentParser(description="Image Forge: Batch generate image variations")
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--prompts", help="YAML file with named prompts")
    group.add_argument("--prompt", help="Single prompt to generate variations of")
    parser.add_argument("--variations", type=int, default=3,
                        help="Number of variations when using --prompt (default: 3)")
    parser.add_argument("--output-dir", required=True, help="Output directory")
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
        print("Error: GEMINI_API_KEY not set", file=sys.stderr)
        sys.exit(1)

    try:
        from google import genai
        from google.genai import types
    except ImportError:
        print("Error: google-genai not installed", file=sys.stderr)
        sys.exit(1)

    os.makedirs(args.output_dir, exist_ok=True)
    client = genai.Client(api_key=api_key)

    # Build prompt list
    prompts = []
    if args.prompts:
        import yaml
        with open(args.prompts) as f:
            data = yaml.safe_load(f)
        for item in data:
            prompts.append((item['name'], item['prompt']))
    else:
        for i in range(args.variations):
            prompts.append((f"v{i+1}", args.prompt))

    print(f"[Image Forge] Batch generating {len(prompts)} images...")
    print(f"  Output: {args.output_dir}")
    print()

    results = []
    for idx, (name, prompt) in enumerate(prompts):
        output_path = os.path.join(args.output_dir, f"{name}.png")
        print(f"  [{idx+1}/{len(prompts)}] {name}: '{prompt[:60]}...'")

        try:
            response = client.models.generate_content(
                model=args.model,
                contents=[prompt],
                config=types.GenerateContentConfig(
                    response_modalities=['TEXT', 'IMAGE'],
                    image_config=types.ImageConfig(
                        aspect_ratio=args.aspect,
                        image_size=args.size
                    )
                )
            )

            saved = False
            for part in response.parts:
                if part.inline_data:
                    image = part.as_image()
                    image.save(output_path)
                    print(f"    [OK] {output_path}")
                    results.append((name, output_path, True))
                    saved = True
                    break
                elif part.text:
                    print(f"    [Model]: {part.text[:100]}")

            if not saved:
                print(f"    [FAIL] No image generated")
                results.append((name, output_path, False))

        except Exception as e:
            print(f"    [ERROR] {e}")
            results.append((name, output_path, False))

        # Rate limiting: Gemini free tier = 5 RPM
        if idx < len(prompts) - 1:
            time.sleep(13)

    # Summary
    print(f"\n[Summary]")
    ok = sum(1 for _, _, s in results if s)
    print(f"  Generated: {ok}/{len(results)}")
    for name, path, success in results:
        status = "OK" if success else "FAIL"
        print(f"  [{status}] {name} → {path}")


if __name__ == "__main__":
    main()
