import io
import re
import logging
from typing import Tuple

logger = logging.getLogger("resume_parser")

class ResumeParser:
    @staticmethod
    def extract_text_from_pdf(file_bytes: bytes) -> str:
        try:
            import pypdf
            reader = pypdf.PdfReader(io.BytesIO(file_bytes))
            text_parts = []
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text)
            return "\n".join(text_parts).strip()
        except Exception as e:
            logger.error(f"Error parsing PDF with pypdf: {e}")
            # Fallback simple string extraction
            try:
                raw = file_bytes.decode("utf-8", errors="ignore")
                printable = "".join([c for c in raw if c.isprintable() or c in "\n\r\t"])
                return printable[:10000]
            except Exception:
                return ""

    @staticmethod
    def extract_text_from_docx(file_bytes: bytes) -> str:
        try:
            import docx
            doc = docx.Document(io.BytesIO(file_bytes))
            paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
            for table in doc.tables:
                for row in table.rows:
                    for cell in row.cells:
                        if cell.text.strip():
                            paragraphs.append(cell.text.strip())
            return "\n".join(paragraphs).strip()
        except Exception as e:
            logger.error(f"Error parsing DOCX: {e}")
            try:
                raw = file_bytes.decode("utf-8", errors="ignore")
                return "".join([c for c in raw if c.isprintable() or c in "\n\r\t"])[:10000]
            except Exception:
                return ""

    @classmethod
    def parse_resume(cls, filename: str, file_bytes: bytes) -> Tuple[str, str]:
        """Returns (extracted_text, file_type)."""
        lower_name = filename.lower()
        if lower_name.endswith(".pdf"):
            text = cls.extract_text_from_pdf(file_bytes)
            return text, "pdf"
        elif lower_name.endswith(".docx") or lower_name.endswith(".doc"):
            text = cls.extract_text_from_docx(file_bytes)
            return text, "docx"
        elif lower_name.endswith(".txt"):
            text = file_bytes.decode("utf-8", errors="ignore")
            return text, "txt"
        else:
            # Try PDF then fallback to txt
            try:
                text = cls.extract_text_from_pdf(file_bytes)
                if text:
                    return text, "pdf"
            except Exception:
                pass
            return file_bytes.decode("utf-8", errors="ignore"), "unknown"

resume_parser = ResumeParser()
