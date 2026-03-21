from pipeline.verifier import get_model, verify_claim
from pipeline.retriever import search_evidence
from dotenv import load_dotenv

load_dotenv()
model = get_model()

test_cases = [
    {'claim': 'The Eiffel Tower is located in Paris France', 'expected': 'TRUE'},
    {'claim': 'The Eiffel Tower was completed in 1889', 'expected': 'TRUE'},
    {'claim': 'Water boils at 100 degrees Celsius at sea level', 'expected': 'TRUE'},
    {'claim': 'Apple Inc was founded in 1976', 'expected': 'TRUE'},
    {'claim': 'The Great Wall of China is clearly visible from space', 'expected': 'FALSE'},
    {'claim': 'Thomas Edison built the Eiffel Tower', 'expected': 'FALSE'},
]

with open('accuracy_out.txt', 'w') as f:
    for tc in test_cases:
        ev = search_evidence(tc['claim'])
        res = verify_claim(tc['claim'], ev, model)
        f.write(f"{tc['claim']} -> Expected: {tc['expected']} Got: {res['verdict']} Reason: {res['reasoning']}\n")
