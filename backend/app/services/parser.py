import re
from datetime import datetime

class MpesaSmsParser:
    @staticmethod
    def parse_sms(text: str, sender_header: str = "UNKNOWN") -> dict:
        """
        Production-grade multi-channel parser. Dynamically extracts banking loan assets,
        implied counterparties, and un-prefixed validation references.
        """
        text_clean = " ".join(text.split())
        text_lower = text_clean.lower()
        sender_upper = sender_header.strip().upper()
        
        # 1. Broad Flexible Floating Amount Extractor Matrix
        amount_pattern = r"(?:KSh|Ksh|KES|Ksh\.)\s?([\d,]+(?:\.\d{2})?)"
        amount_match = re.search(r"(?:KSh|Ksh|KES|Ksh\.)\s?([\d,]+(?:\.\d{2})?)", text_clean)
        amount = float(amount_match.group(1).replace(",", "")) if amount_match else 0.0

        # 2. Dynamic Transaction ID Extractor Sequence
        ref_match = re.search(r"REF:\s?([A-Z0-9]+)", text_clean, re.IGNORECASE)
        if ref_match:
            tx_id = ref_match.group(1)
        else:
            # Captures standard isolated 9-12 char validation codes (e.g. CB0501900)
            standalone_ref = re.search(r"\b([A-Z0-9]{9,12})\b", text_clean)
            tx_id = standalone_ref.group(1) if standalone_ref else "GENERIC_REF"

        # 3. Dynamic Channel Tracking Realignment
        if "M-PESA" in sender_upper or "MPESA" in sender_upper:
            source_channel = "MPESA"
        elif sender_upper != "UNKNOWN" and sender_upper != "":
            source_channel = f"BANK_{sender_upper}"
        else:
            source_channel = "BANK_SMS" if "account" in text_lower or "loan" in text_lower else "MOBILE_MONEY"

        # 4. Contextual Directional & Counterparty Logic 
        tx_type = "UNKNOWN"
        direction = "OUTFLOW"
        counterparty = "UNKNOWN"

        # Auto-detect Loan credits or standard structural deposits
        if any(kw in text_lower for kw in ["received", "credited", "deposited", "approved"]):
            tx_type = "RECEIVE_MONEY"
            direction = "INFLOW"
            
            if "loan" in text_lower:
                tx_type = "LOAN_DISBURSEMENT"
                counterparty = "BANK_LOAN_SERVICE"
            else:
                from_match = re.search(r"from\s+([A-Z0-9\s]+?)(?=\s+on|\s+at|\.|\bvia|\baccount)", text_clean, re.IGNORECASE)
                counterparty = from_match.group(1).strip() if from_match else "ACCOUNT_HOLDER_DEPOSIT"

        elif any(kw in text_lower for kw in ["sent to", "transferred", "debited", "paid to", "buy goods"]):
            tx_type = "TRANSFER_OUT"
            direction = "OUTFLOW"
            to_match = re.search(r"(?:sent to|paid to|transferred to|to)\s+([A-Z0-9\s]+?)(?=\s+on|\s+at|\.|\bvia|\bkes|\bksh)", text_clean, re.IGNORECASE)
            counterparty = to_match.group(1).strip() if to_match else "EXTERNAL_RECIPIENT"
        
        elif "airtime" in text_lower:
            tx_type = "AIRTIME_PURCHASE"
            direction = "OUTFLOW"
            counterparty = "TELECOM_PROVIDER"

        return {
            "transaction_id": tx_id,
            "source_channel": source_channel,
            "amount": amount,
            "transaction_type": tx_type,
            "direction": direction,
            "counterparty": counterparty,
            "parsed_at": datetime.now().isoformat()
        }
