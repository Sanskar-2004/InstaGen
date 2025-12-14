"""
Compliance checking service using LLM-based and rule-based approaches.

This module provides text compliance validation against advertising regulations
and platform policies, using both hard rules and optional LLM analysis.
"""

import re
from typing import Dict, List, Tuple
from enum import Enum


class ComplianceStatus(Enum):
    """Compliance check result status."""
    PASSED = "passed"
    FAILED = "failed"
    WARNING = "warning"


# Forbidden terms that trigger immediate failure
FORBIDDEN_TERMS = {
    "money-back guarantee": "Money-back guarantees are not allowed",
    "sustainability": "Sustainability claims require certification",
    "green claims": "Unsubstantiated environmental claims are prohibited",
    "competitions": "Promotional competitions require legal compliance review",
}

# Regex patterns for additional checks
PRICE_PATTERN = re.compile(r"\d+[\$£€]")
EMAIL_PATTERN = re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b")
PHONE_PATTERN = re.compile(r"\b\d{3}[-.]?\d{3}[-.]?\d{4}\b")


def _try_mistral_linting(text: str) -> Tuple[str, List[str]]:
    """
    Attempt to use Mistral-7B for advanced compliance analysis.
    
    Falls back to basic rules if the model is unavailable.
    
    Args:
        text: Text to analyze
        
    Returns:
        Tuple of (analysis_result, detected_issues)
    """
    try:
        # Try to import and use Mistral via common SDK
        from mistralai.client import MistralClient
        from mistralai.models.chat_message import ChatMessage
        
        client = MistralClient()
        messages = [
            ChatMessage(
                role="user",
                content=f"""You are a compliance expert for social media advertising.
Analyze this text for compliance issues related to misleading claims, 
unsubstantiated guarantees, or prohibited statements.
Text: "{text}"

Respond with a JSON object: {{"compliant": true/false, "issues": ["issue1", "issue2"]}}"""
            )
        ]
        
        response = client.chat(messages=messages, model="mistral-7b-instruct")
        result = response.choices[0].message.content
        
        # Parse response (simplified)
        if "compliant" in result.lower() and "false" in result.lower():
            return "failed", ["LLM detected potential compliance issues"]
        return "passed", []
        
    except Exception as e:
        # Mistral not available or error; return None to use fallback
        return None, []


def check_text_compliance(text: str) -> Dict:
    """
    Check text for compliance against advertising regulations.
    
    This function performs:
    1. Hard rule checks for forbidden terms (case-insensitive)
    2. Regex-based detection for prices, emails, phone numbers
    3. Optional LLM-based analysis for nuanced compliance
    
    Args:
        text: Text to check for compliance
        
    Returns:
        Dict with keys:
            - status: "passed", "warning", or "failed"
            - message: Human-readable result message
            - violations: List of specific violations found
            - has_price: Boolean indicating if price detected
            - has_contact: Boolean indicating if contact info detected
    """
    violations = []
    warnings = []
    result = {
        "status": ComplianceStatus.PASSED.value,
        "message": "Text passed compliance check",
        "violations": violations,
        "warnings": warnings,
        "has_price": False,
        "has_contact": False,
    }
    
    # Normalize text for checking
    text_lower = text.lower()
    
    # 1. Check for forbidden terms
    for term, reason in FORBIDDEN_TERMS.items():
        if term in text_lower:
            violations.append(f"Forbidden term '{term}': {reason}")
    
    # 2. Check for prices
    if PRICE_PATTERN.search(text):
        result["has_price"] = True
        # Prices alone are not violations, but noted for context
        warnings.append("Price information detected in text")
    
    # 3. Check for contact information
    has_email = EMAIL_PATTERN.search(text)
    has_phone = PHONE_PATTERN.search(text)
    if has_email or has_phone:
        result["has_contact"] = True
        if has_email:
            warnings.append("Email address detected")
        if has_phone:
            warnings.append("Phone number detected")
    
    # 4. Optional: LLM-based analysis
    llm_result, llm_issues = _try_mistral_linting(text)
    if llm_result == "failed":
        violations.extend(llm_issues)
    elif llm_issues:
        warnings.extend(llm_issues)
    
    # Determine final status
    if violations:
        result["status"] = ComplianceStatus.FAILED.value
        result["message"] = f"Compliance check failed: {len(violations)} violation(s) found"
        result["violations"] = violations
    elif warnings:
        result["status"] = ComplianceStatus.WARNING.value
        result["message"] = f"Compliance check passed with {len(warnings)} warning(s)"
        result["warnings"] = warnings
    
    return result


def batch_check_compliance(texts: List[str]) -> List[Dict]:
    """
    Check compliance for multiple text snippets.
    
    Args:
        texts: List of texts to check
        
    Returns:
        List of compliance check results
    """
    return [check_text_compliance(text) for text in texts]


def validate_ad_copy(text: str) -> Dict:
    """
    Lightweight validation for retail advertising copy.

    Checks for banned phrases and contest-related language.

    Returns a dict:
      - is_compliant: bool
      - messages: list of strings explaining failures
    """
    messages: List[str] = []

    if not text or not text.strip():
        return {"is_compliant": True, "messages": []}

    text_lower = text.lower()

    # Banned phrases (case-insensitive)
    banned_phrases = [
        "money-back guarantee",
        "risk-free",
        "best in class",
        "sustainability",
        "green",
    ]

    for phrase in banned_phrases:
        if phrase in text_lower:
            # Provide a user-friendly message per phrase
            if phrase == "best in class":
                messages.append("Avoid absolute claims like 'Best in class'")
            elif phrase == "money-back guarantee":
                messages.append("Avoid guarantees such as 'Money-back guarantee'")
            elif phrase == "risk-free":
                messages.append("Avoid unverifiable promises like 'Risk-free'")
            elif phrase in ("sustainability", "green"):
                messages.append("Avoid unsubstantiated environmental claims")

    # Regex check for contests/lottery
    contest_pattern = re.compile(r"\b(win|winner|won|lottery|competition|contest)\b", re.IGNORECASE)
    if contest_pattern.search(text):
        messages.append("Contests/lotteries are not allowed in ad copy")

    is_compliant = len(messages) == 0
    return {"is_compliant": is_compliant, "messages": messages}
