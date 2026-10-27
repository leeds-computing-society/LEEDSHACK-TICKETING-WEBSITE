from sqlalchemy import Column, Integer, String, Text, text
from database import Base


class Participant(Base):
    __tablename__ = "participants"

    # Primary key
    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    # =========================
    # Personal information
    # =========================

    first_name = Column(
        String,
        nullable=False
    )

    last_name = Column(
        String,
        nullable=False
    )

    preferred_name = Column(
        String,
        nullable=True
    )

    pronouns = Column(
        String,
        nullable=True
    )

    date_of_birth = Column(
        String,
        nullable=False
    )

    phone_number = Column(
        String,
        nullable=False
    )

    # =========================
    # Location
    # =========================

    country_of_residence = Column(
        String,
        nullable=False
    )

    other_country = Column(
        String,
        nullable=True
    )

    # =========================
    # Education
    # =========================

    university_email = Column(
        String,
        unique=True,
        nullable=False
    )

    university = Column(
        String,
        nullable=False
    )

    level_of_study = Column(
        String,
        nullable=False
    )

    undergraduate_year = Column(
        String,
        nullable=True
    )

    graduation_year = Column(
        String,
        nullable=False
    )

    course = Column(
        String,
        nullable=False
    )

    hackathons_attended = Column(
        String,
        nullable=False
    )

    # =========================
    # Diversity
    # =========================

    gender = Column(
        String,
        nullable=True
    )

    ethnicity = Column(
        String,
        nullable=True
    )

    # =========================
    # Dietary requirements
    # =========================

    vegetarian = Column(
        Integer,
        nullable=False,
        default=0
    )

    vegan = Column(
        Integer,
        nullable=False,
        default=0
    )

    halal = Column(
        Integer,
        nullable=False,
        default=0
    )

    kosher = Column(
        Integer,
        nullable=False,
        default=0
    )

    gluten_free = Column(
        Integer,
        nullable=False,
        default=0
    )

    no_beef = Column(
        Integer,
        nullable=False,
        default=0
    )

    lactose_intolerant = Column(
        Integer,
        nullable=False,
        default=0
    )

    dietary_other = Column(
        Integer,
        nullable=False,
        default=0
    )

    dietary_other_description = Column(
        String,
        nullable=True
    )

    # =========================
    # Event
    # =========================

    tshirt_size = Column(
        String,
        nullable=False
    )

    accessibility_requirements = Column(
        Text,
        nullable=True
    )

    # =========================
    # Social
    # =========================

    github_username = Column(
        String,
        nullable=True
    )

    linkedin_url = Column(
        String,
        nullable=True
    )

    # =========================
    # Team
    # =========================

    linked_team_members = Column(
        Text,
        nullable=True
    )

    # =========================
    # Consent
    # =========================

    mlh_code_of_conduct = Column(
        Integer,
        nullable=False,
        default=0
    )

    mlh_terms = Column(
        Integer,
        nullable=False,
        default=0
    )

    luu_privacy = Column(
        Integer,
        nullable=False,
        default=0
    )

    photography_consent = Column(
        Integer,
        nullable=False,
        default=0
    )

    mlh_emails = Column(
        Integer,
        nullable=False,
        default=0
    )

    sponsor_emails = Column(
        Integer,
        nullable=False,
        default=0
    )

    # =========================
    # Administration
    # =========================

    status = Column(
        String,
        nullable=False,
        default="Pending"
    )

    # =========================
    # Timestamps
    # =========================
    created_at = Column(
        String,
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP")
    )

    updated_at = Column(
        String,
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP")
    )