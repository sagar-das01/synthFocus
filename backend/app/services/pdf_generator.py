import io
import re

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer


def generate_report_pdf(concept: str, report_markdown: str) -> io.BytesIO:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=inch,
        rightMargin=inch,
        topMargin=inch,
        bottomMargin=inch,
    )
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(
        "SectionHeading",
        parent=styles["Heading2"],
        textColor=HexColor("#4338ca"),
        spaceAfter=8,
    ))
    styles.add(ParagraphStyle(
        "Bullet",
        parent=styles["BodyText"],
        leftIndent=20,
        bulletIndent=10,
        spaceBefore=2,
        spaceAfter=2,
    ))

    story = []
    story.append(Paragraph("SynthFocus Report", styles["Title"]))
    story.append(Spacer(1, 12))
    story.append(Paragraph(f"<b>Concept:</b> {_escape(concept)}", styles["BodyText"]))
    story.append(Spacer(1, 24))

    for line in report_markdown.split("\n"):
        if line.startswith("## "):
            story.append(Spacer(1, 12))
            story.append(Paragraph(_escape(line[3:]), styles["SectionHeading"]))
        elif line.startswith("# "):
            story.append(Spacer(1, 16))
            story.append(Paragraph(_escape(line[2:]), styles["Heading1"]))
        elif line.startswith("- ") or line.startswith("* "):
            story.append(Paragraph(f"• {_escape(line[2:])}", styles["Bullet"]))
        elif re.match(r"^\d+\.\s", line):
            story.append(Paragraph(_escape(line), styles["BodyText"]))
        elif line.startswith("**") and line.endswith("**"):
            story.append(Paragraph(f"<b>{_escape(line[2:-2])}</b>", styles["BodyText"]))
        elif line.strip():
            story.append(Paragraph(_escape(line), styles["BodyText"]))
        else:
            story.append(Spacer(1, 6))

    doc.build(story)
    buffer.seek(0)
    return buffer


def _escape(text: str) -> str:
    return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
