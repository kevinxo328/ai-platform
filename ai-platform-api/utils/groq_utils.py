from groq import Groq
from utils.env_utils import env

groq = Groq(api_key=env.GROQ_API_KEY)
