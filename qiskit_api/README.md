# Qiskit Runner API (demo)

Simple FastAPI service to execute small Qiskit circuits and return shot counts for the frontend.

> ⚠️ Not hardened for untrusted code. Use only for workshop/demo contexts.

## Endpoints
- `POST /run` `{ code: str, shots?: int }` → `{ stdout, counts?, error? }`
- `GET /health`

## Local run
```bash
cd qiskit_api
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8000
```

## Docker
```bash
cd qiskit_api
docker build -t qiskit-api .
docker run -p 8000:8000 qiskit-api
```

## Deploy (Render free web service example)
1. Create a new Web Service from this folder.
2. Environment: Python 3.11, build command `pip install -r requirements.txt`, start command `uvicorn app:app --host 0.0.0.0 --port 8000`.
3. Get the public URL (e.g., `https://qiskit-api.onrender.com/run`).
4. In the frontend, set the API endpoint field to that URL.

## Security
- Executes arbitrary Python; do not expose publicly without sandboxing.
- Limit shots and circuit size if opening beyond a controlled classroom.
