from gftools.Lib.gftools.fonts_public_pb2 import FamilyProto
from google.protobuf import text_format
from google.protobuf import json_format
from pathlib import Path
from typing import List, Dict
from json import loads, dump
from time import sleep
import requests
from tqdm import tqdm


font = str
weight = int
style = str
full_name = str
variant = Dict[style, Dict[weight, full_name]]
Fonts = Dict[font, variant]


def parse_protobufs() -> List[str]:
    protobufs = list(Path("./fonts").glob("**/*.pb"))
    jsons = []

    for protobuf in protobufs:
        text = protobuf.read_text()
        try:
            message = FamilyProto()
            text_format.Merge(text, message, allow_unknown_field=True)  # type: ignore
            json_data = json_format.MessageToJson(message)  # type: ignore
            jsons.append(json_data)
        except Exception:
            continue
    return jsons


extract_errors = 0


def extract_fonts(metadata: List[str]):
    fonts: Fonts = {}

    for meta in metadata:
        meta = loads(meta)
        try:
            variants = meta["fonts"]
        except KeyError:
            global extract_errors
            extract_errors += 1
            continue
        for variant in variants:
            font_name_exact: str = variant["name"]
            font_name = font_name_exact.replace(" ", "")
            try:
                font = fonts[font_name]
            except KeyError:
                fonts[font_name] = {}
                font = fonts[font_name]
            try:
                style = font[variant["style"]]
            except KeyError:
                font[variant["style"]] = {}
                style = font[variant["style"]]

            style[variant["weight"]] = font_name_exact
    return fonts


def save_to_json(json, file_name="fonts.json"):
    with open(file_name, "w") as json_file:
        dump(
            json,
            json_file,
            indent=None,
            separators=(",", ":"),
        )


def class_name(font_name: str, font_style: str, font_weight: int):
    font_name = font_name.replace(" ", "")
    if font_style == "italic":
        font_style = "i"
    if font_style == "normal":
        font_style = ""
    clazz = f".font-{font_name}-{font_weight}"
    if font_style == "i":
        return f"{clazz}-i"
    return clazz


def create_utils(fonts: Fonts):
    utils = {}
    for font_name in fonts.keys():
        variants = fonts[font_name]
        for font_style in variants.keys():
            variant = variants[font_style]
            for font_weight, exact_name in variant.items():
                utils[class_name(font_name, font_style, font_weight)] = {
                    "font-family": exact_name,
                    "font-weight": font_weight,
                    "font-style": "italic" if font_style == "i" else "normal",
                }
    return utils


def font_face_url(font_name: str, font_style: str, font_weight: int):
    url = f"https://fonts.googleapis.com/css2?family={font_name.replace(' ', '+')}"
    if font_style == "i":
        url += ":ital,wght@"
        url += f"1,{font_weight}"
    else:
        url += ":wght@"
        url += f"{font_weight}"
    return url


def create_font_faces(fonts: Fonts, utils: dict):
    font_faces = {}
    with tqdm(total=len(utils.keys())) as pbar:
        for font_name in fonts.keys():
            variants = fonts[font_name]
            for font_style in variants.keys():
                variant = variants[font_style]
                for font_weight, exact_name in variant.items():
                    sleep(0.05)
                    clazz = class_name(font_name, font_style, font_weight)
                    url = font_face_url(exact_name, font_style, font_weight)
                    req = requests.get(url)
                    if req.status_code != 200:
                        print(f"{url=}")
                        print(f"{req.status_code=}")
                        pbar.update(1)
                        continue
                    font_faces[clazz] = req.text
                    pbar.update(1)
    return font_faces


def delete_missing(font_faces: Dict[str, str], utils: Dict[str, str]):
    util_keys = list(utils.keys())
    for clazz in util_keys:
        if clazz not in font_faces.keys():
            del utils[clazz]
    return utils


if __name__ == "__main__":
    jsons = parse_protobufs()
    fonts = extract_fonts(jsons)
    print(f"{extract_errors=}")
    utils = create_utils(fonts)
    font_faces = create_font_faces(fonts, utils)
    save_to_json(font_faces, "fonts.json")
    utils = delete_missing(font_faces, utils)
    save_to_json(utils, "utils.json")
