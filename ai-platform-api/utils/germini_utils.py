import google.generativeai as genai

from utils.env_utils import env

# Create a new instance of the Germini API client
genai.configure(api_key=env.GEMINI_API_KEY)


def transform_to_gemini_style_messages(messages: list[dict[str, str]]):
    system_promt = ""
    assistant_promt = ""
    user_promt = ""
    for message in messages:
        if message["role"] == "system":
            system_promt = message["content"]
        elif message["role"] == "user":
            user_promt = message["content"]
        elif message["role"] == "assistant":
            assistant_promt = message["content"]

    return [
        {
            "role": "user",
            "parts": [
                f"""
    SYSTEM: {system_promt}
    MODEL: {assistant_promt}
    USER: {user_promt}
    """
            ],
        },
    ]
