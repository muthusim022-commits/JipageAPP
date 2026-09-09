from fastapi import FastAPI

app = FastAPI(title="JipageApp API")

@app.get("/")
def read_root():
    return {"status": "JipageApp Backend is Running"}