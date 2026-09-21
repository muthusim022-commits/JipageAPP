import { Transaction } from '../types.js';

export class MpesaSmsParser {
  /**
   * Production-grade multi-channel parser. Dynamically extracts banking loan assets,
   * implied counterparties, and un-prefixed validation references.
   */
  static parseSms(text: string, senderHeader: string = 'UNKNOWN'): Transaction {
    const textClean = text.trim().replace(/\s+/g, ' ');
    const textLower = textClean.toLowerCase();
    const senderUpper = senderHeader.trim().toUpperCase();

    // 1. Broad Flexible Floating Amount Extractor Matrix
    const amountRegex = /(?:KSh|Ksh|KES|Ksh\.)\s?([\d,]+(?:\.\d{2})?)/i;
    const amountMatch = textClean.match(amountRegex);
    let amount = 0.0;
    if (amountMatch && amountMatch[1]) {
      const sanitized = amountMatch[1].replace(/,/g, '');
      const parsed = parseFloat(sanitized);
      if (!isNaN(parsed)) {
        amount = parsed;
      }
    }

    // 2. Dynamic Transaction ID Extractor Sequence
    const refRegex = /REF:\s?([A-Z0-9]+)/i;
    const refMatch = textClean.match(refRegex);
    let txId = 'GENERIC_REF';
    if (refMatch && refMatch[1]) {
      txId = refMatch[1];
    } else {
      // Captures standard isolated 9-12 char validation codes (e.g. CB0501900, QK7839210)
      const standaloneRefRegex = /\b([A-Z0-9]{9,12})\b/;
      const standaloneMatch = textClean.match(standaloneRefRegex);
      if (standaloneMatch && standaloneMatch[1]) {
        txId = standaloneMatch[1];
      }
    }

    // 3. Dynamic Channel Tracking Realignment
    let sourceChannel: string;
    if (senderUpper.includes('M-PESA') || senderUpper.includes('MPESA')) {
      sourceChannel = 'MPESA';
    } else if (senderUpper !== 'UNKNOWN' && senderUpper !== '') {
      sourceChannel = `BANK_${senderUpper}`;
    } else {
      sourceChannel =
        textLower.includes('account') || textLower.includes('loan')
          ? 'BANK_SMS'
          : 'MOBILE_MONEY';
    }

    // 4. Contextual Directional & Counterparty Logic
    let txType = 'UNKNOWN';
    let direction: 'INFLOW' | 'OUTFLOW' = 'OUTFLOW';
    let counterparty = 'UNKNOWN';

    const inflowKeywords = ['received', 'credited', 'deposited', 'approved'];
    const outflowKeywords = ['sent to', 'transferred', 'debited', 'paid to', 'buy goods'];

    if (inflowKeywords.some((kw) => textLower.includes(kw))) {
      txType = 'RECEIVE_MONEY';
      direction = 'INFLOW';

      if (textLower.includes('loan')) {
        txType = 'LOAN_DISBURSEMENT';
        counterparty = 'BANK_LOAN_SERVICE';
      } else {
        const fromMatch = textClean.match(
          /from\s+([A-Z0-9\s]+?)(?=\s+on|\s+at|\.|\bvia|\baccount)/i
        );
        counterparty = fromMatch && fromMatch[1] ? fromMatch[1].trim() : 'ACCOUNT_HOLDER_DEPOSIT';
      }
    } else if (outflowKeywords.some((kw) => textLower.includes(kw))) {
      txType = 'TRANSFER_OUT';
      direction = 'OUTFLOW';
      const toMatch = textClean.match(
        /(?:sent to|paid to|transferred to|to)\s+([A-Z0-9\s]+?)(?=\s+on|\s+at|\.|\bvia|\bkes|\bksh)/i
      );
      counterparty = toMatch && toMatch[1] ? toMatch[1].trim() : 'EXTERNAL_RECIPIENT';
    } else if (textLower.includes('airtime')) {
      txType = 'AIRTIME_PURCHASE';
      direction = 'OUTFLOW';
      counterparty = 'TELECOM_PROVIDER';
    }

    return {
      transaction_id: txId,
      source_channel: sourceChannel,
      amount: amount,
      transaction_type: txType,
      direction: direction,
      counterparty: counterparty,
      parsed_at: new Date().toISOString(),
      raw_sms: text,
      sender_header: senderHeader,
    };
  }
}
