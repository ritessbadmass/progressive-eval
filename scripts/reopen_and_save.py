from pptx import Presentation

try:
    print("Attempting to open and re-save the presentation...")
    prs = Presentation("NL_Claude_TrustEvaluators.pptx")
    prs.save("NL_Claude_TrustEvaluators.pptx")
    print("Re-saved successfully!")
except Exception as e:
    print(f"Error: {e}")
