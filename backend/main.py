from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow frontend (localhost & Railway)
origins = [
    "http://localhost:5173",   # local dev
    "https://your-frontend.vercel.app",  # replace with your frontend deployment
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,   # or ["*"] to allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
