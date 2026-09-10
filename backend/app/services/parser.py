import re
from datetime import datetime

class MpesaSmsParser:
    @staticmethod
    def parse_sms(text: str) -> dict:
        """
        Parses raw M-Pesa SMS alerts into structured financial data elements.
        Supports both Send Money, Receive Money, and Merchant payments.
        """
        # Patterns for common M-Pesa notifications
        tx_id_pattern = r"^([A-Z0-9]{10})\b"
        amount_pattern = r"(?:KSh|Ksh)\s?([\d,]+\.\d{2})"
        date_pattern = r"on\s(\d{1,2}/\d{1,2}/\d{2})"
        time_pattern = r"at\s(\d{1,2}:\d{2}\s?[APM]{2})"

        # 1. Extract Transaction ID
        tx_id_match = re.search(tx_id_pattern, text)
        tx_id = tx_id_match.group(1) if tx_id_match else None

        # 2. Extract Amount
        amount_match = re.search(amount_pattern, text)
        amount = float(amount_match.group(1).replace(",", "")) if amount_match else 0.0

        # 3. Determine Transaction Type & Direction
        tx_type = "UNKNOWN"
        direction = "OUTFLOW" # Default assumption
        
        if "Received" in text or "received" in text:
            tx_type = "RECEIVE_MONEY"
            direction = "INFLOW"
        elif "sent to" in text or "Sent to" in text:
            tx_type = "SEND_MONEY"
        elif "Paid to" in text or "paid to" in text:
            tx_type = "MERCHANT_PAYMENT"
        elif "Give KSh" in text or "Withdraw" in text:
            tx_type = "WITHDRAWAL"

        # 4. Extract Timestamp strings (Mocking defaults if pattern fails)
        date_match = re.search(date_pattern, text)
        time_match = re.search(time_pattern, text)
        
        timestamp_str = f"{date_match.group(1) if date_match else '1/1/26'} {time_match.group(1) if time_match else '12:00 PM'}"

        return {
            "transaction_id": tx_id,
            "amount": amount,
            "transaction_type": tx_type,
            "direction": direction,
            "parsed_at": datetime.now().isoformat(),
            "raw_text_length": len(text)
        }
