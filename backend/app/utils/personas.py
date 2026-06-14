DEFAULT_PERSONAS = [
    {
        "id": "persona_1",
        "name": "Jordan",
        "role": "Tech-savvy Gen-Z Student",
        "age": 21,
        "background": "Computer science student, early adopter, lives on TikTok and Discord. Always looking for the next big thing.",
        "values": ["innovation", "social features", "aesthetics", "speed"],
        "pain_points": ["boring UIs", "slow apps", "privacy concerns", "high prices"],
        "communication_style": "Casual, uses slang, quick to form opinions, easily bored",
    },
    {
        "id": "persona_2",
        "name": "Maria",
        "role": "Budget-conscious Working Parent",
        "age": 38,
        "background": "Works full-time in healthcare, two kids, manages a tight budget. Values efficiency above all.",
        "values": ["value for money", "time-saving", "reliability", "family-friendly"],
        "pain_points": ["subscription fatigue", "complex onboarding", "no free tier", "time wasters"],
        "communication_style": "Practical, asks about costs first, values simplicity, no-nonsense",
    },
    {
        "id": "persona_3",
        "name": "Derek",
        "role": "Skeptical Industry Veteran",
        "age": 52,
        "background": "20+ years in product management. Has seen countless startups fail. Hard to impress but respects solid execution.",
        "values": ["proven track record", "clear business model", "scalability", "differentiation"],
        "pain_points": ["vaporware", "buzzword-heavy pitches", "no moat", "ignoring competition"],
        "communication_style": "Direct, analytical, asks tough questions, references industry history",
    },
    {
        "id": "persona_4",
        "name": "Priya",
        "role": "Accessibility-focused Designer",
        "age": 29,
        "background": "UX designer specializing in inclusive design. Advocates for underrepresented users. Design-systems thinker.",
        "values": ["accessibility", "inclusive design", "user research", "design consistency"],
        "pain_points": ["inaccessible interfaces", "dark patterns", "ignoring edge cases", "visual-only feedback"],
        "communication_style": "Thoughtful, brings up edge cases others miss, references WCAG guidelines",
    },
    {
        "id": "persona_5",
        "name": "Marcus",
        "role": "Early-adopter Entrepreneur",
        "age": 34,
        "background": "Founded two startups (one exit, one failure). Angel investor. Always evaluating market potential.",
        "values": ["market timing", "growth potential", "network effects", "monetization"],
        "pain_points": ["unclear GTM strategy", "feature bloat", "no viral loop", "weak positioning"],
        "communication_style": "Energetic, thinks in terms of TAM/SAM, references competitor landscapes",
    },
]


def persona_config_to_dict(config) -> dict:
    """Convert a PersonaConfig pydantic model to the internal dict format."""
    return {
        "id": f"persona_{config.name.lower().replace(' ', '_')}",
        "name": config.name,
        "role": config.role,
        "age": 30,
        "background": config.background or f"A person whose role is: {config.role}",
        "values": config.values or ["quality", "reliability"],
        "pain_points": config.pain_points or ["poor experiences", "wasted time"],
        "communication_style": config.communication_style or "Direct and thoughtful",
    }
