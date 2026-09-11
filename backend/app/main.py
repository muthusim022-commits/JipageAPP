from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from app.services.parser import MpesaSmsParser
from app.services.analytics import JipageAnalyticsEngine

app = FastAPI(title="JipageApp API", description="Data Analytics & Expense Engine")

class SmsPayload(BaseModel):
    sms_content: str
    sender_header: str = "UNKNOWN" # Dynamic input parameter from phone metadata

@app.get("/")
def read_root():
    return {"status": "JipageApp Backend is Running"}

@app.post("/api/v1/parse-sms")
def parse_sms_log(payload: SmsPayload):
    if not payload.sms_content:
        raise HTTPException(status_code=400, detail="SMS content cannot be empty")
        
    structured_data = MpesaSmsParser.parse_sms(payload.sms_content, payload.sender_header)
    return {"success": True, "data": structured_data}

# Keep your previous analytics payload block below...
class AnalyticsPayload(BaseModel):
    historical_transactions: list
    user_goals: dict

@app.post("/api/v1/analytics/predictive-summary")
def generate_predictive_summary(payload: AnalyticsPayload):
    analysis_results = JipageAnalyticsEngine.run_predictive_flow(
        payload.historical_transactions,
        payload.user_goals
    )
    return {"success": True, "results": analysis_results}
