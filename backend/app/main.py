from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from app.services.parser import MpesaSmsParser

app = FastAPI(title="JipageApp API", description="Data Analytics & Expense Engine")

# Define what data the API endpoint expects to receive
class SmsPayload(BaseModel):
    sms_content: str

@app.get("/")
def read_root():
    return {"status": "JipageApp Backend is Running"}

@app.post("/api/v1/parse-sms")
def parse_sms_log(payload: SmsPayload):
    if not payload.sms_content:
        raise HTTPException(status_code=400, detail="SMS content cannot be empty")
        
    structured_data = MpesaSmsParser.parse_sms(payload.sms_content)
    return {"success": True, "data": structured_data}
