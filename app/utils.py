from pypdf import PdfReader
import io

def extract_text_from_pdf(file_content: bytes) -> str:
    """Extract text from PDF file content."""
    try:
        reader = PdfReader(io.BytesIO(file_content))
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text.strip()
    except Exception as e:
        print(f"Error parsing PDF: {e}")
        return ""

def clean_text(text: str) -> str:
    """Basic text cleaning."""
    # Remove extra whitespace
    text = " ".join(text.split())
    return text
