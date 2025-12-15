from __future__ import annotations

import io
import json
from typing import Any, Dict

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator

app = FastAPI(title="Qiskit Runner API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class RunRequest(BaseModel):
    code: str
    shots: int = 256


@app.post("/run")
async def run_code(req: RunRequest) -> Dict[str, Any]:
    """
    Execute user-provided Python/Qiskit code in-process and return counts/stdout.
    Not hardened for untrusted use. For workshop/demo only.
    """
    buf = io.StringIO()
    stdout = buf
    stderr = buf

    # Controlled globals to avoid leaking server modules
    glb: Dict[str, Any] = {}

    try:
        exec(req.code, glb)
    except Exception as exc:  # noqa: BLE001
        return {"error": f"exec failed: {exc}", "stdout": buf.getvalue()}

    qc = glb.get("qc")
    if qc is None or not isinstance(qc, QuantumCircuit):
        return {
            "stdout": buf.getvalue(),
            "error": "No QuantumCircuit named 'qc' was created. Define qc before running.",
        }

    # Ensure classical bits for readout
    if qc.num_clbits == 0:
        qc = qc.copy()
        qc.measure_all()

    # Simulate
    try:
        sim = AerSimulator()
        job = sim.run(qc, shots=req.shots)
        result = job.result()
        counts = result.get_counts()
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=f"Simulation failed: {exc}")

    return {"stdout": buf.getvalue(), "counts": counts}


@app.get("/health")
async def health() -> Dict[str, str]:
    return {"status": "ok"}
