# backend/main.py
from fastapi import FastAPI

app = FastAPI()  # 👈 THIS must exist

@app.get("/")
def read_root():
    return {"message": "Hello, world! Backend is running 🚀"}
